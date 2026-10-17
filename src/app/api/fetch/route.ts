import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
const blockedHost = (hostname: string) => {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  return host === "localhost" || host.endsWith(".localhost") || host === "::1" || host === "0.0.0.0" ||
    /^127\./.test(host) || /^10\./.test(host) || /^192\.168\./.test(host) ||
    /^169\.254\./.test(host) || /^172\.(1[6-9]|2\d|3[01])\./.test(host) || host.endsWith(".local");
};
export async function POST(request: NextRequest) {
  const key = process.env.TINYFISH_API_KEY;
  if (!key) return NextResponse.json({ error: "Web extraction is not configured. Add TINYFISH_API_KEY to .env.local; see README.md." }, { status: 503 });
  let body: { urls?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Send JSON with a urls array." }, { status: 400 }); }
  if (!Array.isArray(body.urls) || body.urls.length < 1 || body.urls.length > 5 || !body.urls.every((x) => typeof x === "string")) {
    return NextResponse.json({ error: "Provide between 1 and 5 URLs." }, { status: 400 });
  }
  const urls: string[] = [];
  for (const raw of body.urls as string[]) {
    if (raw.length > 2048) return NextResponse.json({ error: "A URL is too long." }, { status: 400 });
    try {
      const parsed = new URL(raw);
      if (!["http:", "https:"].includes(parsed.protocol) || blockedHost(parsed.hostname) || parsed.username || parsed.password) {
        return NextResponse.json({ error: "Only public HTTP/HTTPS URLs are allowed." }, { status: 400 });
      }
      urls.push(parsed.toString());
    } catch { return NextResponse.json({ error: "One or more URLs are invalid." }, { status: 400 }); }
  }
  try {
    const response = await fetch("https://api.fetch.tinyfish.ai", {
      method: "POST",
      headers: { "X-API-Key": key, "Content-Type": "application/json" },
      body: JSON.stringify({ urls, format: "markdown", links: true, image_links: true }),
      signal: AbortSignal.timeout(90000),
      cache: "no-store"
    });
    if (!response.ok) return NextResponse.json({ error: response.status === 429 ? "TinyFish rate limit reached. Wait and retry." : `TinyFish fetch returned HTTP ${response.status}.` }, { status: response.status === 429 ? 429 : 502 });
    const data = await response.json();
    const results = Array.isArray(data.results) ? data.results.map((item: Record<string, unknown>) => ({
      url: String(item.url ?? ""), finalUrl: String(item.final_url ?? item.url ?? ""),
      title: String(item.title ?? "Fetched page").slice(0, 300),
      text: String(item.text ?? "").slice(0, 24000),
      imageLinks: Array.isArray(item.image_links) ? item.image_links.filter((x: unknown) => typeof x === "string" && /^https?:\/\//i.test(x)).slice(0, 30) : [],
      links: Array.isArray(item.links) ? item.links.filter((x: unknown) => typeof x === "string" && /^https?:\/\//i.test(x)).slice(0, 30) : []
    })) : [];
    const errors = Array.isArray(data.errors) ? data.errors.slice(0, 5) : [];
    return NextResponse.json({ results, errors, provider: "TinyFish Fetch" }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Page extraction timed out or could not reach TinyFish." }, { status: 504 });
  }
}
