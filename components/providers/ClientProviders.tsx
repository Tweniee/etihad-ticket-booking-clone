"use client";

import { ReactNode } from "react";
import { AuthProvider } from "@/lib/contexts/auth-context";
import { Header } from "@/components/shared/Header";

interface ClientProvidersProps {
  children: ReactNode;
  locale: string;
}

export function ClientProviders({ children, locale }: ClientProvidersProps) {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <Header locale={locale} />
        <main className="flex-1">{children}</main>
      </div>
    </AuthProvider>
  );
}
