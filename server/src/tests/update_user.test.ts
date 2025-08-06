
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable } from '../db/schema';
import { type CreateUserInput, type UpdateUserInput } from '../schema';
import { updateUser } from '../handlers/update_user';
import { eq } from 'drizzle-orm';

// Test users
const testUser: CreateUserInput = {
  username: 'testuser',
  email: 'test@example.com',
  avatar_url: 'https://example.com/avatar.jpg'
};

const createTestUser = async () => {
  const result = await db.insert(usersTable)
    .values({
      username: testUser.username,
      email: testUser.email,
      avatar_url: testUser.avatar_url
    })
    .returning()
    .execute();
  return result[0];
};

describe('updateUser', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update user with all fields', async () => {
    const createdUser = await createTestUser();
    
    const updateInput: UpdateUserInput = {
      id: createdUser.id,
      username: 'updateduser',
      email: 'updated@example.com',
      avatar_url: 'https://example.com/new-avatar.jpg'
    };

    const result = await updateUser(updateInput);

    expect(result.id).toEqual(createdUser.id);
    expect(result.username).toEqual('updateduser');
    expect(result.email).toEqual('updated@example.com');
    expect(result.avatar_url).toEqual('https://example.com/new-avatar.jpg');
    expect(result.created_at).toEqual(createdUser.created_at);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at > createdUser.updated_at).toBe(true);
  });

  it('should update only provided fields', async () => {
    const createdUser = await createTestUser();
    
    const updateInput: UpdateUserInput = {
      id: createdUser.id,
      username: 'partialupdate'
    };

    const result = await updateUser(updateInput);

    expect(result.username).toEqual('partialupdate');
    expect(result.email).toEqual(createdUser.email); // Should remain unchanged
    expect(result.avatar_url).toEqual(createdUser.avatar_url); // Should remain unchanged
    expect(result.updated_at > createdUser.updated_at).toBe(true);
  });

  it('should update user with null avatar_url', async () => {
    const createdUser = await createTestUser();
    
    const updateInput: UpdateUserInput = {
      id: createdUser.id,
      avatar_url: null
    };

    const result = await updateUser(updateInput);

    expect(result.avatar_url).toBeNull();
    expect(result.username).toEqual(createdUser.username); // Should remain unchanged
    expect(result.email).toEqual(createdUser.email); // Should remain unchanged
  });

  it('should save changes to database', async () => {
    const createdUser = await createTestUser();
    
    const updateInput: UpdateUserInput = {
      id: createdUser.id,
      username: 'dbtest',
      email: 'dbtest@example.com'
    };

    await updateUser(updateInput);

    // Verify changes in database
    const users = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, createdUser.id))
      .execute();

    expect(users).toHaveLength(1);
    expect(users[0].username).toEqual('dbtest');
    expect(users[0].email).toEqual('dbtest@example.com');
    expect(users[0].updated_at).toBeInstanceOf(Date);
    expect(users[0].updated_at > createdUser.updated_at).toBe(true);
  });

  it('should throw error when user not found', async () => {
    const updateInput: UpdateUserInput = {
      id: 99999, // Non-existent ID
      username: 'notfound'
    };

    expect(updateUser(updateInput)).rejects.toThrow(/user with id 99999 not found/i);
  });

  it('should handle unique constraint violations', async () => {
    // Create two test users
    const user1 = await createTestUser();
    const user2 = await db.insert(usersTable)
      .values({
        username: 'user2',
        email: 'user2@example.com'
      })
      .returning()
      .execute();

    // Try to update user2 with user1's email (should fail due to unique constraint)
    const updateInput: UpdateUserInput = {
      id: user2[0].id,
      email: user1.email // This should cause unique constraint violation
    };

    expect(updateUser(updateInput)).rejects.toThrow();
  });
});
