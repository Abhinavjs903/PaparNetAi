const statusEl = document.getElementById("status");
const resultsEl = document.getElementById("results");
const queryEl = document.getElementById("query");
const setStatus = (message) => { statusEl.textContent = message; };
const button = (id) => document.getElementById(id);

function renderResults(results) {
  resultsEl.replaceChildren();
  for (const result of results || []) {
    const article = document.createElement("article");
    article.className = "result";
    const link = document.createElement("a");
    link.href = result.url;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.textContent = result.title || result.url;
    const summary = document.createElement("p");
    summary.textContent = result.snippet || result.text || "";
    article.append(link, summary);
    resultsEl.append(article);
  }
}

button("search").addEventListener("click", async () => {
  const query = queryEl.value.trim();
  if (query.length < 2) return setStatus("Enter a component or search phrase.");
  setStatus("Searching through your local PaperNet app…");
  try {
    const response = await fetch("http://localhost:3000/api/search?q=" + encodeURIComponent(query));
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Search failed.");
    renderResults(data.results);
    setStatus("Found " + data.results.length + " results.");
  } catch (error) { setStatus(error.message + " Make sure PaperNet is running at localhost:3000."); }
});

button("extract").addEventListener("click", async () => {
  setStatus("Reading active tab…");
  try {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    if (!tab?.url || !/^https?:\/\//i.test(tab.url)) throw new Error("Open a normal HTTP or HTTPS webpage first.");
    const response = await fetch("http://localhost:3000/api/fetch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ urls: [tab.url] })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Extraction failed.");
    const page = data.results?.[0];
    if (!page) throw new Error(data.errors?.[0]?.error || "No readable content returned.");
    renderResults([{ title: page.title, url: page.finalUrl || page.url, snippet: (page.text || "").slice(0, 1800) }]);
    setStatus("Extracted content from " + (page.title || tab.url) + ".");
  } catch (error) { setStatus(error.message + " Check PaperNet is running and TINYFISH_API_KEY is set."); }
});
