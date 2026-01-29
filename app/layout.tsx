import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ErrorBoundary } from "@/components/shared";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Etihad Airways - Book Your Flight",
  description:
    "Book flights with Etihad Airways. Search, compare, and book flights to destinations worldwide with our easy-to-use booking system.",
  keywords: [
    "flights",
    "airline",
    "booking",
    "travel",
    "Etihad Airways",
    "flight tickets",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gray-50`}
      >
        <ErrorBoundary>
          <div className="min-h-screen flex flex-col">
            <main className="flex-1">{children}</main>
          </div>
        </ErrorBoundary>
      </body>
    </html>
  );
}
