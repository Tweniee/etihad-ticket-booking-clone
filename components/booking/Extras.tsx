"use client";

import React, { useState } from "react";
import {
  Luggage,
  UtensilsCrossed,
  Shield,
  Coffee,
  Plus,
  Minus,
  Check,
} from "lucide-react";
import { PriceDisplay } from "@/components/shared/PriceDisplay";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import type {
  Flight,
  PassengerInfo,
  SelectedExtras,
  BaggageExtra,
  MealExtra,
  InsuranceExtra,
  LoungeExtra,
} from "@/lib/types";
import { cn } from "@/lib/utils/cn";

export interface ExtrasProps {
  /**
   * Selected flight
   */
  flight: Flight;

  /**
   * List of passengers
   */
  passengers: PassengerInfo[];

  /**
   * Currently selected extras
   */
  selectedExtras: SelectedExtras;

  /**
   * Callback when extras change
   */
  onExtrasChange: (extras: SelectedExtras) => void;

  /**
   * Callback when user continues
   */
  onContinue: () => void | Promise<void>;

  /**
   * Callback when user goes back
   */
  onBack?: () => void;

  /**
   * Whether the form is currently submitting
   */
  isLoading?: boolean;
}

// Available baggage weight options (in kg)
const BAGGAGE_WEIGHTS = [5, 10, 15, 20, 25, 32];

// Baggage prices per kg
const BAGGAGE_PRICE_PER_KG = 10;

// Available meal options
const MEAL_OPTIONS = [
  { type: "standard", label: "Standard Meal", price: 15 },
  { type: "vegetarian", label: "Vegetarian", price: 15 },
  { type: "vegan", label: "Vegan", price: 15 },
  { type: "halal", label: "Halal", price: 15 },
  { type: "kosher", label: "Kosher", price: 18 },
  { type: "gluten-free", label: "Gluten-Free", price: 18 },
  { type: "diabetic", label: "Diabetic", price: 18 },
];

// Insurance options
const INSURANCE_OPTIONS: InsuranceExtra[] = [
  {
    type: "basic",
    coverage: 50000,
    price: 25,
  },
  {
    type: "comprehensive",
    coverage: 100000,
    price: 50,
  },
];

// Lounge access price
const LOUNGE_ACCESS_PRICE = 45;

/**
 * Extras Component
 *
 * Allows users to add optional services to their booking:
 * - Additional baggage (per passenger)
 * - Meal selection (per passenger)
 * - Travel insurance
 * - Lounge access
 *
 * Requirements: 8.1, 8.3, 8.6
 */
export const Extras: React.FC<ExtrasProps> = ({
  flight,
  passengers,
  selectedExtras,
  onExtrasChange,
  onContinue,
  onBack,
  isLoading = false,
}) => {
  const [activeTab, setActiveTab] = useState<
    "baggage" | "meals" | "insurance" | "lounge"
  >("baggage");
  const [error, setError] = useState<string | null>(null);

  // Handle baggage selection for a passenger
  const handleBaggageChange = (passengerId: string, weight: number | null) => {
    const newBaggage = new Map(selectedExtras.baggage);

    if (weight === null) {
      newBaggage.delete(passengerId);
    } else {
      newBaggage.set(passengerId, {
        weight,
        price: weight * BAGGAGE_PRICE_PER_KG,
      });
    }

    onExtrasChange({
      ...selectedExtras,
      baggage: newBaggage,
    });
  };

  // Handle meal selection for a passenger
  const handleMealChange = (passengerId: string, mealType: string | null) => {
    const newMeals = new Map(selectedExtras.meals);

    if (mealType === null) {
      newMeals.delete(passengerId);
    } else {
      const meal = MEAL_OPTIONS.find((m) => m.type === mealType);
      if (meal) {
        newMeals.set(passengerId, {
          type: meal.type,
          price: meal.price,
        });
      }
    }

    onExtrasChange({
      ...selectedExtras,
      meals: newMeals,
    });
  };

  // Handle insurance selection
  const handleInsuranceChange = (
    insuranceType: "basic" | "comprehensive" | null,
  ) => {
    const insurance = insuranceType
      ? INSURANCE_OPTIONS.find((i) => i.type === insuranceType) || null
      : null;

    onExtrasChange({
      ...selectedExtras,
      insurance,
    });
  };

  // Handle lounge access toggle
  const handleLoungeAccessToggle = () => {
    const loungeAccess = selectedExtras.loungeAccess
      ? null
      : {
          airport: flight.segments[0].departure.airport.code,
          price: LOUNGE_ACCESS_PRICE,
        };

    onExtrasChange({
      ...selectedExtras,
      loungeAccess,
    });
  };

  // Handle continue
  const handleContinue = async () => {
    setError(null);
    try {
      await onContinue();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to continue. Please try again.",
      );
    }
  };

  // Calculate total extras price
  const calculateExtrasTotal = (): number => {
    let total = 0;

    selectedExtras.baggage.forEach((baggage) => {
      total += baggage.price;
    });

    selectedExtras.meals.forEach((meal) => {
      total += meal.price;
    });

    if (selectedExtras.insurance) {
      total += selectedExtras.insurance.price;
    }

    if (selectedExtras.loungeAccess) {
      total += selectedExtras.loungeAccess.price;
    }

    return total;
  };

  return (
    <div className="w-full max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Add Extras to Your Journey
        </h2>
        <p className="text-gray-600">
          Enhance your travel experience with additional services (optional)
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("baggage")}
          className={cn(
            "px-6 py-3 font-medium text-sm transition-colors",
            "border-b-2 focus:outline-none",
            activeTab === "baggage"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-900",
          )}
        >
          <div className="flex items-center space-x-2">
            <Luggage className="w-4 h-4" />
            <span>Extra Baggage</span>
            {selectedExtras.baggage.size > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full">
                {selectedExtras.baggage.size}
              </span>
            )}
          </div>
        </button>

        <button
          onClick={() => setActiveTab("meals")}
          className={cn(
            "px-6 py-3 font-medium text-sm transition-colors",
            "border-b-2 focus:outline-none",
            activeTab === "meals"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-900",
          )}
        >
          <div className="flex items-center space-x-2">
            <UtensilsCrossed className="w-4 h-4" />
            <span>Meals</span>
            {selectedExtras.meals.size > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full">
                {selectedExtras.meals.size}
              </span>
            )}
          </div>
        </button>

        <button
          onClick={() => setActiveTab("insurance")}
          className={cn(
            "px-6 py-3 font-medium text-sm transition-colors",
            "border-b-2 focus:outline-none",
            activeTab === "insurance"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-900",
          )}
        >
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4" />
            <span>Insurance</span>
            {selectedExtras.insurance && (
              <Check className="w-4 h-4 text-green-600" />
            )}
          </div>
        </button>

        <button
          onClick={() => setActiveTab("lounge")}
          className={cn(
            "px-6 py-3 font-medium text-sm transition-colors",
            "border-b-2 focus:outline-none",
            activeTab === "lounge"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-900",
          )}
        >
          <div className="flex items-center space-x-2">
            <Coffee className="w-4 h-4" />
            <span>Lounge Access</span>
            {selectedExtras.loungeAccess && (
              <Check className="w-4 h-4 text-green-600" />
            )}
          </div>
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {/* Baggage Tab */}
        {activeTab === "baggage" && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-900">
                <strong>Note:</strong> Your ticket includes standard checked
                baggage allowance. Add extra baggage here if needed.
              </p>
            </div>

            {passengers.map((passenger) => {
              const selectedBaggage = selectedExtras.baggage.get(passenger.id);

              return (
                <div
                  key={passenger.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {passenger.firstName} {passenger.lastName}
                      </h4>
                      <p className="text-sm text-gray-600 capitalize">
                        {passenger.type}
                      </p>
                    </div>
                    {selectedBaggage && (
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          {selectedBaggage.weight}kg
                        </p>
                        <PriceDisplay
                          amount={selectedBaggage.price}
                          currency={flight.price.currency}
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {BAGGAGE_WEIGHTS.map((weight) => (
                      <button
                        key={weight}
                        onClick={() =>
                          handleBaggageChange(
                            passenger.id,
                            selectedBaggage?.weight === weight ? null : weight,
                          )
                        }
                        className={cn(
                          "px-4 py-3 border rounded-lg text-center transition-all",
                          "focus:outline-none focus:ring-2 focus:ring-blue-500",
                          selectedBaggage?.weight === weight
                            ? "border-blue-600 bg-blue-50 text-blue-900"
                            : "border-gray-300 hover:border-blue-400",
                        )}
                      >
                        <div className="font-medium">{weight}kg</div>
                        <div className="text-xs text-gray-600 mt-1">
                          ${weight * BAGGAGE_PRICE_PER_KG}
                        </div>
                      </button>
                    ))}
                  </div>

                  {selectedBaggage && (
                    <button
                      onClick={() => handleBaggageChange(passenger.id, null)}
                      className="mt-3 text-sm text-red-600 hover:text-red-700"
                    >
                      Remove extra baggage
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Meals Tab */}
        {activeTab === "meals" && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-900">
                <strong>Note:</strong> Pre-order your meal to ensure your
                preferred choice is available.
              </p>
            </div>

            {passengers.map((passenger) => {
              const selectedMeal = selectedExtras.meals.get(passenger.id);

              return (
                <div
                  key={passenger.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {passenger.firstName} {passenger.lastName}
                      </h4>
                      <p className="text-sm text-gray-600 capitalize">
                        {passenger.type}
                      </p>
                    </div>
                    {selectedMeal && (
                      <PriceDisplay
                        amount={selectedMeal.price}
                        currency={flight.price.currency}
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    {MEAL_OPTIONS.map((meal) => (
                      <button
                        key={meal.type}
                        onClick={() =>
                          handleMealChange(
                            passenger.id,
                            selectedMeal?.type === meal.type ? null : meal.type,
                          )
                        }
                        className={cn(
                          "w-full px-4 py-3 border rounded-lg text-left transition-all",
                          "focus:outline-none focus:ring-2 focus:ring-blue-500",
                          "flex items-center justify-between",
                          selectedMeal?.type === meal.type
                            ? "border-blue-600 bg-blue-50"
                            : "border-gray-300 hover:border-blue-400",
                        )}
                      >
                        <span className="font-medium">{meal.label}</span>
                        <span className="text-sm text-gray-600">
                          ${meal.price}
                        </span>
                      </button>
                    ))}
                  </div>

                  {selectedMeal && (
                    <button
                      onClick={() => handleMealChange(passenger.id, null)}
                      className="mt-3 text-sm text-red-600 hover:text-red-700"
                    >
                      Remove meal selection
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Insurance Tab */}
        {activeTab === "insurance" && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-900">
                <strong>Travel Insurance:</strong> Protect your trip against
                unexpected events.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {INSURANCE_OPTIONS.map((insurance) => (
                <button
                  key={insurance.type}
                  onClick={() =>
                    handleInsuranceChange(
                      selectedExtras.insurance?.type === insurance.type
                        ? null
                        : insurance.type,
                    )
                  }
                  className={cn(
                    "border rounded-lg p-6 text-left transition-all",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500",
                    selectedExtras.insurance?.type === insurance.type
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-300 hover:border-blue-400",
                  )}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-lg capitalize">
                        {insurance.type} Coverage
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Up to ${insurance.coverage.toLocaleString()} coverage
                      </p>
                    </div>
                    {selectedExtras.insurance?.type === insurance.type && (
                      <Check className="w-6 h-6 text-blue-600" />
                    )}
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-700">
                      <Check className="w-4 h-4 text-green-600 mr-2" />
                      <span>Trip cancellation</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <Check className="w-4 h-4 text-green-600 mr-2" />
                      <span>Medical emergencies</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <Check className="w-4 h-4 text-green-600 mr-2" />
                      <span>Lost baggage</span>
                    </div>
                    {insurance.type === "comprehensive" && (
                      <>
                        <div className="flex items-center text-sm text-gray-700">
                          <Check className="w-4 h-4 text-green-600 mr-2" />
                          <span>Flight delays</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-700">
                          <Check className="w-4 h-4 text-green-600 mr-2" />
                          <span>24/7 assistance</span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <PriceDisplay
                      amount={insurance.price}
                      currency={flight.price.currency}
                    />
                  </div>
                </button>
              ))}
            </div>

            {selectedExtras.insurance && (
              <button
                onClick={() => handleInsuranceChange(null)}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Remove insurance
              </button>
            )}
          </div>
        )}

        {/* Lounge Access Tab */}
        {activeTab === "lounge" && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-900">
                <strong>Airport Lounge:</strong> Relax before your flight with
                complimentary food, drinks, and Wi-Fi.
              </p>
            </div>

            <button
              onClick={handleLoungeAccessToggle}
              className={cn(
                "w-full border rounded-lg p-6 text-left transition-all",
                "focus:outline-none focus:ring-2 focus:ring-blue-500",
                selectedExtras.loungeAccess
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-300 hover:border-blue-400",
              )}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-lg">
                    {flight.segments[0].departure.airport.name} Lounge
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {flight.segments[0].departure.airport.city},{" "}
                    {flight.segments[0].departure.airport.country}
                  </p>
                </div>
                {selectedExtras.loungeAccess && (
                  <Check className="w-6 h-6 text-blue-600" />
                )}
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-600 mr-2" />
                  <span>Complimentary food & beverages</span>
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-600 mr-2" />
                  <span>High-speed Wi-Fi</span>
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-600 mr-2" />
                  <span>Comfortable seating</span>
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-600 mr-2" />
                  <span>Shower facilities</span>
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-600 mr-2" />
                  <span>Business center</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <PriceDisplay
                  amount={LOUNGE_ACCESS_PRICE}
                  currency={flight.price.currency}
                />
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Extras Total</h3>
          <PriceDisplay
            amount={calculateExtrasTotal()}
            currency={flight.price.currency}
            className="text-xl"
          />
        </div>

        {calculateExtrasTotal() === 0 && (
          <p className="text-sm text-gray-600 mb-4">
            No extras selected. You can skip this step or add extras above.
          </p>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4">
          <ErrorMessage message={error} />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between mt-6">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            disabled={isLoading}
            className={cn(
              "px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg",
              "hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "transition-colors",
            )}
          >
            Back
          </button>
        )}

        <button
          type="button"
          onClick={handleContinue}
          disabled={isLoading}
          className={cn(
            "px-8 py-3 bg-blue-600 text-white font-medium rounded-lg",
            "hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "transition-colors flex items-center space-x-2",
            !onBack && "ml-auto",
          )}
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" />
              <span>Processing...</span>
            </>
          ) : (
            <span>Continue to Payment</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default Extras;
