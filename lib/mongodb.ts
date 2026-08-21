import "server-only";

import * as dns from "node:dns";
import mongoose from "mongoose";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache:
    | MongooseCache
    | undefined;
}

const cached: MongooseCache =
  globalThis.mongooseCache ?? {
    conn: null,
    promise: null,
  };

globalThis.mongooseCache = cached;

let dnsConfigured = false;

function configureMongoDns() {
  if (dnsConfigured) {
    return;
  }

  const envServers =
    process.env.MONGODB_DNS_SERVERS
      ?.split(",")
      .map((server) =>
        server.trim(),
      )
      .filter(Boolean);

  const servers =
    envServers &&
    envServers.length > 0
      ? envServers
      : [
          "1.1.1.1",
          "8.8.8.8",
        ];

  dns.setServers(
    servers,
  );

  console.log(
    "[MongoDB] Node DNS servers:",
    dns.getServers(),
  );

  dnsConfigured = true;
}

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
  /*
   * mongodb+srv SRV lookup se pehle
   * Node DNS explicitly configure karo.
   */
  configureMongoDns();

  /*
   * Existing connected instance reuse.
   */
  if (
    cached.conn &&
    mongoose.connection.readyState ===
      1
  ) {
    return cached.conn;
  }

  if (
    mongoose.connection.readyState ===
    1
  ) {
    cached.conn =
      mongoose;

    return cached.conn;
  }

  /*
   * Agar previous connection state broken/disconnected
   * ho gaya ho to stale cache remove kar do.
   */
  if (
    mongoose.connection.readyState ===
      0
  ) {
    cached.conn =
      null;
  }

  if (!cached.promise) {
    const mongoUri =
      getMongoUri();

    console.log(
      "[MongoDB] Starting connection...",
    );

    cached.promise =
      mongoose
        .connect(
          mongoUri,
          {
            bufferCommands:
              false,

            serverSelectionTimeoutMS:
              10000,

            connectTimeoutMS:
              10000,

            socketTimeoutMS:
              45000,

            maxPoolSize:
              10,
          },
        )
        .then(
          (
            mongooseInstance,
          ) => {
            console.log(
              "[MongoDB] Connected successfully.",
            );

            return mongooseInstance;
          },
        )
        .catch(
          (
            error: unknown,
          ) => {
            cached.promise =
              null;

            cached.conn =
              null;

            console.error(
              "[MongoDB] Connection failed:",
              error,
            );

            throw error;
          },
        );
  }

  try {
    cached.conn =
      await cached.promise;

    return cached.conn;
  } catch (error) {
    cached.promise =
      null;

    cached.conn =
      null;

    throw error;
  }
}

export default connectDatabase;