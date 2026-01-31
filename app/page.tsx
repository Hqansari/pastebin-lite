"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [ttlSeconds, setTtlSeconds] = useState("");
  const [maxViews, setMaxViews] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const body: any = { content };

      if (ttlSeconds) {
        body.ttl_seconds = parseInt(ttlSeconds, 10);
      }

      if (maxViews) {
        body.max_views = parseInt(maxViews, 10);
      }

      console.log("Sending request with body:", body); // Debug log

      const response = await fetch("/api/pastes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      console.log("Response:", data); // Debug log

      if (!response.ok) {
        setError(data.error || "Failed to create paste");
        setLoading(false);
        return;
      }

      router.push(`/p/${data.id}`);
    } catch (err) {
      console.error("Error:", err); // Debug log
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="glass-card">
        <h1>Pastebin Lite</h1>
        <p className="subtitle">Share text, code, and ideas with style ✨</p>

        {error && <div className="error-box">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ "--delay": "0s" } as any}>
            <label htmlFor="content">
              CONTENT <span className="badge">Required</span>
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              placeholder="Paste your code, text, or ideas here..."
            />
            <p className="info-text">
              Your content will be stored securely and can be shared via a
              unique link
            </p>
          </div>

          <div className="options-grid">
            <div className="form-group" style={{ "--delay": "0.1s" } as any}>
              <label htmlFor="ttl">Expiration Time</label>
              <input
                id="ttl"
                type="number"
                value={ttlSeconds}
                onChange={(e) => setTtlSeconds(e.target.value)}
                min="1"
                placeholder="Seconds (optional)"
              />
              <p className="info-text">Auto-delete after time expires</p>
            </div>

            <div className="form-group" style={{ "--delay": "0.2s" } as any}>
              <label htmlFor="maxViews">View Limit</label>
              <input
                id="maxViews"
                type="number"
                value={maxViews}
                onChange={(e) => setMaxViews(e.target.value)}
                min="1"
                placeholder="Views (optional)"
              />
              <p className="info-text">Delete after max views reached</p>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn">
            {loading ? (
              <>
                <span className="spinner"></span>
                <span style={{ marginLeft: "12px" }}>Creating...</span>
              </>
            ) : (
              "Create Paste →"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
