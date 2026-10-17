import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "PaperNet — From Sketch to Simulation",
  description: "Bridge physical circuit sketches and digital engineering with image preparation, human-assisted reconstruction, circuit analysis, and web research."
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
