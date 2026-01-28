"use client";

import { useState } from "react";
import { PriceDisplay } from "./PriceDisplay";
import type { PriceBreakdown, DetailedPriceBreakdown } from "@/lib/types";

/**
 * Example usage of the PriceDisplay component
 * This file demonstrates various use cases and configurations
 */

export default function PriceDisplayExample() {
  const [highlightSimple, setHighlightSimple] = useState(false);
  const [highlightDetailed, setHighlightDetailed] = useState(false);

  // Simple price breakdown
  const simpleBreakdown: PriceBreakdown = {
    baseFare: 450.0,
    taxes: 75.5,
    fees: 24.5,
  };

  // Detailed price breakdown with extras
  const detailedBreakdown: DetailedPriceBreakdown = {
    baseFare: 450.0,
    taxes: 75.5,
    fees: 24.5,
    seatFees: 50.0,
    extraBaggage: 30.0,
    meals: 15.0,
    insurance: 25.0,
    loungeAccess: 40.0,
    total: 710.0,
  };

  const handleUpdateSimple = () => {
    setHighlightSimple(true);
    setTimeout(() => setHighlightSimple(false), 100);
  };

  const handleUpdateDetailed = () => {
    setHighlightDetailed(true);
    setTimeout(() => setHighlightDetailed(false), 100);
  };

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-12">
      <div>
        <h1 className="text-3xl font-bold mb-2">PriceDisplay Component</h1>
        <p className="text-gray-600">
          Examples of the PriceDisplay component with various configurations
        </p>
      </div>

      {/* Basic Usage */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Basic Usage</h2>
        <div className="border border-gray-200 rounded-lg p-6 space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Simple Price (No Breakdown)
            </h3>
            <PriceDisplay amount={550.0} currency="USD" showBreakdown={false} />
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Price with Simple Breakdown
            </h3>
            <PriceDisplay
              amount={550.0}
              currency="USD"
              breakdown={simpleBreakdown}
            />
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Price with Label
            </h3>
            <PriceDisplay
              amount={550.0}
              currency="USD"
              breakdown={simpleBreakdown}
              label="Total Price"
            />
          </div>
        </div>
      </section>

      {/* Size Variants */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Size Variants</h2>
        <div className="border border-gray-200 rounded-lg p-6 space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Small</h3>
            <PriceDisplay
              amount={550.0}
              currency="USD"
              breakdown={simpleBreakdown}
              size="small"
            />
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Medium (Default)
            </h3>
            <PriceDisplay
              amount={550.0}
              currency="USD"
              breakdown={simpleBreakdown}
              size="medium"
            />
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Large</h3>
            <PriceDisplay
              amount={550.0}
              currency="USD"
              breakdown={simpleBreakdown}
              size="large"
            />
          </div>
        </div>
      </section>

      {/* Per-Passenger Pricing */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Per-Passenger Pricing</h2>
        <div className="border border-gray-200 rounded-lg p-6 space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Single Passenger
            </h3>
            <PriceDisplay
              amount={550.0}
              currency="USD"
              breakdown={simpleBreakdown}
              passengerCount={1}
            />
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Two Passengers
            </h3>
            <PriceDisplay
              amount={1100.0}
              currency="USD"
              breakdown={{
                baseFare: 900.0,
                taxes: 151.0,
                fees: 49.0,
              }}
              passengerCount={2}
            />
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Family of Four
            </h3>
            <PriceDisplay
              amount={2200.0}
              currency="USD"
              breakdown={{
                baseFare: 1800.0,
                taxes: 302.0,
                fees: 98.0,
              }}
              passengerCount={4}
              size="large"
              label="Total for Family"
            />
          </div>
        </div>
      </section>

      {/* Detailed Breakdown */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Detailed Breakdown</h2>
        <div className="border border-gray-200 rounded-lg p-6">
          <p className="text-sm text-gray-600 mb-4">
            Click the info icon to see the complete breakdown including extras
          </p>
          <PriceDisplay
            amount={710.0}
            currency="USD"
            breakdown={detailedBreakdown}
            passengerCount={1}
            size="large"
            label="Total Booking Cost"
          />
        </div>
      </section>

      {/* Different Currencies */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Different Currencies</h2>
        <div className="border border-gray-200 rounded-lg p-6 space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              US Dollar (USD)
            </h3>
            <PriceDisplay
              amount={550.0}
              currency="USD"
              breakdown={simpleBreakdown}
            />
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Euro (EUR)
            </h3>
            <PriceDisplay
              amount={495.0}
              currency="EUR"
              breakdown={{
                baseFare: 405.0,
                taxes: 68.0,
                fees: 22.0,
              }}
            />
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              UAE Dirham (AED)
            </h3>
            <PriceDisplay
              amount={2020.0}
              currency="AED"
              breakdown={{
                baseFare: 1653.0,
                taxes: 277.0,
                fees: 90.0,
              }}
            />
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              British Pound (GBP)
            </h3>
            <PriceDisplay
              amount={425.0}
              currency="GBP"
              breakdown={{
                baseFare: 348.0,
                taxes: 58.0,
                fees: 19.0,
              }}
            />
          </div>
        </div>
      </section>

      {/* Highlight Animation */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Highlight Animation</h2>
        <div className="border border-gray-200 rounded-lg p-6 space-y-4">
          <p className="text-sm text-gray-600">
            Click the buttons to see the highlight animation when prices change
          </p>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Simple Price
              </h3>
              <div className="flex items-center gap-4">
                <PriceDisplay
                  amount={550.0}
                  currency="USD"
                  breakdown={simpleBreakdown}
                  highlight={highlightSimple}
                />
                <button
                  onClick={handleUpdateSimple}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Update Price
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Detailed Price
              </h3>
              <div className="flex items-center gap-4">
                <PriceDisplay
                  amount={710.0}
                  currency="USD"
                  breakdown={detailedBreakdown}
                  highlight={highlightDetailed}
                  size="large"
                />
                <button
                  onClick={handleUpdateDetailed}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Update Price
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Real-world Example */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Real-world Example</h2>
        <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-4">Booking Summary</h3>

            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">New York (JFK) → London (LHR)</p>
                  <p className="text-sm text-gray-600">
                    Round-trip • 2 Adults • Economy
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <PriceDisplay
                  amount={2200.0}
                  currency="USD"
                  breakdown={{
                    baseFare: 1800.0,
                    taxes: 302.0,
                    fees: 98.0,
                    seatFees: 0,
                    extraBaggage: 0,
                    meals: 0,
                    insurance: 0,
                    loungeAccess: 0,
                    total: 2200.0,
                  }}
                  passengerCount={2}
                  size="large"
                  label="Total Price"
                />
              </div>

              <button className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                Continue to Payment
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
