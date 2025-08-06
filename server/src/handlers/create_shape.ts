
import { db } from '../db';
import { shapesTable, usersTable } from '../db/schema';
import { type CreateShapeInput, type Shape } from '../schema';
import { eq } from 'drizzle-orm';

export const createShape = async (input: CreateShapeInput): Promise<Shape> => {
  try {
    // Verify user exists to prevent foreign key constraint violation
    const existingUser = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, input.user_id))
      .execute();

    if (existingUser.length === 0) {
      throw new Error(`User with id ${input.user_id} not found`);
    }

    // Insert shape record
    const result = await db.insert(shapesTable)
      .values({
        user_id: input.user_id,
        shape_type: input.shape_type,
        coordinates: input.coordinates,
        style: input.style || '{}',
        name: input.name || null,
        description: input.description || null
      })
      .returning()
      .execute();

    const shape = result[0];
    return {
      ...shape,
      // Handle potential null values properly
      name: shape.name || null,
      description: shape.description || null
    };
  } catch (error) {
    console.error('Shape creation failed:', error);
    throw error;
  }
};
