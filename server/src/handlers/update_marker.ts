
import { db } from '../db';
import { markersTable } from '../db/schema';
import { type UpdateMarkerInput, type Marker } from '../schema';
import { eq } from 'drizzle-orm';

export const updateMarker = async (input: UpdateMarkerInput): Promise<Marker> => {
  try {
    // Build update object with only provided fields
    const updateData: Partial<typeof markersTable.$inferInsert> = {
      updated_at: new Date()
    };

    if (input.title !== undefined) {
      updateData.title = input.title;
    }
    if (input.description !== undefined) {
      updateData.description = input.description;
    }
    if (input.color !== undefined) {
      updateData.color = input.color;
    }
    if (input.icon !== undefined) {
      updateData.icon = input.icon;
    }

    // Update marker record
    const result = await db.update(markersTable)
      .set(updateData)
      .where(eq(markersTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Marker with id ${input.id} not found`);
    }

    // Convert numeric fields back to numbers before returning
    const marker = result[0];
    return {
      ...marker,
      latitude: parseFloat(marker.latitude),
      longitude: parseFloat(marker.longitude)
    };
  } catch (error) {
    console.error('Marker update failed:', error);
    throw error;
  }
};
