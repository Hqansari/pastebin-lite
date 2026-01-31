import { notFound } from "next/navigation";
import { getPaste } from "@/lib/storage";
import { isPasteExpired, hasExceededViewLimit } from "@/lib/utils";

async function getPasteData(id: string) {
  const paste = await getPaste(id);

  if (!paste) {
    return null;
  }

  const currentTime = Date.now();

  if (isPasteExpired(paste, currentTime) || hasExceededViewLimit(paste)) {
    return null;
  }

  return paste;
}

export default async function PastePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Await the params in Next.js 15
  const { id } = await params;

  const paste = await getPasteData(id);

  if (!paste) {
    notFound();
  }

  return (
    <div className="container">
      <div className="glass-card">
        <h1>Your Paste</h1>
        <p className="subtitle">
          Content ID:{" "}
          <code
            style={{
              background: "rgba(0, 102, 255, 0.1)",
              padding: "4px 8px",
              borderRadius: "6px",
              fontSize: "0.9em",
            }}
          >
            {id}
          </code>
        </p>

        <div className="paste-content">
          <pre>{paste.content}</pre>
        </div>

        <a href="/" className="back-link">
          ← Create another paste
        </a>
      </div>
    </div>
  );
}
