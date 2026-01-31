import { NextRequest, NextResponse } from "next/server";
import { CreatePasteRequest, CreatePasteResponse, Paste } from "@/lib/types";
import { savePaste } from "@/lib/storage";
import { generateId, getCurrentTime } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    // Parse JSON body
    const body = await request.json();

    console.log("Received body:", body);

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

    // Validate ttl_seconds
    if (
      body.ttl_seconds !== undefined &&
      body.ttl_seconds !== null &&
      body.ttl_seconds !== ""
    ) {
      const ttl = Number(body.ttl_seconds);
      if (!Number.isInteger(ttl) || ttl < 1) {
        return NextResponse.json(
          { error: "ttl_seconds must be an integer >= 1" },
          { status: 400 },
        );
      }
      body.ttl_seconds = ttl;
    } else {
      delete body.ttl_seconds;
    }

    // Validate max_views
    if (
      body.max_views !== undefined &&
      body.max_views !== null &&
      body.max_views !== ""
    ) {
      const maxViews = Number(body.max_views);
      if (!Number.isInteger(maxViews) || maxViews < 1) {
        return NextResponse.json(
          { error: "max_views must be an integer >= 1" },
          { status: 400 },
        );
      }
      body.max_views = maxViews;
    } else {
      delete body.max_views;
    }

    const id = generateId();
    const currentTime = getCurrentTime(request);

    const paste: Paste = {
      content: body.content,
      ttl_seconds: body.ttl_seconds,
      max_views: body.max_views,
      created_at: currentTime,
      views_count: 0,
    };

    console.log("Saving paste:", paste);

    await savePaste(id, paste);

    // Get the base URL from the request
    const protocol = request.headers.get("x-forwarded-proto") || "http";
    const host = request.headers.get("host") || "localhost:3000";
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`;

    const response: CreatePasteResponse = {
      id,
      url: `${baseUrl}/p/${id}`,
    };

    console.log("Returning response:", response);

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Error creating paste:", error);

    // If it's a JSON parse error
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "An error occurred while creating the paste" },
      { status: 500 },
    );
  }
}
