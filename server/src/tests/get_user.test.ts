
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable } from '../db/schema';
import { getUser } from '../handlers/get_user';

describe('getUser', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return user when user exists', async () => {
    // Create a test user
    const result = await db.insert(usersTable)
      .values({
        username: 'testuser',
        email: 'test@example.com',
        avatar_url: 'https://example.com/avatar.jpg'
      })
      .returning()
      .execute();

    const createdUser = result[0];

    // Get the user by ID
    const user = await getUser(createdUser.id);

    expect(user).not.toBeNull();
    expect(user!.id).toEqual(createdUser.id);
    expect(user!.username).toEqual('testuser');
    expect(user!.email).toEqual('test@example.com');
    expect(user!.avatar_url).toEqual('https://example.com/avatar.jpg');
    expect(user!.created_at).toBeInstanceOf(Date);
    expect(user!.updated_at).toBeInstanceOf(Date);
  });

  it('should return null when user does not exist', async () => {
    const user = await getUser(999);

    expect(user).toBeNull();
  });

  it('should return user with null avatar_url when avatar_url is null', async () => {
    // Create a test user without avatar_url
    const result = await db.insert(usersTable)
      .values({
        username: 'testuser2',
        email: 'test2@example.com',
        avatar_url: null
      })
      .returning()
      .execute();

    const createdUser = result[0];

    // Get the user by ID
    const user = await getUser(createdUser.id);

    expect(user).not.toBeNull();
    expect(user!.avatar_url).toBeNull();
    expect(user!.username).toEqual('testuser2');
    expect(user!.email).toEqual('test2@example.com');
  });
});
