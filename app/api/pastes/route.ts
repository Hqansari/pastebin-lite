import { NextRequest, NextResponse } from "next/server";
import { savePaste } from "@/lib/storage";
import { generateId } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log("📥 Received request:", body);

    // Validate content
    if (
      !body.content ||
      typeof body.content !== "string" ||
      body.content.trim() === ""
    ) {
      return NextResponse.json(
        { error: "Content is required and must be a non-empty string" },
        { status: 400 },
      );
    }

    // Parse and validate ttl_seconds
    let ttlSeconds: number | undefined;
    if (
      body.ttl_seconds !== undefined &&
      body.ttl_seconds !== null &&
      body.ttl_seconds !== ""
    ) {
      ttlSeconds = Number(body.ttl_seconds);
      if (!Number.isInteger(ttlSeconds) || ttlSeconds < 1) {
        return NextResponse.json(
          { error: "ttl_seconds must be an integer >= 1" },
          { status: 400 },
        );
      }
    }

    // Parse and validate max_views
    let maxViews: number | undefined;
    if (
      body.max_views !== undefined &&
      body.max_views !== null &&
      body.max_views !== ""
    ) {
      maxViews = Number(body.max_views);
      if (!Number.isInteger(maxViews) || maxViews < 1) {
        return NextResponse.json(
          { error: "max_views must be an integer >= 1" },
          { status: 400 },
        );
      }
    }

    const id = generateId();
    const currentTime = Date.now();

    const paste = {
      content: body.content,
      ttl_seconds: ttlSeconds,
      max_views: maxViews,
      created_at: currentTime,
      views_count: 0,
    };

    console.log("💾 Saving paste:", id);

    await savePaste(id, paste);

    const protocol = request.headers.get("x-forwarded-proto") || "http";
    const host = request.headers.get("host") || "localhost:3000";
    const baseUrl = `${protocol}://${host}`;

    const response = {
      id,
      url: `${baseUrl}/p/${id}`,
    };

    console.log("✅ Success:", response);

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("❌ Error:", error);

    return NextResponse.json(
      { error: "An error occurred while creating the paste" },
      { status: 500 },
    );
  }
}
