import { Paste } from "./types";

export function generateId(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

export function getCurrentTime(request: Request): number {
  const testMode = process.env.TEST_MODE === "1";

  if (testMode) {
    const testNowMs = request.headers.get("x-test-now-ms");
    if (testNowMs) {
      return parseInt(testNowMs, 10);
    }
  }

  return Date.now();
}

export function isPasteExpired(paste: Paste, currentTime: number): boolean {
  if (paste.ttl_seconds) {
    const expiryTime = paste.created_at + paste.ttl_seconds * 1000;
    return currentTime >= expiryTime;
  }
  return false;
}

export function hasExceededViewLimit(paste: Paste): boolean {
  if (paste.max_views !== undefined) {
    return paste.views_count >= paste.max_views;
  }
  return false;
}

export function getExpiresAt(paste: Paste): string | null {
  if (paste.ttl_seconds) {
    const expiryTime = paste.created_at + paste.ttl_seconds * 1000;
    return new Date(expiryTime).toISOString();
  }
  return null;
}

export function getRemainingViews(paste: Paste): number | null {
  if (paste.max_views !== undefined) {
    return Math.max(0, paste.max_views - paste.views_count);
  }
  return null;
}
