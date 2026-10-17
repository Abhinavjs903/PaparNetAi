"use client";

import { useState, type FormEvent } from "react";

type SearchResult = { title: string; url: string; snippet: string; siteName?: string };
type FetchedPage = { title: string; url: string; finalUrl: string; text: string; imageLinks: string[]; links: string[] };

export default function ResearchPanel() {
  const [query, setQuery] = useState("resistor circuit symbol datasheet");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [pages, setPages] = useState<FetchedPage[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("Search for component references, symbol images, or datasheets.");
  const [activeUrl, setActiveUrl] = useState("");

  async function search(event: FormEvent) {
    event.preventDefault();
    if (query.trim().length < 2) return;
    setBusy(true); setError(""); setPages([]); setNotice("Searching the web…");
    try {
      const response = await fetch("/api/search?q=" + encodeURIComponent(query.trim()));
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Search failed.");
      setResults(data.results ?? []);
      setNotice((data.results?.length ?? 0) ? `Found ${data.results.length} results using ${data.provider}.` : "No results returned. Try a more specific component name.");
    } catch (e) { setError(e instanceof Error ? e.message : "Search failed."); }
    finally { setBusy(false); }
  }

  async function fetchPage(url: string) {
    setBusy(true); setError(""); setActiveUrl(url); setNotice("Extracting clean page content…");
    try {
      const response = await fetch("/api/fetch", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ urls: [url] }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Page extraction failed.");
      const page = data.results?.[0] as FetchedPage | undefined;
      if (!page) throw new Error(data.errors?.[0]?.error ?? "No page content was returned.");
      setPages((current) => [page, ...current.filter((item) => item.url !== page.url)].slice(0, 3));
      setNotice("Page extracted. Review the text and image links below.");
    } catch (e) { setError(e instanceof Error ? e.message : "Page extraction failed."); }
    finally { setBusy(false); setActiveUrl(""); }
  }

  return <section className="research-panel" id="research">
    <div className="research-panel-heading"><div><p className="eyebrow">TINYFISH / SEARCH + FETCH</p><h2>Research the identified component.</h2><p>Find reference images and datasheets, then fetch a page into clean text. This is a research helper—not automatic circuit recognition.</p></div><span className="research-provider">SERVER-SIDE KEY</span></div>
    <form className="research-form" onSubmit={search}><label htmlFor="component-search">Component or image search</label><div className="research-input-row"><input id="component-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="e.g. 1N4148 diode symbol datasheet" /><button className="button primary" disabled={busy}> {busy ? "Working…" : "Search web ↗"}</button></div></form>
    <p className="research-notice" role="status">{notice}</p>{error && <p className="research-error" role="alert">{error}</p>}
    {results.length > 0 && <div className="research-results">{results.map((result, i) => <article className="research-result-card" key={result.url || i}><span className="result-number">{String(i + 1).padStart(2, "0")}</span><div className="result-body"><a href={result.url} target="_blank" rel="noreferrer">{result.title}</a><small>{result.siteName || result.url}</small><p>{result.snippet || "No summary provided."}</p></div><button className="button" disabled={busy} onClick={() => fetchPage(result.url)}>{activeUrl === result.url ? "Fetching…" : "Fetch page"}</button></article>)}</div>}
    {pages.map((page) => <article className="fetched-page" key={page.url}><div className="fetched-heading"><div><small>EXTRACTED SOURCE</small><h3>{page.title}</h3><a href={page.finalUrl} target="_blank" rel="noreferrer">{page.finalUrl}</a></div><button className="button" onClick={() => navigator.clipboard?.writeText(page.text).then(() => setNotice("Extracted text copied."))}>Copy text</button></div><p className="fetched-text">{page.text || "No readable text was returned."}</p>{page.imageLinks.length > 0 && <><h4>Images found on this page ({page.imageLinks.length})</h4><div className="found-image-links">{page.imageLinks.slice(0, 8).map((url) => <a key={url} href={url} target="_blank" rel="noreferrer">{url}</a>)}</div></>}</article>)}
    <p className="research-footnote">Use sources responsibly. Search results and extracted content may be incomplete; verify datasheets and licensing before reusing images.</p>
  </section>;
}
