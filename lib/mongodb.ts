import "server-only";

import mongoose from "mongoose";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache =
  globalThis.mongooseCache ?? {
    conn: null,
    promise: null,
  };

globalThis.mongooseCache = cached;

/*
 * Is function ka return type explicitly string hai.
 * Isliye mongoose.connect() ko undefined nahi milega.
 */
function getMongoUri(): string {
  const mongoUri =
    process.env.MONGODB_URI?.trim();

  if (!mongoUri) {
    throw new Error(
      "MONGODB_URI missing hai. .env.local ya Vercel Environment Variables check karo.",
    );
  }

  return mongoUri;
}

export async function connectDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    /*
     * Important:
     * URI ko isi function ke andar validate kar rahe hain.
     */
    const mongoUri = getMongoUri();

    cached.promise = mongoose
      .connect(mongoUri, {
        bufferCommands: false,
      })
      .then((mongooseInstance) => {
        console.log(
          "MongoDB connected successfully.",
        );

        return mongooseInstance;
      })
      .catch((error: unknown) => {
        cached.promise = null;

        console.error(
          "MongoDB connection failed:",
          error,
        );

        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;

    return cached.conn;
  } catch (error) {
    cached.promise = null;

    throw error;
  }
}