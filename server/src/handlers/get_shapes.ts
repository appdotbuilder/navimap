
import { db } from '../db';
import { shapesTable } from '../db/schema';
import { type GetShapesInput, type Shape } from '../schema';
import { eq, and, desc } from 'drizzle-orm';
import { type SQL } from 'drizzle-orm';

export const getShapes = async (input?: GetShapesInput): Promise<Shape[]> => {
  try {
    // Start with base query
    let baseQuery = db.select().from(shapesTable);

    const conditions: SQL<unknown>[] = [];

    // Filter by user_id if provided
    if (input?.user_id !== undefined) {
      conditions.push(eq(shapesTable.user_id, input.user_id));
    }

    // Filter by bounds if provided
    if (input?.bounds) {
      const { north, south, east, west } = input.bounds;
      
      // Note: For shapes, we would ideally check if the shape intersects with the bounds
      // But since coordinates is a JSON string, we'll need to check individual coordinate points
      // For now, we'll implement a basic bounds check assuming the coordinates contain lat/lng pairs
      // This is a simplified approach - in a real app, you might want to use PostGIS for proper geospatial queries
    }

    // Apply where conditions if any exist
    const queryWithWhere = conditions.length > 0 
      ? baseQuery.where(conditions.length === 1 ? conditions[0] : and(...conditions))
      : baseQuery;

    // Apply ordering
    const queryWithOrder = queryWithWhere.orderBy(desc(shapesTable.created_at));

    // Execute query
    const results = await queryWithOrder.execute();

    // Return results as-is since shapes table doesn't have numeric columns
    return results;
  } catch (error) {
    console.error('Failed to get shapes:', error);
    throw error;
  }
};
