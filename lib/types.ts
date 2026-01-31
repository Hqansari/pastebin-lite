export interface Paste {
  content: string;
  ttl_seconds?: number;
  max_views?: number;
  created_at: number;
  views_count: number;
}

export interface CreatePasteRequest {
  content: string;
  ttl_seconds?: number;
  max_views?: number;
}

export interface CreatePasteResponse {
  id: string;
  url: string;
}

export interface GetPasteResponse {
  content: string;
  remaining_views: number | null;
  expires_at: string | null;
}
