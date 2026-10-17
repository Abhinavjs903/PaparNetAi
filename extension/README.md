# PaperNet Web Research extension (Manifest V3)

A small Chrome/Edge extension that:
- Searches for an identified component or a datasheet through PaperNet's TinyFish Search endpoint.
- Sends the active tab URL to PaperNet's TinyFish Fetch endpoint and displays extracted text.
- Does not store browsing history or an API key. TinyFish credentials remain on the PaperNet server in `.env.local`.

## Prerequisites
1. Install Node.js 20.9+ and npm.
2. Obtain a TinyFish API key at https://agent.tinyfish.ai/api-keys.
3. In the project root, copy `.env.example` to `.env.local` and set `TINYFISH_API_KEY`.
4. Run `npm install` and `npm run dev`, then confirm http://localhost:3000 is open.

No TinyFish npm package is required: the server routes call TinyFish's REST APIs directly. Search and Fetch are advertised by TinyFish as free; check current rate limits and account terms before relying on them.

## Load in Chrome or Edge
1. Open `chrome://extensions` (or `edge://extensions`).
2. Enable **Developer mode**.
3. Click **Load unpacked** and select this repository's `extension` folder.
4. Pin **PaperNet Web Research**.
5. Browse to a normal HTTP/HTTPS page, click the extension, then choose **Extract active page**. Or enter a component query and choose **Search**.

The extension's host permissions are intentionally limited to `localhost:3000` and `127.0.0.1:3000`. If you later deploy PaperNet, update `extension/manifest.json` with the deployed app origin and reload the extension.

## Notes
- The active-tab permission is used only when the user clicks **Extract active page**.
- Extraction runs through the backend; do not put API keys in extension files.
- Public websites may block extraction, and results may be partial. Respect site terms, copyright, robots policies, and rate limits.
