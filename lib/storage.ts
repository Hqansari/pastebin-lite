import { Paste } from "./types";

// Check if we're in production with Redis configured
const useRealRedis =
  process.env.KV_REST_API_URL && process.env.NODE_ENV === "production";

let redis: any;
if (useRealRedis) {
  const { Redis } = require("@upstash/redis");
  redis = new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  });
}

// Mock storage for development
// @ts-ignore
if (!global.mockStore) {
  // @ts-ignore
  global.mockStore = new Map<
    string,
    { paste: Paste; expiresAt: number | null }
  >();
}

// @ts-ignore
const mockStore: Map<string, { paste: Paste; expiresAt: number | null }> =
  global.mockStore;

const PASTE_PREFIX = "paste:";

export async function savePaste(id: string, paste: Paste): Promise<void> {
  const key = `${PASTE_PREFIX}${id}`;

  if (useRealRedis) {
    if (paste.ttl_seconds) {
      await redis.set(key, JSON.stringify(paste), { ex: paste.ttl_seconds });
    } else {
      await redis.set(key, JSON.stringify(paste));
    }
    console.log("✅ Saved paste to Redis:", id);
    return;
  }

  // Mock storage for development
  let expiresAt: number | null = null;
  if (paste.ttl_seconds) {
    expiresAt = Date.now() + paste.ttl_seconds * 1000;
  }

  mockStore.set(key, { paste, expiresAt });
  console.log("✅ Saved paste to mock storage:", id);
}

export async function getPaste(id: string): Promise<Paste | null> {
  const key = `${PASTE_PREFIX}${id}`;

  if (useRealRedis) {
    const data = await redis.get(key);
    if (!data) {
      console.log("❌ Paste not found in Redis:", id);
      return null;
    }
    const paste = typeof data === "string" ? JSON.parse(data) : data;
    console.log("✅ Found paste in Redis:", id);
    return paste;
  }

  // Mock storage for development
  const stored = mockStore.get(key);

  if (!stored) {
    console.log("❌ Paste not found:", id);
    return null;
  }

  if (stored.expiresAt && Date.now() >= stored.expiresAt) {
    console.log("⏰ Paste expired:", id);
    mockStore.delete(key);
    return null;
  }

  console.log("✅ Found paste:", id);
  return stored.paste;
}

export async function incrementViewCount(id: string): Promise<void> {
  const key = `${PASTE_PREFIX}${id}`;

  if (useRealRedis) {
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
    return;
  }

  // Mock storage for development
  const stored = mockStore.get(key);
  if (stored) {
    stored.paste.views_count += 1;
    mockStore.set(key, stored);
    console.log("👁️ Incremented views for:", id);
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
