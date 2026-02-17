import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bookmark — Save What Matters",
  description: "Your personal bookmark collection, beautifully organized.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-cream">{children}</body>
    </html>
  );
}
