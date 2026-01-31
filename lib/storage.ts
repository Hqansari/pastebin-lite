import { Paste } from "./types";

// Global storage that persists across requests during development
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

  let expiresAt: number | null = null;
  if (paste.ttl_seconds) {
    expiresAt = Date.now() + paste.ttl_seconds * 1000;
  }

  mockStore.set(key, { paste, expiresAt });
  console.log("✅ Saved paste:", id, "Total pastes:", mockStore.size);
}

export async function getPaste(id: string): Promise<Paste | null> {
  const key = `${PASTE_PREFIX}${id}`;
  const stored = mockStore.get(key);

  if (!stored) {
    console.log("❌ Paste not found:", id);
    return null;
  }

  // Check if expired
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
  const stored = mockStore.get(key);

  if (stored) {
    stored.paste.views_count += 1;
    mockStore.set(key, stored);
    console.log(
      "👁️ Incremented views for:",
      id,
      "to",
      stored.paste.views_count,
    );
  }
}

export async function healthCheck(): Promise<boolean> {
  console.log(
    "💚 Health check: OK (Mock storage with",
    mockStore.size,
    "pastes)",
  );
  return true;
}
