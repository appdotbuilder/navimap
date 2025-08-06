
import { db } from '../db';
import { shapesTable } from '../db/schema';
import { eq } from 'drizzle-orm';

export const deleteShape = async (id: number): Promise<boolean> => {
  try {
    const result = await db.delete(shapesTable)
      .where(eq(shapesTable.id, id))
      .execute();

    // Return true if a row was deleted, false if no matching shape was found
    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error('Shape deletion failed:', error);
    throw error;
  }
};
