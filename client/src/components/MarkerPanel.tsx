
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { trpc } from '@/utils/trpc';
import type { Marker, UpdateMarkerInput } from '../../../server/src/schema';

interface MarkerPanelProps {
  markers: Marker[];
  selectedMarker: Marker | null;
  onMarkerSelect: (marker: Marker) => void;
  onMarkerUpdate: (marker: Marker) => void;
  onMarkerDelete: (markerId: number) => void;
  onClose: () => void;
  backendAvailable: boolean;
}

export function MarkerPanel({
  markers,
  selectedMarker,
  onMarkerSelect,
  onMarkerUpdate,
  onMarkerDelete,
  onClose,
  backendAvailable
}: MarkerPanelProps) {
  const [editingMarker, setEditingMarker] = useState<Marker | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    color: '#FF0000'
  });

  // Handle edit mode
  const startEditing = (marker: Marker) => {
    setEditingMarker(marker);
    setFormData({
      title: marker.title,
      description: marker.description || '',
      color: marker.color
    });
  };

  const cancelEditing = () => {
    setEditingMarker(null);
    setFormData({ title: '', description: '', color: '#FF0000' });
  };

  // Handle marker update
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMarker) return;

    setIsUpdating(true);
    
    const updatedMarker: Marker = {
      ...editingMarker,
      title: formData.title,
      description: formData.description || null,
      color: formData.color,
      updated_at: new Date()
    };

    if (backendAvailable) {
      try {
        const updateData: UpdateMarkerInput = {
          id: editingMarker.id,
          title: formData.title,
          description: formData.description || null,
          color: formData.color
        };

        const serverUpdatedMarker = await trpc.updateMarker.mutate(updateData);
        onMarkerUpdate(serverUpdatedMarker);
      } catch (error) {
        console.log('Backend update not available, using local update:', error instanceof Error ? error.message : 'Unknown error');
        onMarkerUpdate(updatedMarker);
      }
    } else {
      onMarkerUpdate(updatedMarker);
    }
    
    setEditingMarker(null);
    setIsUpdating(false);
  };

  // Handle marker deletion
  const handleDelete = async (markerId: number) => {
    if (!confirm('Are you sure you want to delete this marker?')) return;

    setIsDeleting(true);
    
    if (backendAvailable) {
      try {
        await trpc.deleteMarker.mutate(markerId);
        onMarkerDelete(markerId);
      } catch (error) {
        console.log('Backend delete not available, using local delete:', error instanceof Error ? error.message : 'Unknown error');
        onMarkerDelete(markerId);
      }
    } else {
      onMarkerDelete(markerId);
    }
    
    setIsDeleting(false);
  };

  // Color options for markers
  const colorOptions = [
    '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF',
    '#00FFFF', '#FFA500', '#800080', '#FFC0CB', '#A52A2A'
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-white">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Markers ({markers.length})</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            ✕
          </Button>
        </div>
        {!backendAvailable && (
          <div className="mt-2 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
            Demo mode - changes are local only
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {editingMarker ? (
          /* Edit Form */
          <div className="p-4">
            <h3 className="text-md font-medium mb-4">Edit Marker</h3>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData(prev => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Marker title"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setFormData(prev => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Optional description"
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Color</label>
                <div className="flex items-center space-x-2 mt-1">
                  <Input
                    type="color"
                    value={formData.color}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData(prev => ({ ...prev, color: e.target.value }))
                    }
                    className="w-12 h-10 p-1"
                  />
                  <div className="flex flex-wrap gap-1">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, color }))}
                        className={`w-6 h-6 rounded border-2 ${
                          formData.color === color ? 'border-gray-800' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <Button type="submit" disabled={isUpdating} className="flex-1">
                  {isUpdating ? 'Updating...' : 'Update'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={cancelEditing}
                  disabled={isUpdating}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        ) : (
          /* Marker List */
          <ScrollArea className="h-full">
            <div className="p-4">
              {markers.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <span className="text-4xl block mb-2">📍</span>
                  <p>No markers yet</p>
                  <p className="text-sm">Use the drawing tools to add markers to the map</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {markers.map((marker) => (
                    <Card
                      key={marker.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedMarker?.id === marker.id ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => onMarkerSelect(marker)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <div
                              className="text-2xl"
                              style={{ color: marker.color }}
                            >
                              📍
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm text-gray-900 truncate">
                                {marker.title}
                              </h4>
                              {marker.description && (
                                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                  {marker.description}
                                </p>
                              )}
                              <div className="flex items-center space-x-2 mt-2">
                                <span className="text-xs text-gray-400">
                                  {marker.latitude.toFixed(4)}, {marker.longitude.toFixed(4)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex space-x-1 ml-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                startEditing(marker);
                              }}
                              className="h-8 w-8 p-0"
                              title="Edit marker"
                            >
                              ✏️
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(marker.id);
                              }}
                              disabled={isDeleting}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="Delete marker"
                            >
                              🗑️
                            </Button>
                          </div>
                        </div>

                        <div className="text-xs text-gray-400 mt-2">
                          Created: {marker.created_at.toLocaleDateString()}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
