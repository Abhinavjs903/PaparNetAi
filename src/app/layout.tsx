import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "PaperNet — Sketch to Circuit",
  description: "Capture a hand-drawn circuit, correct its perspective, and prepare it for deterministic circuit analysis."
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
