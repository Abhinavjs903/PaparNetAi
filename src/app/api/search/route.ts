import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
const MAX_QUERY = 240;

export async function GET(request: NextRequest) {
  const query = (request.nextUrl.searchParams.get("q") ?? "").trim().slice(0, MAX_QUERY);
  if (query.length < 2) return NextResponse.json({ error: "Enter at least two characters to search." }, { status: 400 });
  const key = process.env.TINYFISH_API_KEY;
  if (!key) return NextResponse.json({ error: "Web search is not configured. Add TINYFISH_API_KEY to .env.local; see README.md." }, { status: 503 });
  try {
    const url = new URL("https://api.search.tinyfish.ai/");
    url.searchParams.set("query", query);
    url.searchParams.set("language", "en");
    const response = await fetch(url, { headers: { "X-API-Key": key }, signal: AbortSignal.timeout(15000), cache: "no-store" });
    if (!response.ok) return NextResponse.json({ error: response.status === 429 ? "TinyFish search rate limit reached. Wait a moment and retry." : `TinyFish search returned HTTP ${response.status}.` }, { status: response.status === 429 ? 429 : 502 });
    const data = await response.json();
    const results = Array.isArray(data.results) ? data.results.slice(0, 10).map((item: Record<string, unknown>) => ({
      title: String(item.title ?? "Untitled result").slice(0, 300),
      url: typeof item.url === "string" ? item.url : "",
      snippet: String(item.snippet ?? "").slice(0, 1200),
      siteName: String(item.site_name ?? "")
    })).filter((item: { url: string }) => /^https?:\/\//i.test(item.url)) : [];
    return NextResponse.json({ query, results, provider: "TinyFish Search" }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Search timed out or could not reach TinyFish." }, { status: 504 });
  }
}
