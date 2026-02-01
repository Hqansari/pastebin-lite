import { Paste } from "./types";

// Extend the global object with proper typing
declare global {
  var mockStore:
    | Map<string, { paste: Paste; expiresAt: number | null }>
    | undefined;
}

// Use Redis if we have the credentials (works in both preview and production)
const useRealRedis = !!(
  process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
);

let redis: any;
if (useRealRedis) {
  const { Redis } = require("@upstash/redis");
  redis = new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  });
  console.log("✅ Using Redis for storage");
} else {
  console.log("⚠️ Using mock storage - pastes will not persist!");
}

// Mock storage for development - properly typed
if (!global.mockStore) {
  global.mockStore = new Map<
    string,
    { paste: Paste; expiresAt: number | null }
  >();
}

const mockStore = global.mockStore;

const PASTE_PREFIX = "paste:";

export async function savePaste(id: string, paste: Paste): Promise<void> {
  const key = `${PASTE_PREFIX}${id}`;

  if (useRealRedis) {
    try {
      if (paste.ttl_seconds) {
        await redis.set(key, JSON.stringify(paste), { ex: paste.ttl_seconds });
      } else {
        await redis.set(key, JSON.stringify(paste));
      }
      console.log("✅ Saved paste to Redis:", id);
      return;
    } catch (error) {
      console.error("❌ Failed to save to Redis:", error);
      throw error;
    }
  }

  // Mock storage for development
  let expiresAt: number | null = null;
  if (paste.ttl_seconds) {
    expiresAt = Date.now() + paste.ttl_seconds * 1000;
  }

  mockStore.set(key, { paste, expiresAt });
  console.log("⚠️ Saved paste to mock storage:", id);
}

export async function getPaste(id: string): Promise<Paste | null> {
  const key = `${PASTE_PREFIX}${id}`;

  if (useRealRedis) {
    try {
      const data = await redis.get(key);
      if (!data) {
        console.log("❌ Paste not found in Redis:", id);
        return null;
      }
      const paste = typeof data === "string" ? JSON.parse(data) : data;
      console.log("✅ Found paste in Redis:", id);
      return paste;
    } catch (error) {
      console.error("❌ Failed to get from Redis:", error);
      return null;
    }
  }

  // Mock storage for development
  const stored = mockStore.get(key);

  if (!stored) {
    console.log("❌ Paste not found in mock storage:", id);
    return null;
  }

  if (stored.expiresAt && Date.now() >= stored.expiresAt) {
    console.log("⏰ Paste expired:", id);
    mockStore.delete(key);
    return null;
  }

  console.log("✅ Found paste in mock storage:", id);
  return stored.paste;
}

export async function incrementViewCount(id: string): Promise<void> {
  const key = `${PASTE_PREFIX}${id}`;

  if (useRealRedis) {
    try {
      const data = await redis.get(key);
      if (data) {
        const paste = typeof data === "string" ? JSON.parse(data) : data;
        paste.views_count += 1;

        const ttl = await redis.ttl(key);
        if (ttl > 0) {
          await redis.set(key, JSON.stringify(paste), { ex: ttl });
        } else {
          await redis.set(key, JSON.stringify(paste));
        }
        console.log("👁️ Incremented views in Redis for:", id);
      }
    } catch (error) {
      console.error("❌ Failed to increment views in Redis:", error);
    }
    return;
  }

  // Mock storage for development
  const stored = mockStore.get(key);
  if (stored) {
    stored.paste.views_count += 1;
    mockStore.set(key, stored);
    console.log("👁️ Incremented views in mock storage for:", id);
  }
}

export async function healthCheck(): Promise<boolean> {
  if (useRealRedis) {
    try {
      await redis.ping();
      console.log("💚 Health check: Redis OK");
      return true;
    } catch (error) {
      console.error("❌ Redis health check failed:", error);
      return false;
    }
  }

  console.log("💚 Health check: Mock storage OK");
  return true;
}
