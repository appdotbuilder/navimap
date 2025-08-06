
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, shapesTable } from '../db/schema';
import { deleteShape } from '../handlers/delete_shape';
import { eq } from 'drizzle-orm';

describe('deleteShape', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing shape', async () => {
    // Create prerequisite user
    const userResult = await db.insert(usersTable)
      .values({
        username: 'testuser',
        email: 'test@example.com'
      })
      .returning()
      .execute();

    const userId = userResult[0].id;

    // Create test shape
    const shapeResult = await db.insert(shapesTable)
      .values({
        user_id: userId,
        shape_type: 'polygon',
        coordinates: '[[0,0],[1,1],[0,1],[0,0]]',
        style: '{"color": "#FF0000"}',
        name: 'Test Shape',
        description: 'A test shape'
      })
      .returning()
      .execute();

    const shapeId = shapeResult[0].id;

    // Delete the shape
    const result = await deleteShape(shapeId);

    expect(result).toBe(true);

    // Verify shape was deleted from database
    const shapes = await db.select()
      .from(shapesTable)
      .where(eq(shapesTable.id, shapeId))
      .execute();

    expect(shapes).toHaveLength(0);
  });

  it('should return false when shape does not exist', async () => {
    const nonExistentId = 99999;

    const result = await deleteShape(nonExistentId);

    expect(result).toBe(false);
  });

  it('should not affect other shapes when deleting one', async () => {
    // Create prerequisite user
    const userResult = await db.insert(usersTable)
      .values({
        username: 'testuser',
        email: 'test@example.com'
      })
      .returning()
      .execute();

    const userId = userResult[0].id;

    // Create two test shapes
    const shape1Result = await db.insert(shapesTable)
      .values({
        user_id: userId,
        shape_type: 'polygon',
        coordinates: '[[0,0],[1,1],[0,1],[0,0]]',
        style: '{"color": "#FF0000"}',
        name: 'Shape 1'
      })
      .returning()
      .execute();

    const shape2Result = await db.insert(shapesTable)
      .values({
        user_id: userId,
        shape_type: 'circle',
        coordinates: '[[2,2]]',
        style: '{"color": "#00FF00"}',
        name: 'Shape 2'
      })
      .returning()
      .execute();

    const shape1Id = shape1Result[0].id;
    const shape2Id = shape2Result[0].id;

    // Delete only the first shape
    const result = await deleteShape(shape1Id);

    expect(result).toBe(true);

    // Verify first shape was deleted
    const deletedShapes = await db.select()
      .from(shapesTable)
      .where(eq(shapesTable.id, shape1Id))
      .execute();

    expect(deletedShapes).toHaveLength(0);

    // Verify second shape still exists
    const remainingShapes = await db.select()
      .from(shapesTable)
      .where(eq(shapesTable.id, shape2Id))
      .execute();

    expect(remainingShapes).toHaveLength(1);
    expect(remainingShapes[0].name).toEqual('Shape 2');
  });
});
