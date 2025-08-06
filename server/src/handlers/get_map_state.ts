
import { db } from '../db';
import { mapStatesTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type MapState } from '../schema';

export async function getMapState(userId: number): Promise<MapState | null> {
  try {
    const results = await db.select()
      .from(mapStatesTable)
      .where(eq(mapStatesTable.user_id, userId))
      .execute();

    if (results.length === 0) {
      return null;
    }

    const mapState = results[0];
    
    // Convert numeric fields back to numbers for the schema
    return {
      ...mapState,
      center_latitude: parseFloat(mapState.center_latitude),
      center_longitude: parseFloat(mapState.center_longitude)
    };
  } catch (error) {
    console.error('Get map state failed:', error);
    throw error;
  }
}
