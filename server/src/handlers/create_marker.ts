
import { db } from '../db';
import { markersTable } from '../db/schema';
import { type CreateMarkerInput, type Marker } from '../schema';

export const createMarker = async (input: CreateMarkerInput): Promise<Marker> => {
  try {
    // Insert marker record
    const result = await db.insert(markersTable)
      .values({
        user_id: input.user_id,
        latitude: input.latitude.toString(), // Convert number to string for numeric column
        longitude: input.longitude.toString(), // Convert number to string for numeric column
        title: input.title,
        description: input.description || null,
        color: input.color || '#FF0000',
        icon: input.icon || null
      })
      .returning()
      .execute();

    // Convert numeric fields back to numbers before returning
    const marker = result[0];
    return {
      ...marker,
      latitude: parseFloat(marker.latitude), // Convert string back to number
      longitude: parseFloat(marker.longitude) // Convert string back to number
    };
  } catch (error) {
    console.error('Marker creation failed:', error);
    throw error;
  }
};
