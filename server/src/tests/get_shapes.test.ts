
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, shapesTable } from '../db/schema';
import { type CreateUserInput, type CreateShapeInput } from '../schema';
import { getShapes } from '../handlers/get_shapes';

// Test data
const testUser: CreateUserInput = {
  username: 'testuser',
  email: 'test@example.com',
  avatar_url: null
};

const testUser2: CreateUserInput = {
  username: 'testuser2',
  email: 'test2@example.com',
  avatar_url: null
};

const testShape1Data = {
  shape_type: 'polygon' as const,
  coordinates: JSON.stringify([
    [40.7128, -74.0060],
    [40.7614, -73.9776],
    [40.7505, -73.9934]
  ]),
  style: JSON.stringify({ color: '#FF0000', strokeWidth: 2 }),
  name: 'Test Polygon',
  description: 'A test polygon shape'
};

const testShape2Data = {
  shape_type: 'circle' as const,
  coordinates: JSON.stringify({ center: [40.7829, -73.9654], radius: 1000 }),
  style: JSON.stringify({ color: '#00FF00', fillOpacity: 0.5 }),
  name: 'Test Circle',
  description: 'A test circle shape'
};

describe('getShapes', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no shapes exist', async () => {
    const result = await getShapes();
    expect(result).toEqual([]);
  });

  it('should return all shapes when no filter is provided', async () => {
    // Create test users first
    const users = await db.insert(usersTable)
      .values([testUser, testUser2])
      .returning()
      .execute();

    // Create test shapes one by one to ensure different timestamps
    const shape1 = await db.insert(shapesTable)
      .values([{
        user_id: users[0].id,
        ...testShape1Data
      }])
      .returning()
      .execute();

    // Small delay to ensure different timestamp
    await new Promise(resolve => setTimeout(resolve, 1));

    const shape2 = await db.insert(shapesTable)
      .values([{
        user_id: users[1].id,
        ...testShape2Data
      }])
      .returning()
      .execute();

    const result = await getShapes();

    expect(result).toHaveLength(2);
    
    // Find the shapes by name since order might vary
    const polygonShape = result.find(s => s.name === 'Test Polygon');
    const circleShape = result.find(s => s.name === 'Test Circle');

    expect(polygonShape).toBeDefined();
    expect(polygonShape?.shape_type).toEqual('polygon');
    expect(polygonShape?.coordinates).toEqual(testShape1Data.coordinates);
    expect(polygonShape?.style).toEqual(testShape1Data.style);
    expect(polygonShape?.description).toEqual('A test polygon shape');
    expect(polygonShape?.created_at).toBeInstanceOf(Date);
    expect(polygonShape?.updated_at).toBeInstanceOf(Date);

    expect(circleShape).toBeDefined();
    expect(circleShape?.shape_type).toEqual('circle');
    expect(circleShape?.coordinates).toEqual(testShape2Data.coordinates);
    expect(circleShape?.style).toEqual(testShape2Data.style);
    expect(circleShape?.description).toEqual('A test circle shape');
    expect(circleShape?.created_at).toBeInstanceOf(Date);
    expect(circleShape?.updated_at).toBeInstanceOf(Date);
  });

  it('should filter shapes by user_id', async () => {
    // Create test users first
    const users = await db.insert(usersTable)
      .values([testUser, testUser2])
      .returning()
      .execute();

    // Create test shapes for different users
    await db.insert(shapesTable)
      .values([
        {
          user_id: users[0].id,
          ...testShape1Data
        },
        {
          user_id: users[1].id,
          ...testShape2Data
        }
      ])
      .execute();

    const result = await getShapes({ user_id: users[0].id });

    expect(result).toHaveLength(1);
    expect(result[0].user_id).toEqual(users[0].id);
    expect(result[0].name).toEqual('Test Polygon');
    expect(result[0].shape_type).toEqual('polygon');
  });

  it('should return empty array for non-existent user_id', async () => {
    // Create test user
    const users = await db.insert(usersTable)
      .values([testUser])
      .returning()
      .execute();

    // Create test shape
    await db.insert(shapesTable)
      .values([{
        user_id: users[0].id,
        ...testShape1Data
      }])
      .execute();

    const result = await getShapes({ user_id: 999 });
    expect(result).toEqual([]);
  });

  it('should handle shapes with null optional fields', async () => {
    // Create test user
    const users = await db.insert(usersTable)
      .values([testUser])
      .returning()
      .execute();

    // Create shape with minimal data
    await db.insert(shapesTable)
      .values([{
        user_id: users[0].id,
        shape_type: 'polyline',
        coordinates: JSON.stringify([[40.7128, -74.0060], [40.7614, -73.9776]]),
        style: '{}', // Default empty style
        name: null,
        description: null
      }])
      .execute();

    const result = await getShapes({ user_id: users[0].id });

    expect(result).toHaveLength(1);
    expect(result[0].name).toBeNull();
    expect(result[0].description).toBeNull();
    expect(result[0].shape_type).toEqual('polyline');
    expect(result[0].coordinates).toEqual(JSON.stringify([[40.7128, -74.0060], [40.7614, -73.9776]]));
    expect(result[0].style).toEqual('{}');
  });

  it('should handle bounds filter parameter', async () => {
    // Create test user
    const users = await db.insert(usersTable)
      .values([testUser])
      .returning()
      .execute();

    // Create test shape
    await db.insert(shapesTable)
      .values([{
        user_id: users[0].id,
        ...testShape1Data
      }])
      .execute();

    // Test with bounds (note: current implementation doesn't filter by bounds yet)
    const result = await getShapes({
      user_id: users[0].id,
      bounds: {
        north: 41.0,
        south: 40.0,
        east: -73.0,
        west: -75.0
      }
    });

    expect(result).toHaveLength(1);
    expect(result[0].name).toEqual('Test Polygon');
  });
});
