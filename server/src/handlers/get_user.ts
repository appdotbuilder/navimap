
import { db } from '../db';
import { usersTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type User } from '../schema';

export const getUser = async (id: number): Promise<User | null> => {
  try {
    const result = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .execute();

    if (result.length === 0) {
      return null;
    }

    return result[0];
  } catch (error) {
    console.error('Get user failed:', error);
    throw error;
  }
};
