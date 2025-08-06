
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { BasemapType } from '../../../server/src/schema';

interface LayerControlProps {
  activeBasemap: BasemapType;
  onBasemapChange: (basemap: BasemapType) => void;
  onClose: () => void;
}

interface BasemapOption {
  id: BasemapType;
  name: string;
  description: string;
  category: 'Google' | 'ArcGIS' | 'OpenStreetMap';
  preview: string; // Emoji or icon for preview
}

const basemapOptions: BasemapOption[] = [
  // Google
  {
    id: 'satellite',
    name: 'Satellite',
    description: 'Google Earth satellite imagery',
    category: 'Google',
    preview: '🛰️'
  },
  
  // ArcGIS
  {
    id: 'arcgis_imagery',
    name: 'World Imagery',
    description: 'High-resolution satellite and aerial imagery',
    category: 'ArcGIS',
    preview: '🌍'
  },
  {
    id: 'arcgis_imagery_hybrid',
    name: 'Imagery Hybrid',
    description: 'Satellite imagery with labels',
    category: 'ArcGIS',
    preview: '🗺️'
  },
  {
    id: 'arcgis_streets',
    name: 'Streets',
    description: 'Detailed street map',
    category: 'ArcGIS',
    preview: '🛣️'
  },
  {
    id: 'arcgis_topographic',
    name: 'Topographic',
    description: 'Topographic map with terrain',
    category: 'ArcGIS',
    preview: '⛰️'
  },
  {
    id: 'arcgis_navigation',
    name: 'Navigation',
    description: 'Optimized for navigation',
    category: 'ArcGIS',
    preview: '🧭'
  },
  {
    id: 'arcgis_streets_night',
    name: 'Streets (Night)',
    description: 'Dark theme street map',
    category: 'ArcGIS',
    preview: '🌙'
  },
  {
    id: 'arcgis_terrain_labels',
    name: 'Terrain with Labels',
    description: 'Terrain map with place labels',
    category: 'ArcGIS',
    preview: '🏔️'
  },
  
  // OpenStreetMap
  {
    id: 'osm_standard',
    name: 'Standard',
    description: 'Standard OpenStreetMap',
    category: 'OpenStreetMap',
    preview: '🗺️'
  },
  {
    id: 'osm_cyclosm',
    name: 'CyclOSM',
    description: 'Optimized for cycling',
    category: 'OpenStreetMap',
    preview: '🚴'
  },
  {
    id: 'osm_cycle_map',
    name: 'Cycle Map',
    description: 'Cycling routes and paths',
    category: 'OpenStreetMap',
    preview: '🚲'
  },
  {
    id: 'osm_transport_map',
    name: 'Transport',
    description: 'Public transport focused',
    category: 'OpenStreetMap',
    preview: '🚌'
  },
  {
    id: 'osm_tracestrack_topo',
    name: 'TracesTrack Topo',
    description: 'Topographic with GPS traces',
    category: 'OpenStreetMap',
    preview: '📍'
  },
  {
    id: 'osm_humanitarian',
    name: 'Humanitarian',
    description: 'Humanitarian mapping focus',
    category: 'OpenStreetMap',
    preview: '🏥'
  },
  {
    id: 'osm_shortbread',
    name: 'Shortbread',
    description: 'Clean, modern design',
    category: 'OpenStreetMap',
    preview: '✨'
  }
];

export function LayerControl({ activeBasemap, onBasemapChange, onClose }: LayerControlProps) {
  const categories = ['Google', 'ArcGIS', 'OpenStreetMap'] as const;

  return (
    <Card className="w-80 max-h-96 overflow-y-auto">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Map Layers</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            ✕
          </Button>
        </div>

        <div className="space-y-4">
          {categories.map((category) => (
            <div key={category}>
              <h4 className="text-sm font-medium text-gray-700 mb-2 border-b pb-1">
                {category}
              </h4>
              <div className="space-y-1">
                {basemapOptions
                  .filter(option => option.category === category)
                  .map((option) => (
                    <button
                      key={option.id}
                      onClick={() => onBasemapChange(option.id)}
                      className={`w-full p-3 rounded-lg text-left transition-all hover:bg-gray-50 ${
                        activeBasemap === option.id
                          ? 'bg-blue-50 border-2 border-blue-500'
                          : 'border-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{option.preview}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-sm text-gray-900">
                              {option.name}
                            </span>
                            {activeBasemap === option.id && (
                              <span className="text-blue-500 text-xs">✓</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mt-0.5">
                            {option.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
