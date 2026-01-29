import { FileQuestion, Home, Search } from "lucide-react";
import Link from "next/link";

/**
 * Global Not Found Page
 *
 * Displayed when a route is not found
 */

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-gray-100 p-3">
            <FileQuestion
              className="w-8 h-8 text-gray-600"
              aria-hidden="true"
            />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Page Not Found
        </h1>

        {/* Message */}
        <p className="text-gray-600 mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            data-testid="not-found-home"
          >
            <Home className="w-4 h-4" aria-hidden="true" />
            Go Home
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            data-testid="not-found-search"
          >
            <Search className="w-4 h-4" aria-hidden="true" />
            Search Flights
          </Link>
        </div>
      </div>
    </div>
  );
}
