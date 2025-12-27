import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Remove Gemini Watermark Free - AI Watermark Remover | GeminiWatermark.ai",
  description: "Remove Google Gemini AI visible watermarks instantly. Free online tool to remove logo watermarks from Gemini-generated images. No signup, 100% private.",
  keywords: ["remove gemini watermark", "gemini watermark remover", "google gemini watermark", "ai watermark removal", "imagen 3 watermark"],
  openGraph: {
    title: "Remove Gemini Watermark Free - AI Watermark Remover",
    description: "Remove Google Gemini AI visible watermarks instantly. Free online tool to remove logo watermarks from Gemini-generated images.",
    url: "https://geminiwatermark.ai",
    siteName: "GeminiWatermark.ai",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Remove Gemini Watermark Free - AI Watermark Remover",
    description: "Remove Google Gemini AI visible watermarks instantly. Free online tool to remove logo watermarks from Gemini-generated images.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground`}>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
