import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Skill Grep - ATS Integration",
  description: "AI-powered candidate filtering for your ATS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
