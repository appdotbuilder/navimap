
import { type SearchLocationInput, type SearchResult } from '../schema';

interface NominatimResult {
  place_id?: string;
  osm_id?: string;
  display_name: string;
  lat: string;
  lon: string;
  address?: Record<string, string>;
  type?: string;
  class?: string;
  importance?: string;
}

export async function searchLocations(input: SearchLocationInput): Promise<SearchResult[]> {
  try {
    // Use Nominatim API for geocoding
    const baseUrl = 'https://nominatim.openstreetmap.org/search';
    const params = new URLSearchParams({
      q: input.query,
      format: 'json',
      addressdetails: '1',
      limit: input.limit.toString(),
      'accept-language': 'en'
    });

    const response = await fetch(`${baseUrl}?${params}`, {
      headers: {
        'User-Agent': 'MapApp/1.0 (contact@example.com)' // Required by Nominatim
      }
    });

    if (!response.ok) {
      throw new Error(`Geocoding API failed: ${response.status} ${response.statusText}`);
    }

    const rawData = await response.json();
    
    // Type guard to ensure data is an array
    if (!Array.isArray(rawData)) {
      throw new Error('Invalid response format from geocoding API');
    }
    
    const data = rawData as NominatimResult[];

    // Transform Nominatim response to our SearchResult format
    return data.map((item: NominatimResult) => ({
      place_id: item.place_id?.toString() || item.osm_id?.toString() || 'unknown',
      display_name: item.display_name,
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
      address: item.address ? JSON.stringify(item.address) : null,
      place_type: item.type || item.class || null,
      importance: item.importance ? parseFloat(item.importance) : null
    }));
  } catch (error) {
    console.error('Location search failed:', error);
    throw error;
  }
}
