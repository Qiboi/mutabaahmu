import mongoose from "mongoose";

/**
 * Cache the connection on the Node.js global object.
 * Prevents creating a new connection on every hot-reload in dev,
 * and every cold invocation in serverless environments.
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var _mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global._mongooseCache ?? { conn: null, promise: null };
global._mongooseCache = cached;

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    // Read lazily (not at module top-level): ES module imports are hoisted, so a
    // top-level check here would run before scripts like scripts/seed.ts get a
    // chance to load .env.local via dotenv.
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error(
        "Missing MONGODB_URI environment variable. Add it to .env.local (see .env.example).",
      );
    }

    cached.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false,
        maxPoolSize: 10,
      })
      .then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }

  return cached.conn;
}
