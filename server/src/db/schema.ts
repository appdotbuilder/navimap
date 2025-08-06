
import { serial, text, pgTable, timestamp, numeric, integer, pgEnum } from 'drizzle-orm/pg-core';

// Enum definitions
export const basemapProviderEnum = pgEnum('basemap_provider', ['google', 'arcgis', 'openstreetmap']);
export const basemapTypeEnum = pgEnum('basemap_type', [
  'satellite',
  'arcgis_imagery',
  'arcgis_imagery_hybrid',
  'arcgis_streets',
  'arcgis_topographic',
  'arcgis_navigation',
  'arcgis_streets_night',
  'arcgis_terrain_labels',
  'osm_standard',
  'osm_cyclosm',
  'osm_cycle_map',
  'osm_transport_map',
  'osm_tracestrack_topo',
  'osm_humanitarian',
  'osm_shortbread'
]);
export const shapeTypeEnum = pgEnum('shape_type', ['polygon', 'polyline', 'circle', 'rectangle']);

// Users table
export const usersTable = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  avatar_url: text('avatar_url'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Markers table
export const markersTable = pgTable('markers', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  latitude: numeric('latitude', { precision: 10, scale: 8 }).notNull(),
  longitude: numeric('longitude', { precision: 11, scale: 8 }).notNull(),
  title: text('title').notNull(),
  description: text('description'),
  color: text('color').notNull().default('#FF0000'),
  icon: text('icon'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Shapes table
export const shapesTable = pgTable('shapes', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  shape_type: shapeTypeEnum('shape_type').notNull(),
  coordinates: text('coordinates').notNull(), // JSON string of coordinates
  style: text('style').notNull().default('{}'), // JSON string of style properties
  name: text('name'),
  description: text('description'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Map states table for storing user preferences
export const mapStatesTable = pgTable('map_states', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }).unique(),
  center_latitude: numeric('center_latitude', { precision: 10, scale: 8 }).notNull(),
  center_longitude: numeric('center_longitude', { precision: 11, scale: 8 }).notNull(),
  zoom_level: integer('zoom_level').notNull(),
  active_basemap: basemapTypeEnum('active_basemap').notNull().default('osm_standard'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// TypeScript types for the table schemas
export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;

export type Marker = typeof markersTable.$inferSelect;
export type NewMarker = typeof markersTable.$inferInsert;

export type Shape = typeof shapesTable.$inferSelect;
export type NewShape = typeof shapesTable.$inferInsert;

export type MapState = typeof mapStatesTable.$inferSelect;
export type NewMapState = typeof mapStatesTable.$inferInsert;

// Export all tables for proper query building
export const tables = {
  users: usersTable,
  markers: markersTable,
  shapes: shapesTable,
  mapStates: mapStatesTable
};
