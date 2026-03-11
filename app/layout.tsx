import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VeniCX",
  description: "Advanced Data Ingestion & Super Record Platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
