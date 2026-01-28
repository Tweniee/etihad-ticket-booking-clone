/**
 * LoadingSpinner Component Examples
 *
 * This file demonstrates various use cases for the LoadingSpinner component.
 */

import { LoadingSpinner, FullPageLoadingSpinner } from "./LoadingSpinner";

export function LoadingSpinnerExamples() {
  return (
    <div className="space-y-8 p-8">
      <section>
        <h2 className="text-xl font-semibold mb-4">Basic Loading Spinner</h2>
        <LoadingSpinner />
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">With Loading Text</h2>
        <LoadingSpinner text="Loading flights..." />
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Size Variants</h2>
        <div className="flex items-center gap-8">
          <div>
            <p className="text-sm text-gray-600 mb-2">Small</p>
            <LoadingSpinner size="small" />
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Medium (default)</p>
            <LoadingSpinner size="medium" />
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Large</p>
            <LoadingSpinner size="large" />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Color Variants</h2>
        <div className="flex items-center gap-8">
          <div>
            <p className="text-sm text-gray-600 mb-2">Primary (default)</p>
            <LoadingSpinner color="primary" />
          </div>
          <div className="bg-blue-600 p-4 rounded">
            <p className="text-sm text-white mb-2">White</p>
            <LoadingSpinner color="white" />
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Gray</p>
            <LoadingSpinner color="gray" />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Centered Spinner</h2>
        <div className="border border-gray-300 rounded h-32">
          <LoadingSpinner centered text="Loading..." />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Inline Spinner</h2>
        <p className="flex items-center gap-2">
          Processing your request <LoadingSpinner size="small" />
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Full Page Loading</h2>
        <button
          onClick={() => {
            // Simulate full page loading
            const container = document.createElement("div");
            document.body.appendChild(container);
            const root = (window as any).ReactDOM.createRoot(container);
            root.render(
              <FullPageLoadingSpinner text="Processing payment..." />,
            );
            setTimeout(() => {
              root.unmount();
              document.body.removeChild(container);
            }, 2000);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Show Full Page Loading
        </button>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Use Cases</h2>
        <div className="space-y-4">
          <div className="border border-gray-200 rounded p-4">
            <h3 className="font-medium mb-2">Search Results Loading</h3>
            <LoadingSpinner text="Searching for flights..." size="medium" />
          </div>

          <div className="border border-gray-200 rounded p-4">
            <h3 className="font-medium mb-2">Button Loading State</h3>
            <button
              disabled
              className="px-4 py-2 bg-blue-600 text-white rounded opacity-75 cursor-not-allowed flex items-center gap-2"
            >
              <LoadingSpinner size="small" color="white" />
              Processing...
            </button>
          </div>

          <div className="border border-gray-200 rounded p-4">
            <h3 className="font-medium mb-2">Card Loading State</h3>
            <div className="bg-gray-50 rounded p-8">
              <LoadingSpinner centered text="Loading booking details..." />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
