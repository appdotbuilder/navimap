
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, mapStatesTable } from '../db/schema';
import { getMapState } from '../handlers/get_map_state';

describe('getMapState', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return null when user has no map state', async () => {
    // Create a user first
    const userResult = await db.insert(usersTable)
      .values({
        username: 'testuser',
        email: 'test@example.com'
      })
      .returning()
      .execute();

    const userId = userResult[0].id;

    const result = await getMapState(userId);
    expect(result).toBeNull();
  });

  it('should return map state when user has saved preferences', async () => {
    // Create a user first
    const userResult = await db.insert(usersTable)
      .values({
        username: 'testuser',
        email: 'test@example.com'
      })
      .returning()
      .execute();

    const userId = userResult[0].id;

    // Create map state for the user
    await db.insert(mapStatesTable)
      .values({
        user_id: userId,
        center_latitude: '40.7128',
        center_longitude: '-74.0060',
        zoom_level: 12,
        active_basemap: 'osm_standard'
      })
      .execute();

    const result = await getMapState(userId);

    expect(result).not.toBeNull();
    expect(result!.user_id).toEqual(userId);
    expect(result!.center_latitude).toEqual(40.7128);
    expect(result!.center_longitude).toEqual(-74.0060);
    expect(result!.zoom_level).toEqual(12);
    expect(result!.active_basemap).toEqual('osm_standard');
    expect(result!.id).toBeDefined();
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should handle numeric conversions correctly', async () => {
    // Create a user first
    const userResult = await db.insert(usersTable)
      .values({
        username: 'testuser',
        email: 'test@example.com'
      })
      .returning()
      .execute();

    const userId = userResult[0].id;

    // Create map state with precise coordinates
    await db.insert(mapStatesTable)
      .values({
        user_id: userId,
        center_latitude: '51.5074',
        center_longitude: '-0.1278',
        zoom_level: 15,
        active_basemap: 'arcgis_imagery'
      })
      .execute();

    const result = await getMapState(userId);

    expect(result).not.toBeNull();
    expect(typeof result!.center_latitude).toBe('number');
    expect(typeof result!.center_longitude).toBe('number');
    expect(result!.center_latitude).toEqual(51.5074);
    expect(result!.center_longitude).toEqual(-0.1278);
  });

  it('should return null for non-existent user', async () => {
    const result = await getMapState(999999);
    expect(result).toBeNull();
  });

  it('should handle different basemap types correctly', async () => {
    // Create a user first
    const userResult = await db.insert(usersTable)
      .values({
        username: 'testuser',
        email: 'test@example.com'
      })
      .returning()
      .execute();

    const userId = userResult[0].id;

    // Create map state with Google satellite basemap
    await db.insert(mapStatesTable)
      .values({
        user_id: userId,
        center_latitude: '37.7749',
        center_longitude: '-122.4194',
        zoom_level: 10,
        active_basemap: 'satellite'
      })
      .execute();

    const result = await getMapState(userId);

    expect(result).not.toBeNull();
    expect(result!.active_basemap).toEqual('satellite');
    expect(result!.zoom_level).toEqual(10);
  });
});
