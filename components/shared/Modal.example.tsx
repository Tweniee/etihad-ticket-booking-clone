/**
 * Modal Component Examples
 *
 * This file demonstrates various use cases for the Modal component.
 */

"use client";

import { useState } from "react";
import { Modal } from "./Modal";

export function ModalExamples() {
  const [basicOpen, setBasicOpen] = useState(false);
  const [withTitleOpen, setWithTitleOpen] = useState(false);
  const [withFooterOpen, setWithFooterOpen] = useState(false);
  const [smallOpen, setSmallOpen] = useState(false);
  const [largeOpen, setLargeOpen] = useState(false);
  const [noCloseOpen, setNoCloseOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  return (
    <div className="space-y-8 p-8">
      <section>
        <h2 className="text-xl font-semibold mb-4">Basic Modal</h2>
        <button
          onClick={() => setBasicOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Open Basic Modal
        </button>
        <Modal isOpen={basicOpen} onClose={() => setBasicOpen(false)}>
          <p>This is a basic modal with just content.</p>
        </Modal>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Modal with Title</h2>
        <button
          onClick={() => setWithTitleOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Open Modal with Title
        </button>
        <Modal
          isOpen={withTitleOpen}
          onClose={() => setWithTitleOpen(false)}
          title="Modal Title"
        >
          <p>This modal has a title in the header.</p>
        </Modal>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Modal with Footer</h2>
        <button
          onClick={() => setWithFooterOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Open Modal with Footer
        </button>
        <Modal
          isOpen={withFooterOpen}
          onClose={() => setWithFooterOpen(false)}
          title="Modal with Actions"
          footer={
            <>
              <button
                onClick={() => setWithFooterOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => setWithFooterOpen(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Confirm
              </button>
            </>
          }
        >
          <p>This modal has action buttons in the footer.</p>
        </Modal>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Size Variants</h2>
        <div className="flex gap-4">
          <button
            onClick={() => setSmallOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Small Modal
          </button>
          <button
            onClick={() => setLargeOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Large Modal
          </button>
        </div>
        <Modal
          isOpen={smallOpen}
          onClose={() => setSmallOpen(false)}
          title="Small Modal"
          size="small"
        >
          <p>This is a small modal.</p>
        </Modal>
        <Modal
          isOpen={largeOpen}
          onClose={() => setLargeOpen(false)}
          title="Large Modal"
          size="large"
        >
          <p>
            This is a large modal with more space for content. It can contain
            longer text, forms, or other complex content that needs more room.
          </p>
          <p className="mt-4">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        </Modal>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Non-Closeable Modal</h2>
        <button
          onClick={() => setNoCloseOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Open Non-Closeable Modal
        </button>
        <Modal
          isOpen={noCloseOpen}
          onClose={() => setNoCloseOpen(false)}
          title="Processing Payment"
          closeable={false}
          showCloseButton={false}
        >
          <div className="text-center py-4">
            <p className="mb-4">Please wait while we process your payment...</p>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
            <button
              onClick={() => setNoCloseOpen(false)}
              className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Done (for demo)
            </button>
          </div>
        </Modal>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Use Cases</h2>
        <div className="space-y-4">
          <div className="border border-gray-200 rounded p-4">
            <h3 className="font-medium mb-2">Confirmation Dialog</h3>
            <button
              onClick={() => setConfirmOpen(true)}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Cancel Booking
            </button>
            <Modal
              isOpen={confirmOpen}
              onClose={() => setConfirmOpen(false)}
              title="Cancel Booking"
              size="small"
              footer={
                <>
                  <button
                    onClick={() => setConfirmOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Keep Booking
                  </button>
                  <button
                    onClick={() => {
                      alert("Booking cancelled");
                      setConfirmOpen(false);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Cancel Booking
                  </button>
                </>
              }
            >
              <p>
                Are you sure you want to cancel this booking? This action cannot
                be undone.
              </p>
              <p className="mt-2 text-sm text-gray-600">
                Cancellation fee: $50.00
              </p>
            </Modal>
          </div>

          <div className="border border-gray-200 rounded p-4">
            <h3 className="font-medium mb-2">Form Modal</h3>
            <button
              onClick={() => setFormOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add Passenger
            </button>
            <Modal
              isOpen={formOpen}
              onClose={() => setFormOpen(false)}
              title="Add Passenger Information"
              footer={
                <>
                  <button
                    onClick={() => setFormOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      alert("Passenger added");
                      setFormOpen(false);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Add Passenger
                  </button>
                </>
              }
            >
              <form className="space-y-4">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium mb-1"
                  >
                    First Name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium mb-1"
                  >
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium mb-1"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </form>
            </Modal>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Accessibility Features</h2>
        <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
          <li>Focus trap - Tab key cycles through modal elements only</li>
          <li>Escape key closes the modal (when closeable)</li>
          <li>Backdrop click closes the modal (when enabled)</li>
          <li>Proper ARIA attributes for screen readers</li>
          <li>Focus returns to trigger element when closed</li>
          <li>Body scroll is prevented when modal is open</li>
        </ul>
      </section>
    </div>
  );
}
