
import { db } from '../db';
import { markersTable } from '../db/schema';
import { type GetMarkersInput, type Marker } from '../schema';
import { eq, and, gte, lte, SQL } from 'drizzle-orm';

export async function getMarkers(input?: GetMarkersInput): Promise<Marker[]> {
  try {
    const conditions: SQL<unknown>[] = [];

    // Filter by user_id if provided
    if (input?.user_id) {
      conditions.push(eq(markersTable.user_id, input.user_id));
    }

    // Filter by bounds if provided
    if (input?.bounds) {
      const { north, south, east, west } = input.bounds;
      
      conditions.push(
        gte(markersTable.latitude, south.toString()),
        lte(markersTable.latitude, north.toString()),
        gte(markersTable.longitude, west.toString()),
        lte(markersTable.longitude, east.toString())
      );
    }

    // Build and execute query
    let results;
    if (conditions.length === 0) {
      results = await db.select().from(markersTable).execute();
    } else if (conditions.length === 1) {
      results = await db.select().from(markersTable).where(conditions[0]).execute();
    } else {
      results = await db.select().from(markersTable).where(and(...conditions)).execute();
    }

    // Convert numeric fields back to numbers
    return results.map(marker => ({
      ...marker,
      latitude: parseFloat(marker.latitude),
      longitude: parseFloat(marker.longitude)
    }));
  } catch (error) {
    console.error('Failed to get markers:', error);
    throw error;
  }
}
