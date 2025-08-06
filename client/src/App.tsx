
import { useState, useEffect, useCallback } from 'react';
import { trpc } from '@/utils/trpc';
import { MapView } from '@/components/MapView';
import { SearchBar } from '@/components/SearchBar';
import { LayerControl } from '@/components/LayerControl';
import { MarkerPanel } from '@/components/MarkerPanel';
import { ShapePanel } from '@/components/ShapePanel';
import { UserProfile } from '@/components/UserProfile';
import { MapControls } from '@/components/MapControls';
import { DirectionsPanel } from '@/components/DirectionsPanel';
import type { Marker, Shape, User, BasemapType, SearchResult } from '../../server/src/schema';

// Demo user for demonstration purposes - replace with real authentication system
const DEMO_USER: User = {
  id: 1,
  username: 'demo_user',
  email: 'demo@example.com',
  avatar_url: null,
  created_at: new Date(),
  updated_at: new Date()
};

function App() {
  // Map state
  const [mapCenter, setMapCenter] = useState<[number, number]>([37.7749, -122.4194]); // San Francisco
  const [mapZoom, setMapZoom] = useState(10);
  const [activeBasemap, setActiveBasemap] = useState<BasemapType>('osm_standard');
  const [mapBounds, setMapBounds] = useState<{north: number; south: number; east: number; west: number} | null>(null);

  // Data state
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<Marker | null>(null);
  const [selectedShape, setSelectedShape] = useState<Shape | null>(null);

  // UI state
  const [showLayerControl, setShowLayerControl] = useState(false);
  const [showMarkerPanel, setShowMarkerPanel] = useState(false);
  const [showShapePanel, setShowShapePanel] = useState(false);
  const [showDirections, setShowDirections] = useState(false);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [drawingTool, setDrawingTool] = useState<'marker' | 'polygon' | 'polyline' | 'circle' | 'rectangle' | null>(null);
  const [backendAvailable, setBackendAvailable] = useState(true);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Check backend availability
  const checkBackend = useCallback(async () => {
    try {
      await trpc.healthcheck.query();
      setBackendAvailable(true);
    } catch (error) {
      console.log('Backend not available, running in demo mode:', error instanceof Error ? error.message : 'Unknown error');
      setBackendAvailable(false);
    }
  }, []);

  useEffect(() => {
    checkBackend();
  }, [checkBackend]);

  // Load markers and shapes when bounds change
  const loadMapData = useCallback(async () => {
    if (!backendAvailable) {
      // Use demo data when backend is not available
      return;
    }

    try {
      const [markersResult, shapesResult] = await Promise.all([
        trpc.getMarkers.query({ 
          user_id: DEMO_USER.id,
          bounds: mapBounds || undefined
        }),
        trpc.getShapes.query({
          user_id: DEMO_USER.id, 
          bounds: mapBounds || undefined
        })
      ]);
      setMarkers(markersResult);
      setShapes(shapesResult);
    } catch (error) {
      console.log('Backend handlers not implemented, using demo mode:', error instanceof Error ? error.message : 'Unknown error');
      setBackendAvailable(false);
    }
  }, [mapBounds, backendAvailable]);

  useEffect(() => {
    loadMapData();
  }, [loadMapData]);

  // Search locations
  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    if (!backendAvailable) {
      // Provide demo search results when backend is not available
      setTimeout(() => {
        const demoResults: SearchResult[] = [
          {
            place_id: 'demo-1',
            display_name: 'Golden Gate Bridge, San Francisco, CA',
            latitude: 37.8199,
            longitude: -122.4783,
            address: 'Golden Gate Bridge, San Francisco, CA, USA',
            place_type: 'landmark',
            importance: 0.9
          },
          {
            place_id: 'demo-2',
            display_name: 'Alcatraz Island, San Francisco, CA',
            latitude: 37.8267,
            longitude: -122.4233,
            address: 'Alcatraz Island, San Francisco, CA, USA',
            place_type: 'island',
            importance: 0.8
          },
          {
            place_id: 'demo-3',
            display_name: 'Fisherman\'s Wharf, San Francisco, CA',
            latitude: 37.8080,
            longitude: -122.4177,
            address: 'Fisherman\'s Wharf, San Francisco, CA, USA',
            place_type: 'tourism',
            importance: 0.7
          }
        ].filter(result => 
          result.display_name.toLowerCase().includes(query.toLowerCase())
        );
        setSearchResults(demoResults);
        setIsSearching(false);
      }, 500);
      return;
    }

    try {
      const results = await trpc.searchLocations.query({ query, limit: 10 });
      setSearchResults(results);
    } catch (error) {
      console.log('Search service not available, using demo results:', error instanceof Error ? error.message : 'Unknown error');
      setBackendAvailable(false);
      // Fallback to demo search (same as above)
      const demoResults: SearchResult[] = [
        {
          place_id: 'demo-1',
          display_name: 'Golden Gate Bridge, San Francisco, CA',
          latitude: 37.8199,
          longitude: -122.4783,
          address: 'Golden Gate Bridge, San Francisco, CA, USA',
          place_type: 'landmark',
          importance: 0.9
        }
      ];
      setSearchResults(demoResults.filter(result => 
        result.display_name.toLowerCase().includes(query.toLowerCase())
      ));
    } finally {
      setIsSearching(false);
    }
  }, [backendAvailable]);

  // Handle search result selection
  const handleSearchResultSelect = useCallback((result: SearchResult) => {
    setMapCenter([result.latitude, result.longitude]);
    setMapZoom(15);
    setSearchResults([]);
    setSearchQuery(result.display_name);
  }, []);

  // Handle marker creation
  const handleCreateMarker = useCallback(async (lat: number, lng: number) => {
    const newMarker: Marker = {
      id: Date.now(), // Use timestamp as ID for demo
      user_id: DEMO_USER.id,
      latitude: lat,
      longitude: lng,
      title: 'New Marker',
      description: null,
      color: '#FF0000',
      icon: null,
      created_at: new Date(),
      updated_at: new Date()
    };

    if (backendAvailable) {
      try {
        const createdMarker = await trpc.createMarker.mutate({
          user_id: DEMO_USER.id,
          latitude: lat,
          longitude: lng,
          title: 'New Marker',
          description: null,
          color: '#FF0000'
        });
        setMarkers(prev => [...prev, createdMarker]);
        setSelectedMarker(createdMarker);
      } catch (error) {
        console.log('Backend create marker not available, using local demo:', error instanceof Error ? error.message : 'Unknown error');
        setBackendAvailable(false);
        setMarkers(prev => [...prev, newMarker]);
        setSelectedMarker(newMarker);
      }
    } else {
      setMarkers(prev => [...prev, newMarker]);
      setSelectedMarker(newMarker);
    }
    
    setShowMarkerPanel(true);
  }, [backendAvailable]);

  // Handle shape creation
  const handleCreateShape = useCallback(async (coordinates: string, shapeType: 'polygon' | 'polyline' | 'circle' | 'rectangle') => {
    const newShape: Shape = {
      id: Date.now(), // Use timestamp as ID for demo
      user_id: DEMO_USER.id,
      shape_type: shapeType,
      coordinates,
      style: JSON.stringify({
        fillColor: '#3388ff',
        fillOpacity: 0.2,
        color: '#3388ff',
        weight: 3,
        opacity: 0.8
      }),
      name: `New ${shapeType}`,
      description: null,
      created_at: new Date(),
      updated_at: new Date()
    };

    if (backendAvailable) {
      try {
        const createdShape = await trpc.createShape.mutate({
          user_id: DEMO_USER.id,
          shape_type: shapeType,
          coordinates,
          style: JSON.stringify({
            fillColor: '#3388ff',
            fillOpacity: 0.2,
            color: '#3388ff',
            weight: 3,
            opacity: 0.8
          }),
          name: `New ${shapeType}`,
          description: null
        });
        setShapes(prev => [...prev, createdShape]);
        setSelectedShape(createdShape);
      } catch (error) {
        console.log('Backend create shape not available, using local demo:', error instanceof Error ? error.message : 'Unknown error');
        setBackendAvailable(false);
        setShapes(prev => [...prev, newShape]);
        setSelectedShape(newShape);
      }
    } else {
      setShapes(prev => [...prev, newShape]);
      setSelectedShape(newShape);
    }
    
    setShowShapePanel(true);
  }, [backendAvailable]);

  // Handle map click for drawing
  const handleMapClick = useCallback((lat: number, lng: number) => {
    if (drawingTool === 'marker') {
      handleCreateMarker(lat, lng);
      setDrawingTool(null);
      setIsDrawingMode(false);
    }
  }, [drawingTool, handleCreateMarker]);

  // Save map state periodically (only if backend available)
  const saveMapState = useCallback(async () => {
    if (!backendAvailable) {
      return; // Skip saving in demo mode
    }

    try {
      await trpc.saveMapState.mutate({
        user_id: DEMO_USER.id,
        center_latitude: mapCenter[0],
        center_longitude: mapCenter[1],
        zoom_level: mapZoom,
        active_basemap: activeBasemap
      });
    } catch (error) {
      console.log('Backend save map state not available:', error instanceof Error ? error.message : 'Unknown error');
      setBackendAvailable(false);
    }
  }, [mapCenter, mapZoom, activeBasemap, backendAvailable]);

  // Auto-save map state when it changes (only if backend available)
  useEffect(() => {
    if (!backendAvailable) return;
    
    const timer = setTimeout(saveMapState, 1000);
    return () => clearTimeout(timer);
  }, [saveMapState, backendAvailable]);

  return (
    <div className="h-screen w-full relative overflow-hidden bg-gray-100">
      {/* Backend Status Indicator */}
      {!backendAvailable && (
        <div className="absolute top-0 left-0 right-0 z-50 bg-amber-100 border-b border-amber-200 px-4 py-2">
          <div className="flex items-center justify-center space-x-2 text-amber-800 text-sm">
            <span className="text-lg">⚠️</span>
            <span>Demo Mode: Backend handlers not implemented - using local demonstration data</span>
          </div>
        </div>
      )}

      {/* Main Map Container */}
      <div className="absolute inset-0" style={{ marginTop: !backendAvailable ? '48px' : '0' }}>
        <MapView
          center={mapCenter}
          zoom={mapZoom}
          basemap={activeBasemap}
          markers={markers}
          shapes={shapes}
          selectedMarker={selectedMarker}
          selectedShape={selectedShape}
          onCenterChange={setMapCenter}
          onZoomChange={setMapZoom}
          onBoundsChange={setMapBounds}
          onClick={handleMapClick}
          onMarkerClick={setSelectedMarker}
          onShapeClick={setSelectedShape}
          isDrawingMode={isDrawingMode}
          drawingTool={drawingTool}
          onShapeCreated={handleCreateShape}
        />
      </div>

      {/* Top Search Bar */}
      <div className="absolute left-4 right-4 z-10" style={{ top: !backendAvailable ? '60px' : '16px' }}>
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onSearch={handleSearch}
          results={searchResults}
          onResultSelect={handleSearchResultSelect}
          isLoading={isSearching}
        />
      </div>

      {/* Layer Control Button */}
      <div className="absolute right-4 z-10" style={{ top: !backendAvailable ? '108px' : '80px' }}>
        <button
          onClick={() => setShowLayerControl(!showLayerControl)}
          className="bg-white rounded-lg shadow-lg p-3 hover:bg-gray-50 transition-colors"
          title="Map Layers"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 12.75l6 6 9-13.5" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </button>
      </div>

      {/* Layer Control Panel */}
      {showLayerControl && (
        <div className="absolute right-4 z-20" style={{ top: !backendAvailable ? '160px' : '128px' }}>
          <LayerControl
            activeBasemap={activeBasemap}
            onBasemapChange={setActiveBasemap}
            onClose={() => setShowLayerControl(false)}
          />
        </div>
      )}

      {/* Map Controls (Zoom, Compass) */}
      <div className="absolute bottom-32 right-4 z-10">
        <MapControls
          zoom={mapZoom}
          onZoomIn={() => setMapZoom(prev => Math.min(prev + 1, 20))}
          onZoomOut={() => setMapZoom(prev => Math.max(prev - 1, 1))}
          onResetNorth={() => {/* Reset compass orientation */}}
          bearing={0} // Would be calculated from map rotation
        />
      </div>

      {/* Drawing Tools */}
      <div className="absolute left-4 z-10" style={{ top: !backendAvailable ? '160px' : '128px' }}>
        <div className="bg-white rounded-lg shadow-lg p-2 space-y-2">
          <button
            onClick={() => {
              setDrawingTool('marker');
              setIsDrawingMode(true);
            }}
            className={`w-10 h-10 rounded p-2 transition-colors ${
              drawingTool === 'marker' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
            }`}
            title="Add Marker"
          >
            📍
          </button>
          <button
            onClick={() => {
              setDrawingTool('polygon');
              setIsDrawingMode(true);
            }}
            className={`w-10 h-10 rounded p-2 transition-colors ${
              drawingTool === 'polygon' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
            }`}
            title="Draw Polygon"
          >
            ⬟
          </button>
          <button
            onClick={() => {
              setDrawingTool('polyline');
              setIsDrawingMode(true);
            }}
            className={`w-10 h-10 rounded p-2 transition-colors ${
              drawingTool === 'polyline' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
            }`}
            title="Draw Line"
          >
            📏
          </button>
          <button
            onClick={() => {
              setDrawingTool('circle');
              setIsDrawingMode(true);
            }}
            className={`w-10 h-10 rounded p-2 transition-colors ${
              drawingTool === 'circle' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
            }`}
            title="Draw Circle"
          >
            ⭕
          </button>
        </div>
      </div>

      {/* Bottom Panel - User Profile, Search, Directions */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 z-10 mb-4">
        <div className="bg-white rounded-full shadow-lg px-6 py-3 flex items-center space-x-4">
          <button
            onClick={() => setShowDirections(!showDirections)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
            </svg>
            <span>Directions</span>
          </button>

          <UserProfile user={DEMO_USER} />

          <button
            onClick={() => setShowMarkerPanel(!showMarkerPanel)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Markers"
          >
            <span className="text-xl">📍</span>
          </button>

          <button
            onClick={() => setShowShapePanel(!showShapePanel)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Shapes"
          >
            <span className="text-xl">⬟</span>
          </button>
        </div>
      </div>

      {/* Side Panels */}
      {showMarkerPanel && (
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-xl z-20">
          <MarkerPanel
            markers={markers}
            selectedMarker={selectedMarker}
            onMarkerSelect={setSelectedMarker}
            onMarkerUpdate={(marker) => {
              setMarkers(prev => prev.map(m => m.id === marker.id ? marker : m));
            }}
            onMarkerDelete={(markerId) => {
              setMarkers(prev => prev.filter(m => m.id !== markerId));
              setSelectedMarker(null);
            }}
            onClose={() => setShowMarkerPanel(false)}
            backendAvailable={backendAvailable}
          />
        </div>
      )}

      {showShapePanel && (
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-xl z-20">
          <ShapePanel
            shapes={shapes}
            selectedShape={selectedShape}
            onShapeSelect={setSelectedShape}
            onShapeUpdate={(shape) => {
              setShapes(prev => prev.map(s => s.id === shape.id ? shape : s));
            }}
            onShapeDelete={(shapeId) => {
              setShapes(prev => prev.filter(s => s.id !== shapeId));
              setSelectedShape(null);
            }}
            onClose={() => setShowShapePanel(false)}
            backendAvailable={backendAvailable}
          />
        </div>
      )}

      {showDirections && (
        <div className="absolute left-0 top-0 bottom-0 w-80 bg-white shadow-xl z-20">
          <DirectionsPanel
            onClose={() => setShowDirections(false)}
            onRouteCalculated={() => {/* Handle route display */}}
          />
        </div>
      )}

      {/* Status indicator for drawing mode */}
      {isDrawingMode && (
        <div className="absolute left-1/2 transform -translate-x-1/2 z-30" style={{ top: !backendAvailable ? '60px' : '16px' }}>
          <div className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg">
            Click on the map to add {drawingTool}
            <button
              onClick={() => {
                setIsDrawingMode(false);
                setDrawingTool(null);
              }}
              className="ml-2 text-blue-200 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
