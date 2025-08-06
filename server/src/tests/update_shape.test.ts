
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, shapesTable } from '../db/schema';
import { type UpdateShapeInput, type CreateUserInput } from '../schema';
import { updateShape } from '../handlers/update_shape';
import { eq } from 'drizzle-orm';

// Test user data
const testUser: CreateUserInput = {
  username: 'testuser',
  email: 'test@example.com',
  avatar_url: null
};

describe('updateShape', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update shape coordinates', async () => {
    // Create user
    const userResult = await db.insert(usersTable)
      .values(testUser)
      .returning()
      .execute();
    const user = userResult[0];

    // Create shape
    const shapeResult = await db.insert(shapesTable)
      .values({
        user_id: user.id,
        shape_type: 'polygon',
        coordinates: '[[0,0],[1,1],[1,0],[0,0]]',
        style: '{"color": "red"}',
        name: 'Original Shape',
        description: 'Original description'
      })
      .returning()
      .execute();
    const originalShape = shapeResult[0];

    const updateInput: UpdateShapeInput = {
      id: originalShape.id,
      coordinates: '[[0,0],[2,2],[2,0],[0,0]]'
    };

    const result = await updateShape(updateInput);

    expect(result.id).toEqual(originalShape.id);
    expect(result.coordinates).toEqual('[[0,0],[2,2],[2,0],[0,0]]');
    expect(result.style).toEqual('{"color": "red"}');
    expect(result.name).toEqual('Original Shape');
    expect(result.description).toEqual('Original description');
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at > originalShape.updated_at).toBe(true);
  });

  it('should update shape style', async () => {
    // Create user
    const userResult = await db.insert(usersTable)
      .values(testUser)
      .returning()
      .execute();
    const user = userResult[0];

    // Create shape
    const shapeResult = await db.insert(shapesTable)
      .values({
        user_id: user.id,
        shape_type: 'circle',
        coordinates: '[50.0, 10.0, 1000]',
        style: '{"color": "blue"}',
        name: 'Circle Shape'
      })
      .returning()
      .execute();
    const originalShape = shapeResult[0];

    const updateInput: UpdateShapeInput = {
      id: originalShape.id,
      style: '{"color": "green", "strokeWidth": 3}'
    };

    const result = await updateShape(updateInput);

    expect(result.style).toEqual('{"color": "green", "strokeWidth": 3}');
    expect(result.coordinates).toEqual('[50.0, 10.0, 1000]');
    expect(result.name).toEqual('Circle Shape');
  });

  it('should update shape name and description', async () => {
    // Create user
    const userResult = await db.insert(usersTable)
      .values(testUser)
      .returning()
      .execute();
    const user = userResult[0];

    // Create shape
    const shapeResult = await db.insert(shapesTable)
      .values({
        user_id: user.id,
        shape_type: 'rectangle',
        coordinates: '[[0,0],[10,10]]',
        name: 'Old Name',
        description: 'Old description'
      })
      .returning()
      .execute();
    const originalShape = shapeResult[0];

    const updateInput: UpdateShapeInput = {
      id: originalShape.id,
      name: 'Updated Name',
      description: 'Updated description'
    };

    const result = await updateShape(updateInput);

    expect(result.name).toEqual('Updated Name');
    expect(result.description).toEqual('Updated description');
    expect(result.coordinates).toEqual('[[0,0],[10,10]]');
    expect(result.style).toEqual('{}');
  });

  it('should update multiple fields at once', async () => {
    // Create user
    const userResult = await db.insert(usersTable)
      .values(testUser)
      .returning()
      .execute();
    const user = userResult[0];

    // Create shape
    const shapeResult = await db.insert(shapesTable)
      .values({
        user_id: user.id,
        shape_type: 'polyline',
        coordinates: '[[0,0],[5,5]]',
        style: '{"color": "red"}',
        name: 'Line',
        description: 'A line'
      })
      .returning()
      .execute();
    const originalShape = shapeResult[0];

    const updateInput: UpdateShapeInput = {
      id: originalShape.id,
      coordinates: '[[0,0],[10,10],[20,0]]',
      style: '{"color": "purple", "strokeWidth": 5}',
      name: 'Updated Line',
      description: 'An updated line'
    };

    const result = await updateShape(updateInput);

    expect(result.coordinates).toEqual('[[0,0],[10,10],[20,0]]');
    expect(result.style).toEqual('{"color": "purple", "strokeWidth": 5}');
    expect(result.name).toEqual('Updated Line');
    expect(result.description).toEqual('An updated line');
  });

  it('should save updated shape to database', async () => {
    // Create user
    const userResult = await db.insert(usersTable)
      .values(testUser)
      .returning()
      .execute();
    const user = userResult[0];

    // Create shape
    const shapeResult = await db.insert(shapesTable)
      .values({
        user_id: user.id,
        shape_type: 'polygon',
        coordinates: '[[0,0],[1,1]]',
        name: 'Test Shape'
      })
      .returning()
      .execute();
    const originalShape = shapeResult[0];

    const updateInput: UpdateShapeInput = {
      id: originalShape.id,
      name: 'Database Updated'
    };

    const result = await updateShape(updateInput);

    // Verify in database
    const shapes = await db.select()
      .from(shapesTable)
      .where(eq(shapesTable.id, result.id))
      .execute();

    expect(shapes).toHaveLength(1);
    expect(shapes[0].name).toEqual('Database Updated');
    expect(shapes[0].coordinates).toEqual('[[0,0],[1,1]]');
    expect(shapes[0].updated_at).toBeInstanceOf(Date);
  });

  it('should handle nullable fields correctly', async () => {
    // Create user
    const userResult = await db.insert(usersTable)
      .values(testUser)
      .returning()
      .execute();
    const user = userResult[0];

    // Create shape
    const shapeResult = await db.insert(shapesTable)
      .values({
        user_id: user.id,
        shape_type: 'circle',
        coordinates: '[0,0,100]',
        name: 'Named Shape',
        description: 'Has description'
      })
      .returning()
      .execute();
    const originalShape = shapeResult[0];

    const updateInput: UpdateShapeInput = {
      id: originalShape.id,
      name: null,
      description: null
    };

    const result = await updateShape(updateInput);

    expect(result.name).toBeNull();
    expect(result.description).toBeNull();
    expect(result.coordinates).toEqual('[0,0,100]');
  });

  it('should throw error for non-existent shape', async () => {
    const updateInput: UpdateShapeInput = {
      id: 99999,
      name: 'Non-existent'
    };

    expect(updateShape(updateInput)).rejects.toThrow(/not found/i);
  });
});
