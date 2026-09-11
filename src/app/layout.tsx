import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "THREAD — One Story. Every Action Connected.",
  description:
    "A Gemini-powered universal bridge between human intent and complex systems. Transforms messy human stories into structured Situation Graphs and Action Packs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#090d16] text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
