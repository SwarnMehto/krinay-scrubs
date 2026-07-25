import "server-only";

import * as dns from "node:dns";
import mongoose from "mongoose";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
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

/*
 * Node.js ke DNS resolver ke liye public DNS set karta hai.
 *
 * Tumhare system me Windows SRV resolve kar raha tha,
 * lekin Node.js querySrv ECONNREFUSED de raha tha.
 *
 * Isliye MongoDB connect hone se pehle Node DNS
 * explicitly configure kar rahe hain.
 */
function configureMongoDns() {
  if (dnsConfigured) {
    return;
  }

  const envDnsServers =
    process.env.MONGODB_DNS_SERVERS
      ?.split(",")
      .map((server) =>
        server.trim(),
      )
      .filter(Boolean);

  const dnsServers =
    envDnsServers &&
    envDnsServers.length > 0
      ? envDnsServers
      : [
          "1.1.1.1",
          "8.8.8.8",
        ];

  try {
    dns.setServers(
      dnsServers,
    );

    console.log(
      "MongoDB DNS servers:",
      dns.getServers(),
    );

    dnsConfigured = true;
  } catch (error) {
    console.error(
      "MongoDB DNS configuration failed:",
      error,
    );

    throw error;
  }
}

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
  /*
   * MongoDB SRV lookup se pehle
   * Node DNS configure karna important hai.
   */
  configureMongoDns();

  /*
   * Already connected ho to same connection reuse karo.
   */
  if (
    cached.conn &&
    mongoose.connection
      .readyState === 1
  ) {
    return cached.conn;
  }

  /*
   * Kabhi mongoose connected ho,
   * lekin cached.conn reset ho gaya ho,
   * to current mongoose instance reuse karenge.
   */
  if (
    mongoose.connection
      .readyState === 1
  ) {
    cached.conn =
      mongoose;

    return cached.conn;
  }

  if (!cached.promise) {
    /*
     * URI ko isi function ke andar validate kar rahe hain.
     */
    const mongoUri =
      getMongoUri();

    cached.promise =
      mongoose
        .connect(
          mongoUri,
          {
            bufferCommands:
              false,

            /*
             * Agar Atlas connect nahi hota,
             * request bahut der hang na rahe.
             */
            serverSelectionTimeoutMS:
              10000,
          },
        )
        .then(
          (
            mongooseInstance,
          ) => {
            console.log(
              "MongoDB connected successfully.",
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

            console.error(
              "MongoDB connection failed:",
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