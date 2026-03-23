import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";

// Extend the global type so we can cache the client in development.
// In production a new client is created per request context.
declare global {
  var __prisma: PrismaClient | undefined;
}

function createClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Add it to .env or your hosting environment variables.",
    );
  }

  // PrismaNeon uses the Neon serverless driver which supports HTTP and WebSocket
  // connections — important for serverless/edge environments like Hostinger.
  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({ adapter });
}

export function getPrismaClient(): PrismaClient {
  // Reuse the client across hot-reloads in development to avoid exhausting
  // the connection pool.
  if (process.env.NODE_ENV !== "production") {
    if (!globalThis.__prisma) {
      globalThis.__prisma = createClient();
    }
    return globalThis.__prisma;
  }

  return createClient();
}
