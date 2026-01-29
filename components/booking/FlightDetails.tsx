/**
 * FlightDetails Component
 *
 * Displays comprehensive flight information including:
 * - Complete itinerary with all segments
 * - Baggage allowance
 * - Fare rules (change/cancellation policies)
 * - Aircraft type and amenities
 * - Price summary
 *
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 */

"use client";

import React, { useState } from "react";
import Image from "next/image";
import { format } from "date-fns";
import {
  Plane,
  Clock,
  Briefcase,
  ShoppingBag,
  Info,
  ChevronDown,
  ChevronUp,
  Check,
  X,
} from "lucide-react";
import type { FlightDetails as FlightDetailsType } from "@/lib/types";

interface FlightDetailsProps {
  flight: FlightDetailsType;
  onContinue: () => void;
  onBack: () => void;
}

export function FlightDetails({
  flight,
  onContinue,
  onBack,
}: FlightDetailsProps) {
  const [expandedSegment, setExpandedSegment] = useState<number | null>(0);
  const [showFareRules, setShowFareRules] = useState(false);

  const toggleSegment = (index: number) => {
    setExpandedSegment(expandedSegment === index ? null : index);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatDateTime = (date: Date) => {
    return format(new Date(date), "EEE, MMM d, yyyy 'at' h:mm a");
  };

  const formatTime = (date: Date) => {
    return format(new Date(date), "h:mm a");
  };

  const totalDuration = flight.segments.reduce(
    (sum, segment) => sum + segment.duration,
    0,
  );

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12">
              <Image
                src={flight.airline.logo}
                alt={flight.airline.name}
                width={48}
                height={48}
                className="object-contain"
                unoptimized={flight.airline.logo.startsWith("data:")}
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {flight.airline.name}
              </h1>
              <p className="text-gray-600">
                Flight {flight.flightNumber} • {flight.cabinClass}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-blue-600">
              {flight.price.currency} {flight.price.amount.toFixed(2)}
            </p>
            <p className="text-sm text-gray-600">per passenger</p>
          </div>
        </div>

        {/* Flight Summary */}
        <div className="flex items-center justify-between py-4 border-t border-gray-200">
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {flight.segments[0].departure.airport.code}
            </p>
            <p className="text-sm text-gray-600">
              {flight.segments[0].departure.airport.city}
            </p>
          </div>
          <div className="flex-1 px-4">
            <div className="flex items-center justify-center gap-2">
              <div className="h-px bg-gray-300 flex-1" />
              <Plane className="h-5 w-5 text-gray-400" />
              <div className="h-px bg-gray-300 flex-1" />
            </div>
            <p className="text-center text-sm text-gray-600 mt-1">
              {formatDuration(totalDuration)}
              {flight.segments.length > 1 &&
                ` • ${flight.segments.length - 1} stop${flight.segments.length > 2 ? "s" : ""}`}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">
              {flight.segments[flight.segments.length - 1].arrival.airport.code}
            </p>
            <p className="text-sm text-gray-600">
              {flight.segments[flight.segments.length - 1].arrival.airport.city}
            </p>
          </div>
        </div>
      </div>

      {/* Itinerary Details */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Flight Itinerary
        </h2>
        <div className="space-y-4">
          {flight.segments.map((segment, index) => (
            <div key={index} className="border border-gray-200 rounded-lg">
              {/* Segment Header */}
              <button
                onClick={() => toggleSegment(index)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">
                      {segment.departure.airport.code} →{" "}
                      {segment.arrival.airport.code}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatDateTime(segment.departure.dateTime)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {formatDuration(segment.duration)}
                    </p>
                    <p className="text-xs text-gray-600">{segment.aircraft}</p>
                  </div>
                  {expandedSegment === index ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </button>

              {/* Segment Details */}
              {expandedSegment === index && (
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                  <div className="space-y-4">
                    {/* Departure */}
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-blue-600" />
                        <div className="w-px h-full bg-gray-300 my-1" />
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="font-semibold text-gray-900">
                          {formatTime(segment.departure.dateTime)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {segment.departure.airport.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {segment.departure.airport.city},{" "}
                          {segment.departure.airport.country}
                        </p>
                        {segment.departure.terminal && (
                          <p className="text-sm text-gray-500 mt-1">
                            Terminal {segment.departure.terminal}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Flight Info */}
                    <div className="flex gap-4 pl-7">
                      <div className="flex-1 bg-white rounded-lg p-3 border border-gray-200">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>
                            Duration: {formatDuration(segment.duration)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                          <Plane className="h-4 w-4" />
                          <span>Aircraft: {segment.aircraft}</span>
                        </div>
                        {segment.operatingAirline && (
                          <div className="text-sm text-gray-600 mt-2">
                            Operated by {segment.operatingAirline.name}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Arrival */}
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {formatTime(segment.arrival.dateTime)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {segment.arrival.airport.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {segment.arrival.airport.city},{" "}
                          {segment.arrival.airport.country}
                        </p>
                        {segment.arrival.terminal && (
                          <p className="text-sm text-gray-500 mt-1">
                            Terminal {segment.arrival.terminal}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Baggage Allowance */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          Baggage Allowance
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Checked Bags */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Checked Baggage
            </h3>
            <div className="space-y-2 text-sm">
              <p className="text-gray-700">
                <span className="font-medium">Quantity:</span>{" "}
                {flight.baggage.checkedBags.quantity} bag
                {flight.baggage.checkedBags.quantity > 1 ? "s" : ""}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Weight:</span>{" "}
                {flight.baggage.checkedBags.weight} kg per bag
              </p>
              {flight.baggage.checkedBags.dimensions && (
                <p className="text-gray-700">
                  <span className="font-medium">Dimensions:</span>{" "}
                  {flight.baggage.checkedBags.dimensions}
                </p>
              )}
            </div>
          </div>

          {/* Carry-on */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Carry-on Baggage
            </h3>
            <div className="space-y-2 text-sm">
              <p className="text-gray-700">
                <span className="font-medium">Quantity:</span>{" "}
                {flight.baggage.carryOn.quantity} bag
                {flight.baggage.carryOn.quantity > 1 ? "s" : ""}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Weight:</span>{" "}
                {flight.baggage.carryOn.weight} kg per bag
              </p>
              {flight.baggage.carryOn.dimensions && (
                <p className="text-gray-700">
                  <span className="font-medium">Dimensions:</span>{" "}
                  {flight.baggage.carryOn.dimensions}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Amenities */}
      {flight.amenities && flight.amenities.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Aircraft Amenities
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {flight.amenities.map((amenity, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-sm text-gray-700"
              >
                <Check className="h-4 w-4 text-green-600" />
                <span>{amenity}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fare Rules */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <button
          onClick={() => setShowFareRules(!showFareRules)}
          className="w-full flex items-center justify-between"
        >
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Info className="h-5 w-5" />
            Fare Rules & Policies
          </h2>
          {showFareRules ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </button>

        {showFareRules && (
          <div className="mt-4 space-y-4">
            {/* Refundable Status */}
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              {flight.fareRules.refundable ? (
                <Check className="h-5 w-5 text-green-600 mt-0.5" />
              ) : (
                <X className="h-5 w-5 text-red-600 mt-0.5" />
              )}
              <div>
                <p className="font-semibold text-gray-900">
                  {flight.fareRules.refundable
                    ? "Refundable"
                    : "Non-refundable"}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {flight.fareRules.refundable
                    ? "This ticket is eligible for refund according to the cancellation policy."
                    : "This ticket is non-refundable. Cancellation fees apply."}
                </p>
              </div>
            </div>

            {/* Change Policy */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">
                Change Policy
              </h3>
              <p className="text-sm text-gray-700 mb-2">
                {flight.fareRules.changePolicy}
              </p>
              {flight.fareRules.changeFee !== null ? (
                <p className="text-sm font-medium text-gray-900">
                  Change Fee: {flight.price.currency}{" "}
                  {flight.fareRules.changeFee.toFixed(2)}
                </p>
              ) : (
                <p className="text-sm font-medium text-red-600">
                  Changes not permitted
                </p>
              )}
            </div>

            {/* Cancellation Policy */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">
                Cancellation Policy
              </h3>
              <p className="text-sm text-gray-700 mb-2">
                {flight.fareRules.cancellationPolicy}
              </p>
              {flight.fareRules.cancellationFee !== null ? (
                <p className="text-sm font-medium text-gray-900">
                  Cancellation Fee: {flight.price.currency}{" "}
                  {flight.fareRules.cancellationFee.toFixed(2)}
                </p>
              ) : (
                <p className="text-sm font-medium text-red-600">
                  Cancellation not permitted
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Price Breakdown */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Price Breakdown
        </h2>
        <div className="space-y-2">
          <div className="flex justify-between text-gray-700">
            <span>Base Fare</span>
            <span>
              {flight.price.currency}{" "}
              {flight.price.breakdown.baseFare.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>Taxes</span>
            <span>
              {flight.price.currency} {flight.price.breakdown.taxes.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>Fees</span>
            <span>
              {flight.price.currency} {flight.price.breakdown.fees.toFixed(2)}
            </span>
          </div>
          <div className="border-t border-gray-300 pt-2 mt-2">
            <div className="flex justify-between text-lg font-bold text-gray-900">
              <span>Total per Passenger</span>
              <span>
                {flight.price.currency} {flight.price.amount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
        >
          Back to Results
        </button>
        <button
          onClick={onContinue}
          className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          Continue to Seat Selection
        </button>
      </div>
    </div>
  );
}
