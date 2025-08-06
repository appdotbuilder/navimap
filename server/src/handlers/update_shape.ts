
import { db } from '../db';
import { shapesTable } from '../db/schema';
import { type UpdateShapeInput, type Shape } from '../schema';
import { eq } from 'drizzle-orm';

export const updateShape = async (input: UpdateShapeInput): Promise<Shape> => {
  try {
    // Build update object with only provided fields
    const updateData: Partial<typeof shapesTable.$inferInsert> = {
      updated_at: new Date()
    };

    if (input.coordinates !== undefined) {
      updateData.coordinates = input.coordinates;
    }

    if (input.style !== undefined) {
      updateData.style = input.style;
    }

    if (input.name !== undefined) {
      updateData.name = input.name;
    }

    if (input.description !== undefined) {
      updateData.description = input.description;
    }

    // Update shape record
    const result = await db.update(shapesTable)
      .set(updateData)
      .where(eq(shapesTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Shape with id ${input.id} not found`);
    }

    // Convert numeric fields back to numbers before returning
    const shape = result[0];
    return {
      ...shape,
      user_id: shape.user_id
    };
  } catch (error) {
    console.error('Shape update failed:', error);
    throw error;
  }
};
