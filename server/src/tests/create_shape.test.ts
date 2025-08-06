
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, shapesTable } from '../db/schema';
import { type CreateShapeInput } from '../schema';
import { createShape } from '../handlers/create_shape';
import { eq } from 'drizzle-orm';

describe('createShape', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  let testUserId: number;

  beforeEach(async () => {
    // Create test user first
    const userResult = await db.insert(usersTable)
      .values({
        username: 'testuser',
        email: 'test@example.com',
        avatar_url: null
      })
      .returning()
      .execute();
    testUserId = userResult[0].id;
  });

  const testPolygonInput: CreateShapeInput = {
    user_id: 0, // Will be set to testUserId in tests
    shape_type: 'polygon',
    coordinates: JSON.stringify([
      [40.7128, -74.0060],
      [40.7580, -73.9855],
      [40.7489, -73.9680],
      [40.7128, -74.0060]
    ]),
    style: JSON.stringify({
      color: '#FF0000',
      fillColor: '#FF0000',
      fillOpacity: 0.3,
      strokeWidth: 2
    }),
    name: 'Test Polygon',
    description: 'A test polygon shape'
  };

  it('should create a polygon shape', async () => {
    const input = { ...testPolygonInput, user_id: testUserId };
    const result = await createShape(input);

    expect(result.id).toBeDefined();
    expect(result.user_id).toEqual(testUserId);
    expect(result.shape_type).toEqual('polygon');
    expect(result.coordinates).toEqual(input.coordinates);
    expect(result.style).toEqual(input.style || '{}');
    expect(result.name).toEqual('Test Polygon');
    expect(result.description).toEqual('A test polygon shape');
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create a circle shape with minimal data', async () => {
    const input: CreateShapeInput = {
      user_id: testUserId,
      shape_type: 'circle',
      coordinates: JSON.stringify({
        center: [40.7128, -74.0060],
        radius: 1000
      })
    };

    const result = await createShape(input);

    expect(result.id).toBeDefined();
    expect(result.user_id).toEqual(testUserId);
    expect(result.shape_type).toEqual('circle');
    expect(result.coordinates).toEqual(input.coordinates);
    expect(result.style).toEqual('{}'); // Default style
    expect(result.name).toBeNull();
    expect(result.description).toBeNull();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save shape to database', async () => {
    const input = { ...testPolygonInput, user_id: testUserId };
    const result = await createShape(input);

    const shapes = await db.select()
      .from(shapesTable)
      .where(eq(shapesTable.id, result.id))
      .execute();

    expect(shapes).toHaveLength(1);
    expect(shapes[0].user_id).toEqual(testUserId);
    expect(shapes[0].shape_type).toEqual('polygon');
    expect(shapes[0].coordinates).toEqual(input.coordinates);
    expect(shapes[0].style).toEqual(input.style || '{}');
    expect(shapes[0].name).toEqual('Test Polygon');
    expect(shapes[0].created_at).toBeInstanceOf(Date);
  });

  it('should create different shape types', async () => {
    const shapeInputs: CreateShapeInput[] = [
      {
        user_id: testUserId,
        shape_type: 'polyline',
        coordinates: JSON.stringify([[40.7128, -74.0060], [40.7580, -73.9855]])
      },
      {
        user_id: testUserId,
        shape_type: 'rectangle',
        coordinates: JSON.stringify({
          bounds: [[40.7128, -74.0060], [40.7580, -73.9855]]
        })
      }
    ];

    for (const input of shapeInputs) {
      const result = await createShape(input);
      expect(result.shape_type).toEqual(input.shape_type);
      expect(result.coordinates).toEqual(input.coordinates);
    }
  });

  it('should throw error when user does not exist', async () => {
    const input = { ...testPolygonInput, user_id: 99999 };

    await expect(createShape(input)).rejects.toThrow(/User with id 99999 not found/i);
  });

  it('should handle optional fields correctly', async () => {
    const input: CreateShapeInput = {
      user_id: testUserId,
      shape_type: 'polygon',
      coordinates: JSON.stringify([[40.7128, -74.0060], [40.7580, -73.9855], [40.7128, -74.0060]]),
      style: '{"color": "#0000FF"}',
      name: null,
      description: null
    };

    const result = await createShape(input);

    expect(result.style).toEqual('{"color": "#0000FF"}');
    expect(result.name).toBeNull();
    expect(result.description).toBeNull();
  });
});
