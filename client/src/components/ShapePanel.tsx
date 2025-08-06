
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/utils/trpc';
import type { Shape, UpdateShapeInput } from '../../../server/src/schema';

interface ShapePanelProps {
  shapes: Shape[];
  selectedShape: Shape | null;
  onShapeSelect: (shape: Shape) => void;
  onShapeUpdate: (shape: Shape) => void;
  onShapeDelete: (shapeId: number) => void;
  onClose: () => void;
  backendAvailable: boolean;
}

export function ShapePanel({
  shapes,
  selectedShape,
  onShapeSelect,
  onShapeUpdate,
  onShapeDelete,
  onClose,
  backendAvailable
}: ShapePanelProps) {
  const [editingShape, setEditingShape] = useState<Shape | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    fillColor: '#3388ff',
    strokeColor: '#3388ff',
    fillOpacity: 0.2,
    strokeWidth: 3
  });

  // Parse style JSON safely
  const parseStyle = (styleJson: string) => {
    try {
      return JSON.parse(styleJson);
    } catch {
      return {
        fillColor: '#3388ff',
        color: '#3388ff',
        fillOpacity: 0.2,
        weight: 3,
        opacity: 0.8
      };
    }
  };

  // Handle edit mode
  const startEditing = (shape: Shape) => {
    setEditingShape(shape);
    const style = parseStyle(shape.style);
    setFormData({
      name: shape.name || '',
      description: shape.description || '',
      fillColor: style.fillColor || '#3388ff',
      strokeColor: style.color || '#3388ff',
      fillOpacity: style.fillOpacity || 0.2,
      strokeWidth: style.weight || 3
    });
  };

  const cancelEditing = () => {
    setEditingShape(null);
    setFormData({
      name: '',
      description: '',
      fillColor: '#3388ff',
      strokeColor: '#3388ff',
      fillOpacity: 0.2,
      strokeWidth: 3
    });
  };

  // Handle shape update
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingShape) return;

    setIsUpdating(true);
    
    const style = {
      fillColor: formData.fillColor,
      color: formData.strokeColor,
      fillOpacity: formData.fillOpacity,
      weight: formData.strokeWidth,
      opacity: 0.8
    };

    const updatedShape: Shape = {
      ...editingShape,
      name: formData.name || null,
      description: formData.description || null,
      style: JSON.stringify(style),
      updated_at: new Date()
    };

    if (backendAvailable) {
      try {
        const updateData: UpdateShapeInput = {
          id: editingShape.id,
          name: formData.name || null,
          description: formData.description || null,
          style: JSON.stringify(style)
        };

        const serverUpdatedShape = await trpc.updateShape.mutate(updateData);
        onShapeUpdate(serverUpdatedShape);
      } catch (error) {
        console.log('Backend update not available, using local update:', error instanceof Error ? error.message : 'Unknown error');
        onShapeUpdate(updatedShape);
      }
    } else {
      onShapeUpdate(updatedShape);
    }
    
    setEditingShape(null);
    setIsUpdating(false);
  };

  // Handle shape deletion
  const handleDelete = async (shapeId: number) => {
    if (!confirm('Are you sure you want to delete this shape?')) return;

    setIsDeleting(true);
    
    if (backendAvailable) {
      try {
        await trpc.deleteShape.mutate(shapeId);
        onShapeDelete(shapeId);
      } catch (error) {
        console.log('Backend delete not available, using local delete:', error instanceof Error ? error.message : 'Unknown error');
        onShapeDelete(shapeId);
      }
    } else {
      onShapeDelete(shapeId);
    }
    
    setIsDeleting(false);
  };

  // Get shape icon
  const getShapeIcon = (shapeType: string) => {
    const icons: Record<string, string> = {
      polygon: '⬟',
      polyline: '📏',
      circle: '⭕',
      rectangle: '▭'
    };
    return icons[shapeType] || '⬟';
  };

  // Get shape type display name
  const getShapeTypeName = (shapeType: string) => {
    const names: Record<string, string> = {
      polygon: 'Polygon',
      polyline: 'Line',
      circle: 'Circle',
      rectangle: 'Rectangle'
    };
    return names[shapeType] || shapeType;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-white">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Shapes ({shapes.length})</h2>
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
        {editingShape ? (
          /* Edit Form */
          <div className="p-4">
            <h3 className="text-md font-medium mb-4">Edit Shape</h3>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Name</label>
                <Input
                  value={formData.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData(prev => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Shape name (optional)"
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Fill Color</label>
                  <Input
                    type="color"
                    value={formData.fillColor}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData(prev => ({ ...prev, fillColor: e.target.value }))
                    }
                    className="h-10 p-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Stroke Color</label>
                  <Input
                    type="color"
                    value={formData.strokeColor}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData(prev => ({ ...prev, strokeColor: e.target.value }))
                    }
                    className="h-10 p-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Fill Opacity</label>
                  <Input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={formData.fillOpacity}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData(prev => ({ ...prev, fillOpacity: parseFloat(e.target.value) }))
                    }
                    className="h-10"
                  />
                  <div className="text-xs text-gray-500 mt-1">{formData.fillOpacity}</div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Stroke Width</label>
                  <Input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={formData.strokeWidth}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData(prev => ({ ...prev, strokeWidth: parseInt(e.target.value) }))
                    }
                    className="h-10"
                  />
                  <div className="text-xs text-gray-500 mt-1">{formData.strokeWidth}px</div>
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
          /* Shape List */
          <ScrollArea className="h-full">
            <div className="p-4">
              {shapes.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <span className="text-4xl block mb-2">⬟</span>
                  <p>No shapes yet</p>
                  <p className="text-sm">Use the drawing tools to add shapes to the map</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {shapes.map((shape) => {
                    const style = parseStyle(shape.style);
                    return (
                      <Card
                        key={shape.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedShape?.id === shape.id ? 'ring-2 ring-blue-500' : ''
                        }`}
                        onClick={() => onShapeSelect(shape)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              <div className="text-2xl">
                                {getShapeIcon(shape.shape_type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-1">
                                  <h4 className="font-medium text-sm text-gray-900 truncate">
                                    {shape.name || `Untitled ${getShapeTypeName(shape.shape_type)}`}
                                  </h4>
                                  <Badge variant="secondary" className="text-xs">
                                    {getShapeTypeName(shape.shape_type)}
                                  </Badge>
                                </div>
                                {shape.description && (
                                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                    {shape.description}
                                  </p>
                                )}
                                <div className="flex items-center space-x-2 mt-2">
                                  <div
                                    className="w-4 h-4 rounded border"
                                    style={{
                                      backgroundColor: style.fillColor,
                                      borderColor: style.color,
                                      opacity: style.fillOpacity + 0.3
                                    }}
                                  />
                                  <span className="text-xs text-gray-400">
                                    {style.fillColor}
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
                                  startEditing(shape);
                                }}
                                className="h-8 w-8 p-0"
                                title="Edit shape"
                              >
                                ✏️
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(shape.id);
                                }}
                                disabled={isDeleting}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                title="Delete shape"
                              >
                                🗑️
                              </Button>
                            </div>
                          </div>

                          <div className="text-xs text-gray-400 mt-2">
                            Created: {shape.created_at.toLocaleDateString()}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
