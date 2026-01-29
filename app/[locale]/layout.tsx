import type { Metadata } from "next";
import localFont from "next/font/local";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales } from "@/i18n/request";
import "../globals.css";
import { ErrorBoundary } from "@/components/shared";
import { ClientProviders } from "@/components/providers/ClientProviders";

const geistSans = localFont({
  src: "../fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "../fonts/GeistMonoVF.woff",
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

// Generate static params for all locales
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = params;

  // Validate locale
  if (!locales.includes(locale as "en" | "ar")) {
    notFound();
  }

  // Get messages for the locale
  const messages = await getMessages();

  // Determine text direction based on locale
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir}>
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
        <NextIntlClientProvider messages={messages} locale={locale}>
          <ErrorBoundary>
            <ClientProviders locale={locale}>{children}</ClientProviders>
          </ErrorBoundary>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
