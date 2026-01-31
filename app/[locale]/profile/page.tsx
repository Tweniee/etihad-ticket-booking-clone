"use client";

import { useTranslations } from "next-intl";
import { useRequireAuth } from "@/lib/hooks/useRequireAuth";
import { LoadingSpinner } from "@/components/shared";
import { format } from "date-fns";

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
              Full Name
            </label>
            <p className="text-gray-900">{user.name}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <p className="text-gray-900">{user.category}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Citizenship
              </label>
              <p className="text-gray-900">{user.citizenship}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              UAE Resident
            </label>
            <p className="text-gray-900">{user.uaeResident ? "Yes" : "No"}</p>
          </div>

          {user.details && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Details
              </label>
              <p className="text-gray-900">{user.details}</p>
            </div>
          )}
        </div>

        {/* Travel History Section */}
        {user.travelHistory && user.travelHistory.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Travel History</h2>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Destination
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Purpose
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {user.travelHistory.map((trip) => (
                    <tr key={trip.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {trip.destination}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(trip.travelDate), "MMM dd, yyyy")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {trip.purpose || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
