# PaperNet AI

PaperNet is a local-first physical-to-digital bridge for hand-drawn electrical circuit sketches.

## Phase 1 — Capture + perspective correction

- Next.js App Router + TypeScript scaffold.
- Upload JPG, PNG, or WEBP images (up to 15 MB) or capture from the device camera.
- Select four paper corners clockwise: top-left, top-right, bottom-right, bottom-left.
- OpenCV.js perspective transform to a canonical **800 × 600 px** image.
- Preview and download the corrected PNG.
- Image processing runs in the browser; no backend upload endpoint is used.

Not implemented yet: grayscale/thresholding, skeletonization, circuit symbol detection, graph reconstruction, and MNA simulation.

## Run locally

Requirements: Node.js 20.9+ and npm.

```bash
npm install
npm run dev
```

Open http://localhost:3000. Camera access requires localhost or HTTPS and browser permission. OpenCV.js is loaded from the official OpenCV CDN, so initial use requires internet access.

```bash
npm run build
npm run start
```

## Structure

```
src/app/layout.tsx   # App Router root layout
src/app/page.tsx     # Capture UI and perspective correction
src/app/globals.css  # Workspace styles
```

The existing root `index.html` prototype is retained as a reference; Next.js runs from `src/app`.
