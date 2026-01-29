"use client";

import { useTranslations } from "next-intl";
import { useRequireAuth } from "@/lib/hooks/useRequireAuth";
import { LoadingSpinner } from "@/components/shared";

export default function ProfilePage() {
  const t = useTranslations();
  const { user, loading } = useRequireAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">{t("profile.title")}</h1>

        <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("auth.email")}
            </label>
            <p className="text-gray-900">{user.email}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("auth.firstName")}
              </label>
              <p className="text-gray-900">{user.firstName || "-"}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("auth.lastName")}
              </label>
              <p className="text-gray-900">{user.lastName || "-"}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("auth.phone")}
            </label>
            <p className="text-gray-900">{user.phone || "-"}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("profile.role")}
            </label>
            <p className="text-gray-900 capitalize">
              {user.role.toLowerCase()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
