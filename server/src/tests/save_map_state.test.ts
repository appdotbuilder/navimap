
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, mapStatesTable } from '../db/schema';
import { type SaveMapStateInput } from '../schema';
import { saveMapState } from '../handlers/save_map_state';
import { eq } from 'drizzle-orm';

// Test user for foreign key relationship
const testUser = {
  username: 'mapuser',
  email: 'mapuser@example.com',
  avatar_url: null
};

// Test input for map state
const testInput: SaveMapStateInput = {
  user_id: 1,
  center_latitude: 40.7128,
  center_longitude: -74.0060,
  zoom_level: 12,
  active_basemap: 'osm_standard'
};

describe('saveMapState', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a new map state', async () => {
    // Create prerequisite user
    const userResult = await db.insert(usersTable)
      .values(testUser)
      .returning()
      .execute();

    const updatedInput = { ...testInput, user_id: userResult[0].id };
    const result = await saveMapState(updatedInput);

    // Basic field validation
    expect(result.user_id).toEqual(userResult[0].id);
    expect(result.center_latitude).toEqual(40.7128);
    expect(result.center_longitude).toEqual(-74.0060);
    expect(result.zoom_level).toEqual(12);
    expect(result.active_basemap).toEqual('osm_standard');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);

    // Verify numeric types
    expect(typeof result.center_latitude).toBe('number');
    expect(typeof result.center_longitude).toBe('number');
  });

  it('should save map state to database', async () => {
    // Create prerequisite user
    const userResult = await db.insert(usersTable)
      .values(testUser)
      .returning()
      .execute();

    const updatedInput = { ...testInput, user_id: userResult[0].id };
    const result = await saveMapState(updatedInput);

    // Query using proper drizzle syntax
    const mapStates = await db.select()
      .from(mapStatesTable)
      .where(eq(mapStatesTable.user_id, userResult[0].id))
      .execute();

    expect(mapStates).toHaveLength(1);
    expect(mapStates[0].user_id).toEqual(userResult[0].id);
    expect(parseFloat(mapStates[0].center_latitude)).toEqual(40.7128);
    expect(parseFloat(mapStates[0].center_longitude)).toEqual(-74.0060);
    expect(mapStates[0].zoom_level).toEqual(12);
    expect(mapStates[0].active_basemap).toEqual('osm_standard');
    expect(mapStates[0].created_at).toBeInstanceOf(Date);
    expect(mapStates[0].updated_at).toBeInstanceOf(Date);
  });

  it('should update existing map state for same user', async () => {
    // Create prerequisite user
    const userResult = await db.insert(usersTable)
      .values(testUser)
      .returning()
      .execute();

    const updatedInput = { ...testInput, user_id: userResult[0].id };
    
    // Create initial map state
    const firstResult = await saveMapState(updatedInput);

    // Update with new values
    const updateInput: SaveMapStateInput = {
      user_id: userResult[0].id,
      center_latitude: 51.5074,
      center_longitude: -0.1278,
      zoom_level: 15,
      active_basemap: 'satellite'
    };

    const secondResult = await saveMapState(updateInput);

    // Should have same ID (update, not insert)
    expect(secondResult.id).toEqual(firstResult.id);
    expect(secondResult.user_id).toEqual(userResult[0].id);
    expect(secondResult.center_latitude).toEqual(51.5074);
    expect(secondResult.center_longitude).toEqual(-0.1278);
    expect(secondResult.zoom_level).toEqual(15);
    expect(secondResult.active_basemap).toEqual('satellite');

    // Updated timestamp should be different
    expect(secondResult.updated_at.getTime()).toBeGreaterThan(firstResult.updated_at.getTime());

    // Verify only one record exists in database
    const mapStates = await db.select()
      .from(mapStatesTable)
      .where(eq(mapStatesTable.user_id, userResult[0].id))
      .execute();

    expect(mapStates).toHaveLength(1);
    expect(parseFloat(mapStates[0].center_latitude)).toEqual(51.5074);
    expect(parseFloat(mapStates[0].center_longitude)).toEqual(-0.1278);
  });

  it('should handle different basemap types correctly', async () => {
    // Create prerequisite user
    const userResult = await db.insert(usersTable)
      .values(testUser)
      .returning()
      .execute();

    // Test with ArcGIS basemap
    const arcgisInput: SaveMapStateInput = {
      user_id: userResult[0].id,
      center_latitude: 34.0522,
      center_longitude: -118.2437,
      zoom_level: 10,
      active_basemap: 'arcgis_imagery'
    };

    const result = await saveMapState(arcgisInput);

    expect(result.active_basemap).toEqual('arcgis_imagery');
    expect(result.center_latitude).toEqual(34.0522);
    expect(result.center_longitude).toEqual(-118.2437);
    expect(result.zoom_level).toEqual(10);
  });
});
