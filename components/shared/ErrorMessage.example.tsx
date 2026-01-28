/**
 * ErrorMessage Component Examples
 *
 * This file demonstrates various use cases for the ErrorMessage component.
 */

import { useState } from "react";
import { ErrorMessage, InlineFieldError } from "./ErrorMessage";

export function ErrorMessageExamples() {
  const [showDismissible, setShowDismissible] = useState(true);

  return (
    <div className="space-y-8 p-8">
      <section>
        <h2 className="text-xl font-semibold mb-4">Error Types</h2>
        <div className="space-y-4">
          <ErrorMessage
            message="Please enter a valid email address"
            type="validation"
          />
          <ErrorMessage
            message="Unable to connect to the server. Please check your internet connection."
            type="network"
          />
          <ErrorMessage
            message="Something went wrong on our end. Please try again later."
            type="server"
          />
          <ErrorMessage
            message="This flight is no longer available. Please select another flight."
            type="business"
          />
          <ErrorMessage
            message="Payment declined. Please check your card details and try again."
            type="payment"
          />
          <ErrorMessage
            message="Your session has expired. Please start a new search."
            type="session"
          />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Severity Levels</h2>
        <div className="space-y-4">
          <ErrorMessage message="This is an error message" severity="error" />
          <ErrorMessage
            message="This is a warning message"
            severity="warning"
          />
          <ErrorMessage
            message="This is an informational message"
            severity="info"
          />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Retryable Errors</h2>
        <ErrorMessage
          message="Failed to load flight data. Please try again."
          type="network"
          retryable
          onRetry={() => alert("Retrying...")}
        />
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Dismissible Errors</h2>
        {showDismissible && (
          <ErrorMessage
            message="This error can be dismissed"
            dismissible
            onDismiss={() => setShowDismissible(false)}
          />
        )}
        {!showDismissible && (
          <button
            onClick={() => setShowDismissible(true)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Show dismissible error again
          </button>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Display Variants</h2>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">Inline variant</p>
            <ErrorMessage
              message="This field is required"
              variant="inline"
              severity="error"
            />
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">
              Block variant (default)
            </p>
            <ErrorMessage
              message="Unable to process your request"
              variant="block"
            />
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Banner variant</p>
            <ErrorMessage
              message="Your booking session will expire in 5 minutes"
              variant="banner"
              severity="warning"
            />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Inline Field Errors</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="w-full px-3 py-2 border border-red-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
              aria-invalid="true"
              aria-describedby="email-error"
            />
            <InlineFieldError
              message="Please enter a valid email address"
              fieldId="email"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              className="w-full px-3 py-2 border border-red-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
              aria-invalid="true"
              aria-describedby="password-error"
            />
            <InlineFieldError
              message="Password must be at least 8 characters"
              fieldId="password"
            />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Field-Specific Errors</h2>
        <ErrorMessage message="is required" field="Email" variant="inline" />
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Use Cases</h2>
        <div className="space-y-4">
          <div className="border border-gray-200 rounded p-4">
            <h3 className="font-medium mb-2">Form Validation Error</h3>
            <ErrorMessage
              message="Please correct the errors below before submitting"
              type="validation"
              severity="error"
            />
          </div>

          <div className="border border-gray-200 rounded p-4">
            <h3 className="font-medium mb-2">Network Error with Retry</h3>
            <ErrorMessage
              message="Failed to load flight results. Please check your connection and try again."
              type="network"
              retryable
              onRetry={() => console.log("Retrying...")}
            />
          </div>

          <div className="border border-gray-200 rounded p-4">
            <h3 className="font-medium mb-2">Payment Error</h3>
            <ErrorMessage
              message="Your payment could not be processed. Please verify your card details or try a different payment method."
              type="payment"
              severity="error"
              retryable
              onRetry={() => console.log("Retrying payment...")}
            />
          </div>

          <div className="border border-gray-200 rounded p-4">
            <h3 className="font-medium mb-2">Session Timeout Warning</h3>
            <ErrorMessage
              message="Your session will expire in 2 minutes due to inactivity"
              type="session"
              severity="warning"
              variant="banner"
            />
          </div>

          <div className="border border-gray-200 rounded p-4">
            <h3 className="font-medium mb-2">Business Logic Error</h3>
            <ErrorMessage
              message="The selected seats are no longer available. Please choose different seats."
              type="business"
              severity="error"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
