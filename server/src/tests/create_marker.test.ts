
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, markersTable } from '../db/schema';
import { type CreateMarkerInput } from '../schema';
import { createMarker } from '../handlers/create_marker';
import { eq } from 'drizzle-orm';

// Test user for foreign key
const testUser = {
  username: 'testuser',
  email: 'test@example.com',
  avatar_url: null
};

// Simple test input
const testInput: CreateMarkerInput = {
  user_id: 1, // Will be set after creating user
  latitude: 40.7128,
  longitude: -74.0060,
  title: 'Test Marker',
  description: 'A marker for testing',
  color: '#FF0000',
  icon: 'pin'
};

describe('createMarker', () => {
  beforeEach(async () => {
    await createDB();
    // Create test user first for foreign key constraint
    const users = await db.insert(usersTable)
      .values(testUser)
      .returning()
      .execute();
    testInput.user_id = users[0].id;
  });

  afterEach(resetDB);

  it('should create a marker with all fields', async () => {
    const result = await createMarker(testInput);

    // Basic field validation
    expect(result.user_id).toEqual(testInput.user_id);
    expect(result.latitude).toEqual(40.7128);
    expect(result.longitude).toEqual(-74.0060);
    expect(result.title).toEqual('Test Marker');
    expect(result.description).toEqual('A marker for testing');
    expect(result.color).toEqual('#FF0000');
    expect(result.icon).toEqual('pin');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
    
    // Ensure numeric types are correct
    expect(typeof result.latitude).toBe('number');
    expect(typeof result.longitude).toBe('number');
  });

  it('should save marker to database', async () => {
    const result = await createMarker(testInput);

    // Query using proper drizzle syntax
    const markers = await db.select()
      .from(markersTable)
      .where(eq(markersTable.id, result.id))
      .execute();

    expect(markers).toHaveLength(1);
    expect(markers[0].user_id).toEqual(testInput.user_id);
    expect(parseFloat(markers[0].latitude)).toEqual(40.7128);
    expect(parseFloat(markers[0].longitude)).toEqual(-74.0060);
    expect(markers[0].title).toEqual('Test Marker');
    expect(markers[0].description).toEqual('A marker for testing');
    expect(markers[0].color).toEqual('#FF0000');
    expect(markers[0].icon).toEqual('pin');
    expect(markers[0].created_at).toBeInstanceOf(Date);
    expect(markers[0].updated_at).toBeInstanceOf(Date);
  });

  it('should create marker with minimal input', async () => {
    const minimalInput: CreateMarkerInput = {
      user_id: testInput.user_id,
      latitude: 34.0522,
      longitude: -118.2437,
      title: 'Minimal Marker'
    };

    const result = await createMarker(minimalInput);

    expect(result.user_id).toEqual(minimalInput.user_id);
    expect(result.latitude).toEqual(34.0522);
    expect(result.longitude).toEqual(-118.2437);
    expect(result.title).toEqual('Minimal Marker');
    expect(result.description).toBeNull();
    expect(result.color).toEqual('#FF0000'); // Default value
    expect(result.icon).toBeNull();
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should handle coordinate precision correctly', async () => {
    const preciseInput: CreateMarkerInput = {
      user_id: testInput.user_id,
      latitude: 40.71280123,
      longitude: -74.00601234,
      title: 'Precise Coordinates'
    };

    const result = await createMarker(preciseInput);

    expect(result.latitude).toEqual(40.71280123);
    expect(result.longitude).toEqual(-74.00601234);
    
    // Verify precision is maintained in database
    const markers = await db.select()
      .from(markersTable)
      .where(eq(markersTable.id, result.id))
      .execute();

    expect(parseFloat(markers[0].latitude)).toEqual(40.71280123);
    expect(parseFloat(markers[0].longitude)).toEqual(-74.00601234);
  });

  it('should throw error for non-existent user', async () => {
    const invalidInput: CreateMarkerInput = {
      user_id: 99999, // Non-existent user
      latitude: 40.7128,
      longitude: -74.0060,
      title: 'Invalid User Marker'
    };

    expect(createMarker(invalidInput)).rejects.toThrow(/violates foreign key constraint/i);
  });
});
