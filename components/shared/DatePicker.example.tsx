"use client";

import React, { useState } from "react";
import { DatePicker } from "./DatePicker";
import { addDays, subDays } from "date-fns";

/**
 * Example usage of the DatePicker component
 *
 * This file demonstrates various use cases for the DatePicker component
 * including basic usage, date range restrictions, and form integration.
 */
export const DatePickerExamples: React.FC = () => {
  const [basicDate, setBasicDate] = useState<Date | null>(null);
  const [departureDate, setDepartureDate] = useState<Date | null>(null);
  const [returnDate, setReturnDate] = useState<Date | null>(null);
  const [pastDisabledDate, setPastDisabledDate] = useState<Date | null>(null);
  const [rangeDate, setRangeDate] = useState<Date | null>(null);

  const today = new Date();
  const tomorrow = addDays(today, 1);
  const nextMonth = addDays(today, 30);

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-12">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          DatePicker Component Examples
        </h1>
        <p className="text-gray-600">
          Interactive examples demonstrating the DatePicker component features
        </p>
      </div>

      {/* Basic Usage */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Basic Usage</h2>
        <p className="text-gray-600">
          Simple date picker with manual input support
        </p>
        <div className="max-w-md">
          <DatePicker
            label="Select a date"
            value={basicDate}
            onChange={setBasicDate}
            placeholder="Choose a date"
            ariaLabel="Basic date picker"
          />
          {basicDate && (
            <p className="mt-2 text-sm text-gray-600">
              Selected: {basicDate.toLocaleDateString()}
            </p>
          )}
        </div>
      </section>

      {/* Past Dates Disabled (Requirement 18.2) */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">
          Past Dates Disabled
        </h2>
        <p className="text-gray-600">
          Demonstrates Requirement 18.2: Disable dates in the past for departure
          date selection
        </p>
        <div className="max-w-md">
          <DatePicker
            label="Departure Date"
            value={pastDisabledDate}
            onChange={setPastDisabledDate}
            minDate={today}
            placeholder="Select departure date"
            required
            ariaLabel="Departure date picker"
          />
          <p className="mt-2 text-sm text-gray-500">
            Only dates from today onwards can be selected
          </p>
        </div>
      </section>

      {/* Round-trip Date Selection (Requirement 18.3) */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">
          Round-trip Date Selection
        </h2>
        <p className="text-gray-600">
          Demonstrates Requirement 18.3: Return date must be after departure
          date
        </p>
        <div className="max-w-md space-y-4">
          <DatePicker
            label="Departure Date"
            value={departureDate}
            onChange={(date) => {
              setDepartureDate(date);
              // Clear return date if it's before the new departure date
              if (returnDate && date && returnDate < date) {
                setReturnDate(null);
              }
            }}
            minDate={today}
            placeholder="Select departure date"
            required
            ariaLabel="Round-trip departure date"
          />

          <DatePicker
            label="Return Date"
            value={returnDate}
            onChange={setReturnDate}
            minDate={departureDate ? addDays(departureDate, 1) : tomorrow}
            placeholder="Select return date"
            disabled={!departureDate}
            required
            ariaLabel="Round-trip return date"
          />

          {departureDate && returnDate && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>Trip Duration:</strong>{" "}
                {Math.ceil(
                  (returnDate.getTime() - departureDate.getTime()) /
                    (1000 * 60 * 60 * 24),
                )}{" "}
                days
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Date Range Restriction */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">
          Date Range Restriction
        </h2>
        <p className="text-gray-600">
          Date picker with both minimum and maximum date restrictions
        </p>
        <div className="max-w-md">
          <DatePicker
            label="Select date within next 30 days"
            value={rangeDate}
            onChange={setRangeDate}
            minDate={today}
            maxDate={nextMonth}
            placeholder="Choose a date"
            ariaLabel="Date range restricted picker"
          />
          <p className="mt-2 text-sm text-gray-500">
            Only dates between today and {nextMonth.toLocaleDateString()} can be
            selected
          </p>
        </div>
      </section>

      {/* With Error State */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Error State</h2>
        <p className="text-gray-600">
          Date picker with validation error message
        </p>
        <div className="max-w-md">
          <DatePicker
            label="Required Date Field"
            value={null}
            onChange={() => {}}
            placeholder="This field is required"
            required
            error="Please select a date"
            ariaLabel="Date picker with error"
          />
        </div>
      </section>

      {/* Disabled State */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Disabled State</h2>
        <p className="text-gray-600">Date picker in disabled state</p>
        <div className="max-w-md">
          <DatePicker
            label="Disabled Date Picker"
            value={new Date()}
            onChange={() => {}}
            disabled
            ariaLabel="Disabled date picker"
          />
        </div>
      </section>

      {/* Manual Input Formats */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">
          Manual Input Support (Requirement 18.6)
        </h2>
        <p className="text-gray-600">Type dates manually in various formats</p>
        <div className="max-w-md">
          <DatePicker
            label="Type or select a date"
            value={null}
            onChange={() => {}}
            placeholder="Try: 12/25/2024 or 2024-12-25"
            ariaLabel="Manual input date picker"
          />
          <div className="mt-2 text-sm text-gray-500 space-y-1">
            <p>
              <strong>Supported formats:</strong>
            </p>
            <ul className="list-disc list-inside ml-2">
              <li>MM/DD/YYYY (e.g., 12/25/2024)</li>
              <li>YYYY-MM-DD (e.g., 2024-12-25)</li>
              <li>MMM D, YYYY (e.g., Dec 25, 2024)</li>
              <li>MMMM D, YYYY (e.g., December 25, 2024)</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Accessibility Features */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">
          Accessibility Features
        </h2>
        <p className="text-gray-600">
          The DatePicker component includes comprehensive accessibility support:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
          <li>Keyboard navigation (Tab, Enter, Escape, Arrow keys)</li>
          <li>ARIA labels and roles for screen readers</li>
          <li>Focus management and visual focus indicators</li>
          <li>Semantic HTML structure</li>
          <li>Clear error messages with ARIA attributes</li>
          <li>Descriptive button labels</li>
        </ul>
      </section>
    </div>
  );
};

export default DatePickerExamples;
