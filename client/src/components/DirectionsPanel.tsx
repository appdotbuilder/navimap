
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface DirectionsPanelProps {
  onClose: () => void;
  onRouteCalculated: (route: RouteData) => void;
}

interface RouteStep {
  instruction: string;
  distance: string;
  duration: string;
}

interface AlternativeRoute {
  name: string;
  distance: string;
  duration: string;
  traffic: string;
}

interface RouteData {
  distance: string;
  duration: string;
  steps: RouteStep[];
  alternativeRoutes: AlternativeRoute[];
}

// Sample route data for demonstration
const SAMPLE_ROUTE: RouteData = {
  distance: '15.2 km',
  duration: '18 min',
  steps: [
    { instruction: 'Head north on Market St', distance: '0.2 km', duration: '1 min' },
    { instruction: 'Turn right onto 3rd St', distance: '0.8 km', duration: '2 min' },
    { instruction: 'Continue onto US-101 N', distance: '12.1 km', duration: '12 min' },
    { instruction: 'Take exit 429 for Golden Gate Ave', distance: '0.5 km', duration: '1 min' },
    { instruction: 'Turn left onto Golden Gate Ave', distance: '1.2 km', duration: '2 min' },
    { instruction: 'Arrive at destination', distance: '0.4 km', duration: '0 min' }
  ],
  alternativeRoutes: [
    { name: 'Via Highway 1', distance: '18.7 km', duration: '22 min', traffic: 'moderate' },
    { name: 'Via City Streets', distance: '14.1 km', duration: '28 min', traffic: 'heavy' }
  ]
};

export function DirectionsPanel({ onClose, onRouteCalculated }: DirectionsPanelProps) {
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [travelMode, setTravelMode] = useState<'driving' | 'walking' | 'cycling' | 'transit'>('driving');
  const [isCalculating, setIsCalculating] = useState(false);
  const [hasRoute, setHasRoute] = useState(false);
  const [showAlternatives, setShowAlternatives] = useState(false);

  const handleCalculateRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startLocation.trim() || !endLocation.trim()) return;

    setIsCalculating(true);
    
    // Simulate route calculation
    setTimeout(() => {
      setHasRoute(true);
      setIsCalculating(false);
      onRouteCalculated(SAMPLE_ROUTE);
    }, 1500);
  };

  const clearRoute = () => {
    setHasRoute(false);
    setShowAlternatives(false);
    setStartLocation('');
    setEndLocation('');
  };

  const getTravelModeIcon = (mode: string) => {
    const icons: Record<string, string> = {
      driving: '🚗',
      walking: '🚶',
      cycling: '🚴',
      transit: '🚌'
    };
    return icons[mode] || '🚗';
  };

  const getTrafficColor = (traffic: string) => {
    const colors: Record<string, string> = {
      light: 'bg-green-100 text-green-800',
      moderate: 'bg-yellow-100 text-yellow-800',
      heavy: 'bg-red-100 text-red-800'
    };
    return colors[traffic] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-white">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Directions</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            ✕
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            {/* Route Input Form */}
            <Card>
              <CardContent className="p-4">
                <form onSubmit={handleCalculateRoute} className="space-y-3">
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500">
                      🟢
                    </div>
                    <Input
                      value={startLocation}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setStartLocation(e.target.value)
                      }
                      placeholder="Starting point"
                      className="pl-10"
                      required
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-500">
                      🔴
                    </div>
                    <Input
                      value={endLocation}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setEndLocation(e.target.value)
                      }
                      placeholder="Destination"
                      className="pl-10"
                      required
                    />
                  </div>

                  {/* Travel Mode Selection */}
                  <div className="grid grid-cols-4 gap-2">
                    {(['driving', 'walking', 'cycling', 'transit'] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setTravelMode(mode)}
                        className={`p-2 rounded text-center transition-colors ${
                          travelMode === mode
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        <div className="text-lg">{getTravelModeIcon(mode)}</div>
                        <div className="text-xs capitalize">{mode}</div>
                      </button>
                    ))}
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      type="submit"
                      disabled={isCalculating}
                      className="flex-1"
                    >
                      {isCalculating ? 'Calculating...' : 'Get Directions'}
                    </Button>
                    {hasRoute && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={clearRoute}
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Route Results */}
            {hasRoute && (
              <>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-lg font-semibold text-blue-600">
                          {SAMPLE_ROUTE.duration}
                        </div>
                        <div className="text-sm text-gray-600">
                          {SAMPLE_ROUTE.distance} • Best route
                        </div>
                      </div>
                      <div className="text-2xl">
                        {getTravelModeIcon(travelMode)}
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAlternatives(!showAlternatives)}
                      className="w-full"
                    >
                      {showAlternatives ? 'Hide' : 'Show'} Alternative Routes
                    </Button>
                  </CardContent>
                </Card>

                {/* Alternative Routes */}
                {showAlternatives && (
                  <div className="space-y-2">
                    {SAMPLE_ROUTE.alternativeRoutes.map((route, index) => (
                      <Card key={index} className="cursor-pointer hover:bg-gray-50">
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-sm">{route.name}</div>
                              <div className="text-xs text-gray-600">
                                {route.duration} • {route.distance}
                              </div>
                            </div>
                            <Badge className={getTrafficColor(route.traffic)}>
                              {route.traffic} traffic
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Turn-by-Turn Directions */}
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-3">Directions</h3>
                    <div className="space-y-3">
                      {SAMPLE_ROUTE.steps.map((step, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center mt-0.5">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">{step.instruction}</p>
                            <p className="text-xs text-gray-600">
                              {step.distance} • {step.duration}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Route Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      // Handle start navigation
                      console.log('Start navigation');
                    }}
                  >
                    🧭 Navigate
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      // Handle share route
                      console.log('Share route');
                    }}
                  >
                    📤 Share
                  </Button>
                </div>
              </>
            )}

            {/* Recent Destinations */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Recent</h3>
                <div className="space-y-2">
                  {[
                    { name: 'Home', address: '123 Main St, San Francisco, CA' },
                    { name: 'Work', address: '456 Business Ave, San Francisco, CA' },
                    { name: 'Golden Gate Park', address: 'Golden Gate Park, San Francisco, CA' }
                  ].map((location, index) => (
                    <button
                      key={index}
                      onClick={() => setEndLocation(location.address)}
                      className="w-full text-left p-2 rounded hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-gray-400">📍</span>
                        <div>
                          <div className="text-sm font-medium">{location.name}</div>
                          <div className="text-xs text-gray-600">{location.address}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
