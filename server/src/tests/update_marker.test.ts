
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, markersTable } from '../db/schema';
import { type UpdateMarkerInput } from '../schema';
import { updateMarker } from '../handlers/update_marker';
import { eq } from 'drizzle-orm';

describe('updateMarker', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  let testUser: { id: number };
  let testMarker: { id: number };

  beforeEach(async () => {
    // Create test user first
    const userResult = await db.insert(usersTable)
      .values({
        username: 'testuser',
        email: 'test@example.com'
      })
      .returning()
      .execute();
    testUser = userResult[0];

    // Create test marker
    const markerResult = await db.insert(markersTable)
      .values({
        user_id: testUser.id,
        latitude: '37.7749',
        longitude: '-122.4194',
        title: 'Original Title',
        description: 'Original description',
        color: '#FF0000',
        icon: 'pin'
      })
      .returning()
      .execute();
    testMarker = markerResult[0];
  });

  it('should update marker title', async () => {
    const input: UpdateMarkerInput = {
      id: testMarker.id,
      title: 'Updated Title'
    };

    const result = await updateMarker(input);

    expect(result.id).toEqual(testMarker.id);
    expect(result.title).toEqual('Updated Title');
    expect(result.description).toEqual('Original description'); // Should remain unchanged
    expect(result.color).toEqual('#FF0000'); // Should remain unchanged
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should update marker description', async () => {
    const input: UpdateMarkerInput = {
      id: testMarker.id,
      description: 'Updated description'
    };

    const result = await updateMarker(input);

    expect(result.description).toEqual('Updated description');
    expect(result.title).toEqual('Original Title'); // Should remain unchanged
  });

  it('should update marker color and icon', async () => {
    const input: UpdateMarkerInput = {
      id: testMarker.id,
      color: '#00FF00',
      icon: 'star'
    };

    const result = await updateMarker(input);

    expect(result.color).toEqual('#00FF00');
    expect(result.icon).toEqual('star');
    expect(result.title).toEqual('Original Title'); // Should remain unchanged
  });

  it('should update multiple fields at once', async () => {
    const input: UpdateMarkerInput = {
      id: testMarker.id,
      title: 'New Title',
      description: 'New description',
      color: '#0000FF',
      icon: 'circle'
    };

    const result = await updateMarker(input);

    expect(result.title).toEqual('New Title');
    expect(result.description).toEqual('New description');
    expect(result.color).toEqual('#0000FF');
    expect(result.icon).toEqual('circle');
    expect(result.latitude).toEqual(37.7749);
    expect(result.longitude).toEqual(-122.4194);
    expect(typeof result.latitude).toEqual('number');
    expect(typeof result.longitude).toEqual('number');
  });

  it('should set description to null when explicitly provided', async () => {
    const input: UpdateMarkerInput = {
      id: testMarker.id,
      description: null
    };

    const result = await updateMarker(input);

    expect(result.description).toBeNull();
    expect(result.title).toEqual('Original Title'); // Should remain unchanged
  });

  it('should save updated marker to database', async () => {
    const input: UpdateMarkerInput = {
      id: testMarker.id,
      title: 'Database Test Title'
    };

    await updateMarker(input);

    // Verify in database
    const markers = await db.select()
      .from(markersTable)
      .where(eq(markersTable.id, testMarker.id))
      .execute();

    expect(markers).toHaveLength(1);
    expect(markers[0].title).toEqual('Database Test Title');
    expect(markers[0].updated_at).toBeInstanceOf(Date);
  });

  it('should throw error when marker not found', async () => {
    const input: UpdateMarkerInput = {
      id: 99999, // Non-existent ID
      title: 'Should Fail'
    };

    expect(updateMarker(input)).rejects.toThrow(/not found/i);
  });

  it('should preserve unchanged fields', async () => {
    const input: UpdateMarkerInput = {
      id: testMarker.id,
      title: 'Only Title Changed'
    };

    const result = await updateMarker(input);

    // Verify unchanged fields are preserved
    expect(result.user_id).toEqual(testUser.id);
    expect(result.latitude).toEqual(37.7749);
    expect(result.longitude).toEqual(-122.4194);
    expect(result.description).toEqual('Original description');
    expect(result.color).toEqual('#FF0000');
    expect(result.icon).toEqual('pin');
    expect(result.created_at).toBeInstanceOf(Date);
  });
});
