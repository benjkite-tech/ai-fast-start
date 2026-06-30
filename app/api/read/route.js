import { NextResponse } from "next/server";

export const runtime = "nodejs";

// --- simple in-memory rate limit -------------------------------------------
// Per-IP cap so an open link can't run up a bill. In-memory resets on cold
// start, fine for this. For heavier needs, swap in Upstash/Redis.
const REQS = 6;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const hits = new Map();

function rateLimited(ip) {
  const now = Date.now();
  const rec = hits.get(ip) || { count: 0, start: now };
  if (now - rec.start > WINDOW_MS) {
    hits.set(ip, { count: 1, start: now });
    return false;
  }
  rec.count += 1;
  hits.set(ip, rec);
  return rec.count > REQS;
}

export async function POST(req) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "You've run a few reads in a short window. Give it an hour and try again." },
      { status: 429 }
    );
  }

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "Server isn't configured with an API key yet." },
      { status: 500 }
    );
  }

  let payload;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  const { system, user } = payload || {};
  if (!system || !user) {
    return NextResponse.json({ error: "Missing prompt." }, { status: 400 });
  }

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1200,
        system,
        messages: [{ role: "user", content: user }],
      }),
    });

    if (!r.ok) {
      const detail = await r.text();
      return NextResponse.json(
        { error: "The model call failed.", detail: detail.slice(0, 300) },
        { status: 502 }
      );
    }

    const data = await r.json();
    const text = (data.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();

    if (!text) return NextResponse.json({ error: "Empty read." }, { status: 502 });

    return NextResponse.json({ read: text });
  } catch (e) {
    return NextResponse.json({ error: "Something went wrong reaching the model." }, { status: 500 });
  }
}
