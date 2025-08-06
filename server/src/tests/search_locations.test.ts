
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { type SearchLocationInput } from '../schema';
import { searchLocations } from '../handlers/search_locations';

const testInput: SearchLocationInput = {
  query: 'New York',
  limit: 5
};

describe('searchLocations', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should search for locations', async () => {
    const results = await searchLocations(testInput);

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
    expect(results.length).toBeLessThanOrEqual(5);

    // Validate first result structure
    const firstResult = results[0];
    expect(firstResult.place_id).toBeDefined();
    expect(typeof firstResult.place_id).toBe('string');
    expect(firstResult.display_name).toBeDefined();
    expect(typeof firstResult.display_name).toBe('string');
    expect(typeof firstResult.latitude).toBe('number');
    expect(typeof firstResult.longitude).toBe('number');
    expect(firstResult.latitude).toBeGreaterThanOrEqual(-90);
    expect(firstResult.latitude).toBeLessThanOrEqual(90);
    expect(firstResult.longitude).toBeGreaterThanOrEqual(-180);
    expect(firstResult.longitude).toBeLessThanOrEqual(180);
  });

  it('should respect the limit parameter', async () => {
    const limitedInput: SearchLocationInput = {
      query: 'Paris',
      limit: 3
    };

    const results = await searchLocations(limitedInput);

    expect(results.length).toBeLessThanOrEqual(3);
  });

  it('should use default limit when not specified', async () => {
    const inputWithoutLimit = {
      query: 'London'
    };

    // Parse input through Zod schema to apply defaults
    const parsedInput = await import('../schema').then(({ searchLocationInputSchema }) => 
      searchLocationInputSchema.parse(inputWithoutLimit)
    );

    const results = await searchLocations(parsedInput);

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeLessThanOrEqual(10); // Default limit from schema
  });

  it('should return empty array for no results', async () => {
    const noResultsInput: SearchLocationInput = {
      query: 'nonexistentplacename12345',
      limit: 5
    };

    const results = await searchLocations(noResultsInput);

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(0);
  });

  it('should handle specific location queries', async () => {
    const specificInput: SearchLocationInput = {
      query: 'Eiffel Tower, Paris',
      limit: 1
    };

    const results = await searchLocations(specificInput);

    if (results.length > 0) {
      const result = results[0];
      expect(result.display_name.toLowerCase()).toMatch(/paris|eiffel/);
      expect(result.latitude).toBeCloseTo(48.8584, 1); // Approximate latitude of Eiffel Tower
      expect(result.longitude).toBeCloseTo(2.2945, 1); // Approximate longitude of Eiffel Tower
    }
  });

  it('should validate result field types', async () => {
    const results = await searchLocations(testInput);

    if (results.length > 0) {
      results.forEach(result => {
        expect(typeof result.place_id).toBe('string');
        expect(typeof result.display_name).toBe('string');
        expect(typeof result.latitude).toBe('number');
        expect(typeof result.longitude).toBe('number');
        
        // Optional fields should be null or correct type
        if (result.address !== null) {
          expect(typeof result.address).toBe('string');
        }
        if (result.place_type !== null) {
          expect(typeof result.place_type).toBe('string');
        }
        if (result.importance !== null) {
          expect(typeof result.importance).toBe('number');
        }
      });
    }
  });
});
