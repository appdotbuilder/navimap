
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable } from '../db/schema';
import { type CreateUserInput } from '../schema';
import { createUser } from '../handlers/create_user';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: CreateUserInput = {
  username: 'testuser',
  email: 'test@example.com',
  avatar_url: 'https://example.com/avatar.jpg'
};

describe('createUser', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a user', async () => {
    const result = await createUser(testInput);

    // Basic field validation
    expect(result.username).toEqual('testuser');
    expect(result.email).toEqual('test@example.com');
    expect(result.avatar_url).toEqual('https://example.com/avatar.jpg');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save user to database', async () => {
    const result = await createUser(testInput);

    // Query using proper drizzle syntax
    const users = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, result.id))
      .execute();

    expect(users).toHaveLength(1);
    expect(users[0].username).toEqual('testuser');
    expect(users[0].email).toEqual('test@example.com');
    expect(users[0].avatar_url).toEqual('https://example.com/avatar.jpg');
    expect(users[0].created_at).toBeInstanceOf(Date);
    expect(users[0].updated_at).toBeInstanceOf(Date);
  });

  it('should create a user without avatar_url', async () => {
    const inputWithoutAvatar = {
      username: 'testuser2',
      email: 'test2@example.com'
    };

    const result = await createUser(inputWithoutAvatar);

    expect(result.username).toEqual('testuser2');
    expect(result.email).toEqual('test2@example.com');
    expect(result.avatar_url).toBeNull();
    expect(result.id).toBeDefined();
  });

  it('should enforce unique username constraint', async () => {
    await createUser(testInput);

    const duplicateInput = {
      username: 'testuser', // Same username
      email: 'different@example.com'
    };

    await expect(createUser(duplicateInput)).rejects.toThrow(/unique/i);
  });

  it('should enforce unique email constraint', async () => {
    await createUser(testInput);

    const duplicateInput = {
      username: 'differentuser',
      email: 'test@example.com' // Same email
    };

    await expect(createUser(duplicateInput)).rejects.toThrow(/unique/i);
  });
});
