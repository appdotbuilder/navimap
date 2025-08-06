
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

// Import schema types
import {
  createUserInputSchema,
  updateUserInputSchema,
  createMarkerInputSchema,
  updateMarkerInputSchema,
  getMarkersInputSchema,
  createShapeInputSchema,
  updateShapeInputSchema,
  getShapesInputSchema,
  searchLocationInputSchema,
  saveMapStateInputSchema
} from './schema';

// Import handlers
import { createUser } from './handlers/create_user';
import { getUser } from './handlers/get_user';
import { updateUser } from './handlers/update_user';
import { createMarker } from './handlers/create_marker';
import { getMarkers } from './handlers/get_markers';
import { updateMarker } from './handlers/update_marker';
import { deleteMarker } from './handlers/delete_marker';
import { createShape } from './handlers/create_shape';
import { getShapes } from './handlers/get_shapes';
import { updateShape } from './handlers/update_shape';
import { deleteShape } from './handlers/delete_shape';
import { searchLocations } from './handlers/search_locations';
import { saveMapState } from './handlers/save_map_state';
import { getMapState } from './handlers/get_map_state';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // User management
  createUser: publicProcedure
    .input(createUserInputSchema)
    .mutation(({ input }) => createUser(input)),

  getUser: publicProcedure
    .input(z.number())
    .query(({ input }) => getUser(input)),

  updateUser: publicProcedure
    .input(updateUserInputSchema)
    .mutation(({ input }) => updateUser(input)),

  // Marker management
  createMarker: publicProcedure
    .input(createMarkerInputSchema)
    .mutation(({ input }) => createMarker(input)),

  getMarkers: publicProcedure
    .input(getMarkersInputSchema.optional())
    .query(({ input }) => getMarkers(input)),

  updateMarker: publicProcedure
    .input(updateMarkerInputSchema)
    .mutation(({ input }) => updateMarker(input)),

  deleteMarker: publicProcedure
    .input(z.number())
    .mutation(({ input }) => deleteMarker(input)),

  // Shape management
  createShape: publicProcedure
    .input(createShapeInputSchema)
    .mutation(({ input }) => createShape(input)),

  getShapes: publicProcedure
    .input(getShapesInputSchema.optional())
    .query(({ input }) => getShapes(input)),

  updateShape: publicProcedure
    .input(updateShapeInputSchema)
    .mutation(({ input }) => updateShape(input)),

  deleteShape: publicProcedure
    .input(z.number())
    .mutation(({ input }) => deleteShape(input)),

  // Location search
  searchLocations: publicProcedure
    .input(searchLocationInputSchema)
    .query(({ input }) => searchLocations(input)),

  // Map state management
  saveMapState: publicProcedure
    .input(saveMapStateInputSchema)
    .mutation(({ input }) => saveMapState(input)),

  getMapState: publicProcedure
    .input(z.number())
    .query(({ input }) => getMapState(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
