
import { db } from '../db';
import { markersTable } from '../db/schema';
import { eq } from 'drizzle-orm';

export const deleteMarker = async (id: number): Promise<boolean> => {
  try {
    const result = await db.delete(markersTable)
      .where(eq(markersTable.id, id))
      .returning()
      .execute();

    // Check if any rows were returned (marker was found and deleted)
    return result.length > 0;
  } catch (error) {
    console.error('Marker deletion failed:', error);
    throw error;
  }
};
