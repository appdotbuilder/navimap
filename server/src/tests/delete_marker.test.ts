
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, markersTable } from '../db/schema';
import { type CreateUserInput, type CreateMarkerInput } from '../schema';
import { deleteMarker } from '../handlers/delete_marker';
import { eq } from 'drizzle-orm';

describe('deleteMarker', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing marker', async () => {
    // Create user first
    const userResult = await db.insert(usersTable)
      .values({
        username: 'testuser',
        email: 'test@example.com',
        avatar_url: null
      })
      .returning()
      .execute();

    const userId = userResult[0].id;

    // Create marker
    const markerResult = await db.insert(markersTable)
      .values({
        user_id: userId,
        latitude: '40.7128',
        longitude: '-74.0060',
        title: 'Test Marker',
        description: 'A test marker',
        color: '#FF0000',
        icon: null
      })
      .returning()
      .execute();

    const markerId = markerResult[0].id;

    // Delete the marker
    const result = await deleteMarker(markerId);

    expect(result).toBe(true);

    // Verify marker was deleted from database
    const markers = await db.select()
      .from(markersTable)
      .where(eq(markersTable.id, markerId))
      .execute();

    expect(markers).toHaveLength(0);
  });

  it('should return false when deleting non-existent marker', async () => {
    const result = await deleteMarker(999);

    expect(result).toBe(false);
  });

  it('should not affect other markers when deleting one', async () => {
    // Create user first
    const userResult = await db.insert(usersTable)
      .values({
        username: 'testuser',
        email: 'test@example.com',
        avatar_url: null
      })
      .returning()
      .execute();

    const userId = userResult[0].id;

    // Create two markers
    const marker1Result = await db.insert(markersTable)
      .values({
        user_id: userId,
        latitude: '40.7128',
        longitude: '-74.0060',
        title: 'Test Marker 1',
        description: 'First test marker',
        color: '#FF0000',
        icon: null
      })
      .returning()
      .execute();

    const marker2Result = await db.insert(markersTable)
      .values({
        user_id: userId,
        latitude: '34.0522',
        longitude: '-118.2437',
        title: 'Test Marker 2',
        description: 'Second test marker',
        color: '#00FF00',
        icon: null
      })
      .returning()
      .execute();

    const marker1Id = marker1Result[0].id;
    const marker2Id = marker2Result[0].id;

    // Delete first marker
    const result = await deleteMarker(marker1Id);

    expect(result).toBe(true);

    // Verify only first marker was deleted
    const marker1Check = await db.select()
      .from(markersTable)
      .where(eq(markersTable.id, marker1Id))
      .execute();

    const marker2Check = await db.select()
      .from(markersTable)
      .where(eq(markersTable.id, marker2Id))
      .execute();

    expect(marker1Check).toHaveLength(0);
    expect(marker2Check).toHaveLength(1);
    expect(marker2Check[0].title).toEqual('Test Marker 2');
  });
});
