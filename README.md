# PaperNet AI

**PaperNet is a physical-to-digital engineering workspace** for turning hand-drawn electrical circuit sketches into inspectable digital models. It combines browser-based image preparation with a human-assisted reconstruction path, deterministic circuit analysis as a planned phase, and a TinyFish-powered research layer for component references and datasheets.

## Current implementation

### Product frontend
- Premium dark industrial landing page with a technical grid, orange accent, product workflow, capability status, examples, and CTA.
- Responsive layout for desktop and mobile.
- Workspace route at `/workspace`.

### Capture workspace — Phase 1
- Upload JPG, PNG, or WEBP images (up to 15 MB) or capture from the device camera.
- Select four paper corners clockwise: top-left, top-right, bottom-right, bottom-left.
- OpenCV.js perspective transform to a canonical **800 × 600 px** image.
- Preview and download the corrected PNG.
- Image correction runs in the browser; source images are not uploaded to PaperNet's backend.

### TinyFish research backend
- `GET /api/search?q=...`: uses TinyFish Search to find component references, symbol examples, datasheets and related pages.
- `POST /api/fetch`: extracts clean markdown and image/link references from 1–5 public URLs.
- The workspace includes a research panel to search, fetch a selected result, read extracted content and open image links.
- TinyFish API credentials are only read server-side from `TINYFISH_API_KEY`; never put the key in client code or the browser extension.
- The server validates URLs and blocks common localhost/private IPv4 targets before forwarding fetch requests. Use the API locally during this MVP and add production rate limiting/auth before public deployment.

### Browser extension
The Manifest V3 extension in `extension/` can search for an identified component or extract the active browser tab through the local PaperNet backend. It does not store browsing history or API credentials.

## Setup

Requirements: Node.js 20.9+ and npm.

1. Clone the repository and switch to the implementation branch:
   ```bash
   git checkout phase-1-nextjs-camera
   ```
2. Install the frontend dependencies:
   ```bash
   npm install
   ```
3. Configure TinyFish (needed only for web search/fetch):
   - Get a key from [TinyFish API keys](https://agent.tinyfish.ai/api-keys).
   - Copy `.env.example` to `.env.local`.
   - Set `TINYFISH_API_KEY=your_key_here`.
4. Run:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000).

No TinyFish npm package is required: PaperNet calls the Search and Fetch REST endpoints directly. TinyFish currently advertises Search and Fetch as free; check their current limits and terms. Without the key, the landing page and capture workspace still work, while research routes return a setup message.

## Install the extension (Chrome / Edge)

1. Start PaperNet locally at `http://localhost:3000`.
2. Open `chrome://extensions` (or `edge://extensions`).
3. Enable **Developer mode**.
4. Choose **Load unpacked** and select this repository's `extension` folder.
5. Open a regular HTTP/HTTPS webpage, click the extension icon, and choose **Extract active page**. Or enter a component query and choose **Search**.

See [extension/README.md](extension/README.md) for the detailed steps and limitations. If you deploy PaperNet, add the deployed origin to the extension's `host_permissions` and update its API base URL before reloading the extension.

## Project structure

```
src/
  app/
    api/
      search/route.ts     # TinyFish Search proxy
      fetch/route.ts      # TinyFish Fetch proxy
    workspace/page.tsx    # Camera/upload + perspective correction
    page.tsx              # Landing page
    layout.tsx
    globals.css
  components/
    ResearchPanel.tsx     # Component search, fetch and image references
  vision/                 # Reserved for thresholding and stroke extraction
  circuit/                # Reserved for graph model and MNA solver
  tests/                  # Planned test coverage
extension/                # Chrome/Edge Manifest V3 research popup
samples/circuits/         # Sample sketches
index.html                # Original standalone prototype retained as reference
```

## Planned next phases

- **Phase 2 — Image cleanup:** grayscale, adaptive thresholding, noise removal, stroke thinning and repeatable sample-image tests.
- **Phase 3 — Circuit reconstruction:** symbol/label suggestions, wire/junction review, confidence scores, and editable circuit graph.
- **Phase 4 — Deterministic simulation:** graph validation and Modified Nodal Analysis (MNA) for a clearly defined supported subset of circuits.
- **Later:** stronger recognition, more component families, collaboration, and external circuit-format export.

The TinyFish research layer helps retrieve references after a component has been identified; it does **not** recognize symbols in the sketch by itself and does not replace the circuit solver.

## Validation status

A local production build and real-browser QA must still be run before treating this branch as release-ready. Camera use requires localhost/HTTPS and browser permission. OpenCV.js loads from the official OpenCV CDN, so initial capture processing requires internet access.
