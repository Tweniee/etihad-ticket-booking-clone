import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales } from "@/i18n/request";
import { ErrorBoundary } from "@/components/shared";
import { ClientProviders } from "@/components/providers/ClientProviders";

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

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <ErrorBoundary>
        <ClientProviders locale={locale}>{children}</ClientProviders>
      </ErrorBoundary>
    </NextIntlClientProvider>
  );
}
