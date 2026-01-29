"use client";

/**
 * Language Switcher Component
 *
 * Allows users to switch between supported languages
 *
 * Requirements: 20.3
 */

import { useParams, usePathname, useRouter } from "next/navigation";
import { locales } from "@/i18n/request";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = params.locale as string;

  const handleLanguageChange = (newLocale: string) => {
    // Replace the locale in the current pathname
    const segments = pathname.split("/");
    segments[1] = newLocale;
    const newPathname = segments.join("/");

    router.push(newPathname);
  };

  const getLanguageName = (locale: string) => {
    switch (locale) {
      case "en":
        return "English";
      case "ar":
        return "العربية";
      default:
        return locale;
    }
  };

  return (
    <div className="relative inline-block text-left">
      <div className="flex items-center space-x-2 rtl:space-x-reverse">
        <Globe className="w-5 h-5 text-gray-600" />
        <select
          value={currentLocale}
          onChange={(e) => handleLanguageChange(e.target.value)}
          className="appearance-none bg-transparent border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
          aria-label="Select language"
        >
          {locales.map((locale) => (
            <option key={locale} value={locale}>
              {getLanguageName(locale)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
