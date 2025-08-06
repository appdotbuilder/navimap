
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, markersTable } from '../db/schema';
import { type GetMarkersInput } from '../schema';
import { getMarkers } from '../handlers/get_markers';

describe('getMarkers', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return all markers when no filters provided', async () => {
    // Create test user
    const userResult = await db.insert(usersTable)
      .values({
        username: 'testuser',
        email: 'test@example.com'
      })
      .returning()
      .execute();
    const userId = userResult[0].id;

    // Create test markers
    await db.insert(markersTable)
      .values([
        {
          user_id: userId,
          latitude: '40.7128',
          longitude: '-74.0060',
          title: 'New York'
        },
        {
          user_id: userId,
          latitude: '34.0522',
          longitude: '-118.2437',
          title: 'Los Angeles'
        }
      ])
      .execute();

    const result = await getMarkers();

    expect(result).toHaveLength(2);
    expect(result[0].title).toEqual('New York');
    expect(result[0].latitude).toEqual(40.7128);
    expect(result[0].longitude).toEqual(-74.0060);
    expect(typeof result[0].latitude).toBe('number');
    expect(typeof result[0].longitude).toBe('number');
    expect(result[0].user_id).toEqual(userId);
    expect(result[0].id).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);
  });

  it('should filter markers by user_id', async () => {
    // Create test users
    const user1Result = await db.insert(usersTable)
      .values({
        username: 'user1',
        email: 'user1@example.com'
      })
      .returning()
      .execute();
    const user1Id = user1Result[0].id;

    const user2Result = await db.insert(usersTable)
      .values({
        username: 'user2',
        email: 'user2@example.com'
      })
      .returning()
      .execute();
    const user2Id = user2Result[0].id;

    // Create markers for both users
    await db.insert(markersTable)
      .values([
        {
          user_id: user1Id,
          latitude: '40.7128',
          longitude: '-74.0060',
          title: 'User 1 Marker'
        },
        {
          user_id: user2Id,
          latitude: '34.0522',
          longitude: '-118.2437',
          title: 'User 2 Marker'
        }
      ])
      .execute();

    const input: GetMarkersInput = {
      user_id: user1Id
    };

    const result = await getMarkers(input);

    expect(result).toHaveLength(1);
    expect(result[0].title).toEqual('User 1 Marker');
    expect(result[0].user_id).toEqual(user1Id);
  });

  it('should filter markers by bounds', async () => {
    // Create test user
    const userResult = await db.insert(usersTable)
      .values({
        username: 'testuser',
        email: 'test@example.com'
      })
      .returning()
      .execute();
    const userId = userResult[0].id;

    // Create markers at different coordinates
    await db.insert(markersTable)
      .values([
        {
          user_id: userId,
          latitude: '40.7128', // Inside bounds
          longitude: '-74.0060',
          title: 'Inside Marker'
        },
        {
          user_id: userId,
          latitude: '50.0000', // Outside bounds
          longitude: '-100.0000',
          title: 'Outside Marker'
        }
      ])
      .execute();

    const input: GetMarkersInput = {
      bounds: {
        north: 41.0,
        south: 40.0,
        east: -73.0,
        west: -75.0
      }
    };

    const result = await getMarkers(input);

    expect(result).toHaveLength(1);
    expect(result[0].title).toEqual('Inside Marker');
    expect(result[0].latitude).toEqual(40.7128);
    expect(result[0].longitude).toEqual(-74.0060);
  });

  it('should filter markers by both user_id and bounds', async () => {
    // Create test users
    const user1Result = await db.insert(usersTable)
      .values({
        username: 'user1',
        email: 'user1@example.com'
      })
      .returning()
      .execute();
    const user1Id = user1Result[0].id;

    const user2Result = await db.insert(usersTable)
      .values({
        username: 'user2',
        email: 'user2@example.com'
      })
      .returning()
      .execute();
    const user2Id = user2Result[0].id;

    // Create markers for both users
    await db.insert(markersTable)
      .values([
        {
          user_id: user1Id,
          latitude: '40.7128', // Inside bounds
          longitude: '-74.0060',
          title: 'User 1 Inside'
        },
        {
          user_id: user1Id,
          latitude: '50.0000', // Outside bounds
          longitude: '-100.0000',
          title: 'User 1 Outside'
        },
        {
          user_id: user2Id,
          latitude: '40.5000', // Inside bounds but different user
          longitude: '-74.5000',
          title: 'User 2 Inside'
        }
      ])
      .execute();

    const input: GetMarkersInput = {
      user_id: user1Id,
      bounds: {
        north: 41.0,
        south: 40.0,
        east: -73.0,
        west: -75.0
      }
    };

    const result = await getMarkers(input);

    expect(result).toHaveLength(1);
    expect(result[0].title).toEqual('User 1 Inside');
    expect(result[0].user_id).toEqual(user1Id);
    expect(result[0].latitude).toEqual(40.7128);
    expect(result[0].longitude).toEqual(-74.0060);
  });

  it('should return empty array when no markers match filters', async () => {
    // Create test user
    const userResult = await db.insert(usersTable)
      .values({
        username: 'testuser',
        email: 'test@example.com'
      })
      .returning()
      .execute();
    const userId = userResult[0].id;

    // Create marker outside bounds
    await db.insert(markersTable)
      .values({
        user_id: userId,
        latitude: '50.0000',
        longitude: '-100.0000',
        title: 'Outside Marker'
      })
      .execute();

    const input: GetMarkersInput = {
      bounds: {
        north: 41.0,
        south: 40.0,
        east: -73.0,
        west: -75.0
      }
    };

    const result = await getMarkers(input);

    expect(result).toHaveLength(0);
  });

  it('should return empty array when no markers exist', async () => {
    const result = await getMarkers();

    expect(result).toHaveLength(0);
  });
});
