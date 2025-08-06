
import { db } from '../db';
import { mapStatesTable } from '../db/schema';
import { type SaveMapStateInput, type MapState } from '../schema';
import { sql } from 'drizzle-orm';

export const saveMapState = async (input: SaveMapStateInput): Promise<MapState> => {
  try {
    // Use upsert (INSERT ... ON CONFLICT) to either insert new or update existing map state
    const result = await db.insert(mapStatesTable)
      .values({
        user_id: input.user_id,
        center_latitude: input.center_latitude.toString(), // Convert number to string for numeric column
        center_longitude: input.center_longitude.toString(), // Convert number to string for numeric column
        zoom_level: input.zoom_level,
        active_basemap: input.active_basemap,
        updated_at: sql`NOW()` // Update timestamp on conflict
      })
      .onConflictDoUpdate({
        target: mapStatesTable.user_id,
        set: {
          center_latitude: input.center_latitude.toString(),
          center_longitude: input.center_longitude.toString(),
          zoom_level: input.zoom_level,
          active_basemap: input.active_basemap,
          updated_at: sql`NOW()`
        }
      })
      .returning()
      .execute();

    // Convert numeric fields back to numbers before returning
    const mapState = result[0];
    return {
      ...mapState,
      center_latitude: parseFloat(mapState.center_latitude), // Convert string back to number
      center_longitude: parseFloat(mapState.center_longitude) // Convert string back to number
    };
  } catch (error) {
    console.error('Map state save failed:', error);
    throw error;
  }
};
