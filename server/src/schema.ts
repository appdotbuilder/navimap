
import { z } from 'zod';

// Basemap provider enum
export const basemapProviderSchema = z.enum(['google', 'arcgis', 'openstreetmap']);
export type BasemapProvider = z.infer<typeof basemapProviderSchema>;

// Basemap type schema
export const basemapTypeSchema = z.enum([
  // Google Earth
  'satellite',
  // ArcGIS layers
  'arcgis_imagery',
  'arcgis_imagery_hybrid',
  'arcgis_streets',
  'arcgis_topographic',
  'arcgis_navigation',
  'arcgis_streets_night',
  'arcgis_terrain_labels',
  // OpenStreetMap layers
  'osm_standard',
  'osm_cyclosm',
  'osm_cycle_map',
  'osm_transport_map',
  'osm_tracestrack_topo',
  'osm_humanitarian',
  'osm_shortbread'
]);
export type BasemapType = z.infer<typeof basemapTypeSchema>;

// Marker schema
export const markerSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  latitude: z.number(),
  longitude: z.number(),
  title: z.string(),
  description: z.string().nullable(),
  color: z.string().default('#FF0000'),
  icon: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});
export type Marker = z.infer<typeof markerSchema>;

// Shape type enum
export const shapeTypeSchema = z.enum(['polygon', 'polyline', 'circle', 'rectangle']);
export type ShapeType = z.infer<typeof shapeTypeSchema>;

// Shape schema
export const shapeSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  shape_type: shapeTypeSchema,
  coordinates: z.string(), // JSON string of coordinates
  style: z.string(), // JSON string of style properties (color, strokeWidth, etc.)
  name: z.string().nullable(),
  description: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});
export type Shape = z.infer<typeof shapeSchema>;

// User schema
export const userSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string().email(),
  avatar_url: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});
export type User = z.infer<typeof userSchema>;

// Search result schema
export const searchResultSchema = z.object({
  place_id: z.string(),
  display_name: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  address: z.string().nullable(),
  place_type: z.string().nullable(),
  importance: z.number().nullable()
});
export type SearchResult = z.infer<typeof searchResultSchema>;

// Map state schema for user preferences
export const mapStateSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  center_latitude: z.number(),
  center_longitude: z.number(),
  zoom_level: z.number(),
  active_basemap: basemapTypeSchema,
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});
export type MapState = z.infer<typeof mapStateSchema>;

// Input schemas for creating/updating entities

export const createMarkerInputSchema = z.object({
  user_id: z.number(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  title: z.string().min(1).max(255),
  description: z.string().nullable().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  icon: z.string().nullable().optional()
});
export type CreateMarkerInput = z.infer<typeof createMarkerInputSchema>;

export const updateMarkerInputSchema = z.object({
  id: z.number(),
  title: z.string().min(1).max(255).optional(),
  description: z.string().nullable().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  icon: z.string().nullable().optional()
});
export type UpdateMarkerInput = z.infer<typeof updateMarkerInputSchema>;

export const createShapeInputSchema = z.object({
  user_id: z.number(),
  shape_type: shapeTypeSchema,
  coordinates: z.string(), // JSON string
  style: z.string().optional(), // JSON string
  name: z.string().nullable().optional(),
  description: z.string().nullable().optional()
});
export type CreateShapeInput = z.infer<typeof createShapeInputSchema>;

export const updateShapeInputSchema = z.object({
  id: z.number(),
  coordinates: z.string().optional(),
  style: z.string().optional(),
  name: z.string().nullable().optional(),
  description: z.string().nullable().optional()
});
export type UpdateShapeInput = z.infer<typeof updateShapeInputSchema>;

export const createUserInputSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  avatar_url: z.string().url().nullable().optional()
});
export type CreateUserInput = z.infer<typeof createUserInputSchema>;

export const updateUserInputSchema = z.object({
  id: z.number(),
  username: z.string().min(3).max(50).optional(),
  email: z.string().email().optional(),
  avatar_url: z.string().url().nullable().optional()
});
export type UpdateUserInput = z.infer<typeof updateUserInputSchema>;

export const saveMapStateInputSchema = z.object({
  user_id: z.number(),
  center_latitude: z.number().min(-90).max(90),
  center_longitude: z.number().min(-180).max(180),
  zoom_level: z.number().min(1).max(20),
  active_basemap: basemapTypeSchema
});
export type SaveMapStateInput = z.infer<typeof saveMapStateInputSchema>;

export const searchLocationInputSchema = z.object({
  query: z.string().min(1),
  limit: z.number().min(1).max(50).optional().default(10)
});
export type SearchLocationInput = z.infer<typeof searchLocationInputSchema>;

export const getMarkersInputSchema = z.object({
  user_id: z.number().optional(),
  bounds: z.object({
    north: z.number(),
    south: z.number(),
    east: z.number(),
    west: z.number()
  }).optional()
});
export type GetMarkersInput = z.infer<typeof getMarkersInputSchema>;

export const getShapesInputSchema = z.object({
  user_id: z.number().optional(),
  bounds: z.object({
    north: z.number(),
    south: z.number(),
    east: z.number(),
    west: z.number()
  }).optional()
});
export type GetShapesInput = z.infer<typeof getShapesInputSchema>;
