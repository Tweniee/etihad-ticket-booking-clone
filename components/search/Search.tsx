"use client";

import React, { useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Minus, X, Plane } from "lucide-react";
import { AutocompleteInput } from "@/components/shared/AutocompleteInput";
import { DatePicker } from "@/components/shared/DatePicker";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import type { Airport, SearchCriteria, TripType } from "@/lib/types";
import { searchCriteriaSchema } from "@/lib/validation/search";
import { cn } from "@/lib/utils/cn";

export interface SearchProps {
  /**
   * Initial search values (for editing existing search)
   */
  initialValues?: Partial<SearchCriteria>;

  /**
   * Callback when search is submitted
   */
  onSearch: (criteria: SearchCriteria) => void | Promise<void>;

  /**
   * Whether the search is currently loading
   */
  isLoading?: boolean;

  /**
   * Function to search for airports (for autocomplete)
   */
  onAirportSearch: (query: string) => Promise<Airport[]>;
}

/**
 * Search Component
 *
 * Comprehensive flight search form with:
 * - Trip type selector (one-way, round-trip, multi-city)
 * - Airport autocomplete inputs
 * - Date pickers with validation
 * - Passenger counter
 * - Cabin class selector
 * - Form validation
 *
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6
 */
export const Search: React.FC<SearchProps> = ({
  initialValues,
  onSearch,
  isLoading = false,
  onAirportSearch,
}) => {
  const [tripType, setTripType] = useState<TripType>(
    initialValues?.tripType || "round-trip",
  );

  // Initialize form with react-hook-form and zod validation
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(searchCriteriaSchema),
    defaultValues: {
      tripType: initialValues?.tripType || "round-trip",
      segments: initialValues?.segments || [
        {
          origin: null,
          destination: null,
          departureDate: null,
        },
        {
          origin: null,
          destination: null,
          departureDate: null,
        },
      ],
      passengers: initialValues?.passengers || {
        adults: 1,
        children: 0,
        infants: 0,
      },
      cabinClass: initialValues?.cabinClass || "economy",
    },
  });

  // Field array for multi-city segments
  const { fields, append, remove } = useFieldArray({
    control,
    name: "segments",
  });

  // Watch trip type to update segments
  const watchedTripType = watch("tripType");
  const watchedSegments = watch("segments");

  // Handle trip type change
  const handleTripTypeChange = (newTripType: TripType) => {
    setTripType(newTripType);
    setValue("tripType", newTripType);

    // Adjust segments based on trip type
    if (newTripType === "one-way") {
      // Keep only first segment
      setValue("segments", [
        watchedSegments[0] || {
          origin: null,
          destination: null,
          departureDate: null,
        },
      ]);
    } else if (newTripType === "round-trip") {
      // Ensure exactly 2 segments
      const firstSegment = watchedSegments[0] || {
        origin: null,
        destination: null,
        departureDate: null,
      };
      const secondSegment = watchedSegments[1] || {
        origin: firstSegment.destination,
        destination: firstSegment.origin,
        departureDate: null,
      };
      setValue("segments", [firstSegment, secondSegment]);
    } else if (newTripType === "multi-city") {
      // Ensure at least 2 segments
      if (watchedSegments.length < 2) {
        setValue("segments", [
          ...watchedSegments,
          { origin: null, destination: null, departureDate: null },
        ]);
      }
    }
  };

  // Handle passenger count change
  const handlePassengerChange = (
    type: "adults" | "children" | "infants",
    delta: number,
  ) => {
    const currentPassengers = watch("passengers");
    const newValue = Math.max(
      type === "adults" ? 1 : 0,
      Math.min(9, currentPassengers[type] + delta),
    );
    setValue(`passengers.${type}`, newValue);
  };

  // Handle form submission
  const onSubmit = async (data: any) => {
    try {
      await onSearch(data as SearchCriteria);
    } catch (error) {
      console.error("Search submission error:", error);
    }
  };

  // Get total passenger count
  const passengers = watch("passengers");
  const totalPassengers =
    passengers.adults + passengers.children + passengers.infants;

  return (
    <div className="w-full max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Trip Type Selector */}
        <div className="flex space-x-2 border-b border-gray-200">
          <button
            type="button"
            onClick={() => handleTripTypeChange("round-trip")}
            className={cn(
              "px-6 py-3 font-medium text-sm transition-colors",
              "border-b-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
              tripType === "round-trip"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900",
            )}
            aria-pressed={tripType === "round-trip"}
          >
            Round Trip
          </button>
          <button
            type="button"
            onClick={() => handleTripTypeChange("one-way")}
            className={cn(
              "px-6 py-3 font-medium text-sm transition-colors",
              "border-b-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
              tripType === "one-way"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900",
            )}
            aria-pressed={tripType === "one-way"}
          >
            One Way
          </button>
          <button
            type="button"
            onClick={() => handleTripTypeChange("multi-city")}
            className={cn(
              "px-6 py-3 font-medium text-sm transition-colors",
              "border-b-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
              tripType === "multi-city"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900",
            )}
            aria-pressed={tripType === "multi-city"}
          >
            Multi-City
          </button>
        </div>

        {/* Flight Segments */}
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-gray-200 rounded-lg relative"
            >
              {/* Segment label for multi-city */}
              {tripType === "multi-city" && (
                <div className="md:col-span-3 flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-700 flex items-center">
                    <Plane className="w-4 h-4 mr-2" />
                    Flight {index + 1}
                  </h3>
                  {fields.length > 2 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-red-600 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 rounded p-1"
                      aria-label={`Remove flight ${index + 1}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}

              {/* Origin Airport */}
              <Controller
                name={`segments.${index}.origin`}
                control={control}
                render={({ field: { value, onChange } }) => (
                  <AutocompleteInput
                    value={value}
                    onChange={onChange}
                    onSearch={onAirportSearch}
                    label={
                      index === 0 || tripType === "multi-city" ? "From" : "To"
                    }
                    placeholder="City or airport"
                    required
                    error={errors.segments?.[index]?.origin?.message}
                    id={`origin-${index}`}
                    name={`segments.${index}.origin`}
                  />
                )}
              />

              {/* Destination Airport */}
              <Controller
                name={`segments.${index}.destination`}
                control={control}
                render={({ field: { value, onChange } }) => (
                  <AutocompleteInput
                    value={value}
                    onChange={onChange}
                    onSearch={onAirportSearch}
                    label={
                      index === 0 || tripType === "multi-city" ? "To" : "From"
                    }
                    placeholder="City or airport"
                    required
                    error={errors.segments?.[index]?.destination?.message}
                    id={`destination-${index}`}
                    name={`segments.${index}.destination`}
                  />
                )}
              />

              {/* Departure Date */}
              <Controller
                name={`segments.${index}.departureDate`}
                control={control}
                render={({ field: { value, onChange } }) => (
                  <DatePicker
                    value={value}
                    onChange={onChange}
                    label={
                      tripType === "round-trip" && index === 1
                        ? "Return Date"
                        : "Departure Date"
                    }
                    placeholder="Select date"
                    required
                    minDate={
                      index === 1 && watchedSegments[0]?.departureDate
                        ? watchedSegments[0].departureDate
                        : new Date()
                    }
                    error={errors.segments?.[index]?.departureDate?.message}
                    id={`departure-${index}`}
                    name={`segments.${index}.departureDate`}
                  />
                )}
              />
            </div>
          ))}

          {/* Add Flight Button (Multi-city only) */}
          {tripType === "multi-city" && fields.length < 5 && (
            <button
              type="button"
              onClick={() =>
                append({ origin: null, destination: null, departureDate: null })
              }
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Another Flight
            </button>
          )}
        </div>

        {/* Passengers and Cabin Class */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Passengers */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Passengers
            </label>
            <div className="border border-gray-300 rounded-lg p-4 space-y-3">
              {/* Adults */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    Adults
                  </div>
                  <div className="text-xs text-gray-500">12+ years</div>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => handlePassengerChange("adults", -1)}
                    disabled={passengers.adults <= 1}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Decrease adults"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-medium">
                    {passengers.adults}
                  </span>
                  <button
                    type="button"
                    onClick={() => handlePassengerChange("adults", 1)}
                    disabled={totalPassengers >= 9}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Increase adults"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Children */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    Children
                  </div>
                  <div className="text-xs text-gray-500">2-11 years</div>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => handlePassengerChange("children", -1)}
                    disabled={passengers.children <= 0}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Decrease children"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-medium">
                    {passengers.children}
                  </span>
                  <button
                    type="button"
                    onClick={() => handlePassengerChange("children", 1)}
                    disabled={totalPassengers >= 9}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Increase children"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Infants */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    Infants
                  </div>
                  <div className="text-xs text-gray-500">Under 2 years</div>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => handlePassengerChange("infants", -1)}
                    disabled={passengers.infants <= 0}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Decrease infants"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-medium">
                    {passengers.infants}
                  </span>
                  <button
                    type="button"
                    onClick={() => handlePassengerChange("infants", 1)}
                    disabled={
                      totalPassengers >= 9 ||
                      passengers.infants >= passengers.adults
                    }
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Increase infants"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            {errors.passengers && (
              <ErrorMessage
                message={errors.passengers.message || "Invalid passenger count"}
              />
            )}
          </div>

          {/* Cabin Class */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Cabin Class
            </label>
            <Controller
              name="cabinClass"
              control={control}
              render={({ field: { value, onChange } }) => (
                <div className="space-y-2">
                  {[
                    {
                      value: "economy",
                      label: "Economy",
                      description: "Standard seating",
                    },
                    {
                      value: "business",
                      label: "Business",
                      description: "Enhanced comfort",
                    },
                    {
                      value: "first",
                      label: "First Class",
                      description: "Premium experience",
                    },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={cn(
                        "flex items-center p-4 border rounded-lg cursor-pointer transition-colors",
                        value === option.value
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-300 hover:border-gray-400",
                      )}
                    >
                      <input
                        type="radio"
                        value={option.value}
                        checked={value === option.value}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {option.label}
                        </div>
                        <div className="text-xs text-gray-500">
                          {option.description}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            />
            {errors.cabinClass && (
              <ErrorMessage message={errors.cabinClass.message} />
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              "px-8 py-3 bg-blue-600 text-white font-medium rounded-lg",
              "hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "transition-colors flex items-center space-x-2",
            )}
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Searching...</span>
              </>
            ) : (
              <span>Search Flights</span>
            )}
          </button>
        </div>

        {/* Form-level errors */}
        {errors.root && <ErrorMessage message={errors.root.message} />}
      </form>
    </div>
  );
};

export default Search;
