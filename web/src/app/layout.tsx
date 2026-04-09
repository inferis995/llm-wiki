import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wiki Viewer",
  description: "Knowledge base viewer with graph visualization",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it" className="dark">
      <body className="font-sans min-h-screen">{children}</body>
    </html>
  );
}
