
import { Button } from '@/components/ui/button';

interface MapControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetNorth: () => void;
  bearing: number; // Map rotation in degrees
}

export function MapControls({ zoom, onZoomIn, onZoomOut, onResetNorth, bearing }: MapControlsProps) {
  return (
    <div className="flex flex-col space-y-2">
      {/* Zoom Controls */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <Button
          onClick={onZoomIn}
          variant="ghost"
          size="sm"
          className="w-10 h-10 p-0 rounded-none border-b hover:bg-gray-50"
          disabled={zoom >= 20}
        >
          <span className="text-lg font-bold">+</span>
        </Button>
        <div className="px-2 py-1 text-xs text-gray-600 text-center border-b bg-gray-50">
          {zoom}
        </div>
        <Button
          onClick={onZoomOut}
          variant="ghost"
          size="sm"
          className="w-10 h-10 p-0 rounded-none hover:bg-gray-50"
          disabled={zoom <= 1}
        >
          <span className="text-lg font-bold">−</span>
        </Button>
      </div>

      {/* Compass */}
      <div className="bg-white rounded-lg shadow-lg p-2">
        <Button
          onClick={onResetNorth}
          variant="ghost"
          size="sm"
          className="w-10 h-10 p-0 hover:bg-gray-50 relative"
          title="Reset North"
        >
          <div
            className="text-xl transition-transform duration-300"
            style={{ transform: `rotate(${-bearing}deg)` }}
          >
            🧭
          </div>
          {bearing !== 0 && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          )}
        </Button>
      </div>

      {/* My Location Button */}
      <div className="bg-white rounded-lg shadow-lg">
        <Button
          onClick={() => {
            // Handle getting user's current location
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  console.log('User location:', position.coords.latitude, position.coords.longitude);
                  // In real implementation, center map on user location
                },
                (error) => {
                  console.error('Failed to get user location:', error);
                }
              );
            }
          }}
          variant="ghost"
          size="sm"
          className="w-10 h-10 p-0 hover:bg-gray-50"
          title="My Location"
        >
          <span className="text-lg">📍</span>
        </Button>
      </div>

      {/* 3D/2D Toggle */}
      <div className="bg-white rounded-lg shadow-lg">
        <Button
          onClick={() => {
            // Toggle 3D/2D view
            console.log('Toggle 3D/2D view');
          }}
          variant="ghost"
          size="sm"
          className="w-10 h-10 p-0 hover:bg-gray-50"
          title="Toggle 3D View"
        >
          <span className="text-lg">🏢</span>
        </Button>
      </div>
    </div>
  );
}
