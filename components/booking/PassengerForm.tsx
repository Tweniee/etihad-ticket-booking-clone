"use client";

import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Mail, Phone, Globe } from "lucide-react";
import { DatePicker } from "@/components/shared/DatePicker";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import type { PassengerInfo, PassengerCount } from "@/lib/types";
import {
  createPassengerSchemaWithAgeValidation,
  type ContactInfoInput,
  type PassportInfoInput,
} from "@/lib/validation/passenger";
import { cn } from "@/lib/utils/cn";

export interface PassengerFormProps {
  /**
   * Number of passengers by type
   */
  passengerCount: PassengerCount;

  /**
   * Whether the flight is international (requires passport)
   */
  isInternational: boolean;

  /**
   * Travel date for passport expiry validation
   */
  travelDate: Date;

  /**
   * Initial passenger data (for editing)
   */
  initialPassengers?: PassengerInfo[];

  /**
   * Callback when form is submitted
   */
  onSubmit: (passengers: PassengerInfo[]) => void | Promise<void>;

  /**
   * Whether the form is currently submitting
   */
  isLoading?: boolean;
}

/**
 * PassengerForm Component
 *
 * Comprehensive passenger information form with:
 * - Form for each passenger with all required fields
 * - Conditional passport fields for international flights
 * - Contact information for primary passenger
 * - Date of birth picker with age validation
 * - Real-time validation with error messages
 *
 * Requirements: 7.1, 7.2, 7.3
 */
export const PassengerForm: React.FC<PassengerFormProps> = ({
  passengerCount,
  isInternational,
  travelDate,
  initialPassengers,
  onSubmit,
  isLoading = false,
}) => {
  // Generate passenger list based on counts
  const generatePassengerList = (): PassengerInfo[] => {
    const passengers: PassengerInfo[] = [];
    let id = 1;

    // Add adults
    for (let i = 0; i < passengerCount.adults; i++) {
      passengers.push({
        id: `passenger-${id++}`,
        type: "adult",
        firstName: "",
        lastName: "",
        dateOfBirth: new Date(),
        gender: "male",
        ...(isInternational && {
          passport: {
            number: "",
            expiryDate: new Date(),
            nationality: "",
            issuingCountry: "",
          },
        }),
        ...(i === 0 && {
          contact: {
            email: "",
            phone: "",
            countryCode: "+1",
          },
        }),
      });
    }

    // Add children
    for (let i = 0; i < passengerCount.children; i++) {
      passengers.push({
        id: `passenger-${id++}`,
        type: "child",
        firstName: "",
        lastName: "",
        dateOfBirth: new Date(),
        gender: "male",
        ...(isInternational && {
          passport: {
            number: "",
            expiryDate: new Date(),
            nationality: "",
            issuingCountry: "",
          },
        }),
      });
    }

    // Add infants
    for (let i = 0; i < passengerCount.infants; i++) {
      passengers.push({
        id: `passenger-${id++}`,
        type: "infant",
        firstName: "",
        lastName: "",
        dateOfBirth: new Date(),
        gender: "male",
        ...(isInternational && {
          passport: {
            number: "",
            expiryDate: new Date(),
            nationality: "",
            issuingCountry: "",
          },
        }),
      });
    }

    return passengers;
  };

  const [currentPassengerIndex, setCurrentPassengerIndex] = React.useState(0);
  const passengers = initialPassengers || generatePassengerList();
  const currentPassenger = passengers[currentPassengerIndex];
  const isPrimary = currentPassengerIndex === 0;

  // Create validation schema for current passenger
  const passengerSchema = createPassengerSchemaWithAgeValidation(
    travelDate,
    isInternational,
    isPrimary,
  );

  // Initialize form with react-hook-form and zod validation
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(passengerSchema),
    defaultValues: currentPassenger,
  });

  // Reset form when passenger changes
  useEffect(() => {
    reset(passengers[currentPassengerIndex]);
  }, [currentPassengerIndex, reset]);

  // Handle passenger form submission
  const onPassengerSubmit = async (data: any) => {
    // Update current passenger data
    passengers[currentPassengerIndex] = data as PassengerInfo;

    // If this is the last passenger, submit all
    if (currentPassengerIndex === passengers.length - 1) {
      try {
        await onSubmit(passengers);
      } catch (error) {
        console.error("Passenger form submission error:", error);
      }
    } else {
      // Move to next passenger
      setCurrentPassengerIndex(currentPassengerIndex + 1);
    }
  };

  // Handle back button
  const handleBack = () => {
    if (currentPassengerIndex > 0) {
      setCurrentPassengerIndex(currentPassengerIndex - 1);
    }
  };

  // Get passenger type label
  const getPassengerTypeLabel = (type: string, index: number) => {
    const typeLabels = {
      adult: "Adult",
      child: "Child",
      infant: "Infant",
    };
    return `${typeLabels[type as keyof typeof typeLabels]} ${index + 1}`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-4 sm:p-6">
      {/* Progress indicator */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            Passenger Information
          </h2>
          <span className="text-xs sm:text-sm text-gray-600">
            {currentPassengerIndex + 1} of {passengers.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${((currentPassengerIndex + 1) / passengers.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Current passenger label */}
      <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center">
          <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mr-2" />
          <h3 className="text-base sm:text-lg font-medium text-blue-900">
            {getPassengerTypeLabel(
              currentPassenger.type,
              currentPassengerIndex,
            )}
            {isPrimary && " (Primary Contact)"}
          </h3>
        </div>
        {isPrimary && (
          <p className="text-xs sm:text-sm text-blue-700 mt-1">
            We'll send booking confirmation to this passenger's email
          </p>
        )}
      </div>

      <form
        onSubmit={handleSubmit(onPassengerSubmit)}
        className="space-y-4 sm:space-y-6"
      >
        {/* Basic Information */}
        <div className="space-y-3 sm:space-y-4">
          <h4 className="text-sm sm:text-md font-medium text-gray-900">
            Personal Information
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* First Name */}
            <div>
              <label
                htmlFor="firstName"
                className="block text-xs sm:text-sm font-medium text-gray-700 mb-1"
              >
                First Name <span className="text-red-500">*</span>
              </label>
              <Controller
                name="firstName"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    id="firstName"
                    className={cn(
                      "w-full px-3 sm:px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base",
                      errors.firstName ? "border-red-500" : "border-gray-300",
                    )}
                    placeholder="Enter first name"
                  />
                )}
              />
              {errors.firstName && (
                <ErrorMessage message={errors.firstName.message} />
              )}
            </div>

            {/* Last Name */}
            <div>
              <label
                htmlFor="lastName"
                className="block text-xs sm:text-sm font-medium text-gray-700 mb-1"
              >
                Last Name <span className="text-red-500">*</span>
              </label>
              <Controller
                name="lastName"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    id="lastName"
                    className={cn(
                      "w-full px-3 sm:px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base",
                      errors.lastName ? "border-red-500" : "border-gray-300",
                    )}
                    placeholder="Enter last name"
                  />
                )}
              />
              {errors.lastName && (
                <ErrorMessage message={errors.lastName.message} />
              )}
            </div>

            {/* Date of Birth */}
            <div>
              <label
                htmlFor="dateOfBirth"
                className="block text-xs sm:text-sm font-medium text-gray-700 mb-1"
              >
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <Controller
                name="dateOfBirth"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <DatePicker
                    value={value}
                    onChange={onChange}
                    placeholder="Select date of birth"
                    maxDate={new Date()}
                    required
                    error={errors.dateOfBirth?.message}
                    id="dateOfBirth"
                    name="dateOfBirth"
                  />
                )}
              />
            </div>

            {/* Gender */}
            <div>
              <label
                htmlFor="gender"
                className="block text-xs sm:text-sm font-medium text-gray-700 mb-1"
              >
                Gender <span className="text-red-500">*</span>
              </label>
              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    id="gender"
                    className={cn(
                      "w-full px-3 sm:px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base",
                      errors.gender ? "border-red-500" : "border-gray-300",
                    )}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                )}
              />
              {errors.gender && (
                <ErrorMessage message={errors.gender.message} />
              )}
            </div>
          </div>
        </div>

        {/* Passport Information (International flights only) */}
        {isInternational && (
          <div className="space-y-3 sm:space-y-4 pt-4 sm:pt-6 border-t border-gray-200">
            <div className="flex items-center">
              <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 mr-2" />
              <h4 className="text-sm sm:text-md font-medium text-gray-900">
                Passport Information
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Passport Number */}
              <div>
                <label
                  htmlFor="passport.number"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Passport Number <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="passport.number"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      id="passport.number"
                      className={cn(
                        "w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase",
                        errors.passport?.number
                          ? "border-red-500"
                          : "border-gray-300",
                      )}
                      placeholder="Enter passport number"
                    />
                  )}
                />
                {errors.passport?.number && (
                  <ErrorMessage message={errors.passport.number.message} />
                )}
              </div>

              {/* Passport Expiry Date */}
              <div>
                <label
                  htmlFor="passport.expiryDate"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Passport Expiry Date <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="passport.expiryDate"
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <DatePicker
                      value={value}
                      onChange={onChange}
                      placeholder="Select expiry date"
                      minDate={new Date()}
                      required
                      error={errors.passport?.expiryDate?.message}
                      id="passport.expiryDate"
                      name="passport.expiryDate"
                    />
                  )}
                />
              </div>

              {/* Nationality */}
              <div>
                <label
                  htmlFor="passport.nationality"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Nationality <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="passport.nationality"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      id="passport.nationality"
                      className={cn(
                        "w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500",
                        errors.passport?.nationality
                          ? "border-red-500"
                          : "border-gray-300",
                      )}
                      placeholder="Enter nationality"
                    />
                  )}
                />
                {errors.passport?.nationality && (
                  <ErrorMessage message={errors.passport.nationality.message} />
                )}
              </div>

              {/* Issuing Country */}
              <div>
                <label
                  htmlFor="passport.issuingCountry"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Issuing Country <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="passport.issuingCountry"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      id="passport.issuingCountry"
                      className={cn(
                        "w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500",
                        errors.passport?.issuingCountry
                          ? "border-red-500"
                          : "border-gray-300",
                      )}
                      placeholder="Enter issuing country"
                    />
                  )}
                />
                {errors.passport?.issuingCountry && (
                  <ErrorMessage
                    message={errors.passport.issuingCountry.message}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Contact Information (Primary passenger only) */}
        {isPrimary && (
          <div className="space-y-3 sm:space-y-4 pt-4 sm:pt-6 border-t border-gray-200">
            <div className="flex items-center">
              <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 mr-2" />
              <h4 className="text-sm sm:text-md font-medium text-gray-900">
                Contact Information
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Email */}
              <div className="md:col-span-2">
                <label
                  htmlFor="contact.email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email Address <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="contact.email"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="email"
                      id="contact.email"
                      className={cn(
                        "w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500",
                        errors.contact?.email
                          ? "border-red-500"
                          : "border-gray-300",
                      )}
                      placeholder="Enter email address"
                    />
                  )}
                />
                {errors.contact?.email && (
                  <ErrorMessage message={errors.contact.email.message} />
                )}
              </div>

              {/* Country Code */}
              <div>
                <label
                  htmlFor="contact.countryCode"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Country Code <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="contact.countryCode"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      id="contact.countryCode"
                      className={cn(
                        "w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500",
                        errors.contact?.countryCode
                          ? "border-red-500"
                          : "border-gray-300",
                      )}
                    >
                      <option value="+1">+1 (USA/Canada)</option>
                      <option value="+44">+44 (UK)</option>
                      <option value="+971">+971 (UAE)</option>
                      <option value="+91">+91 (India)</option>
                      <option value="+61">+61 (Australia)</option>
                      <option value="+86">+86 (China)</option>
                    </select>
                  )}
                />
                {errors.contact?.countryCode && (
                  <ErrorMessage message={errors.contact.countryCode.message} />
                )}
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="contact.phone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="contact.phone"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="tel"
                      id="contact.phone"
                      className={cn(
                        "w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500",
                        errors.contact?.phone
                          ? "border-red-500"
                          : "border-gray-300",
                      )}
                      placeholder="Enter phone number"
                    />
                  )}
                />
                {errors.contact?.phone && (
                  <ErrorMessage message={errors.contact.phone.message} />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4 sm:pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentPassengerIndex === 0 || isLoading}
            className={cn(
              "w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 text-gray-700 font-medium rounded-lg text-sm sm:text-base",
              "hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "transition-colors touch-manipulation",
            )}
          >
            Back
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              "w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 bg-blue-600 text-white font-medium rounded-lg text-sm sm:text-base",
              "hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "transition-colors flex items-center justify-center space-x-2 touch-manipulation",
            )}
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Processing...</span>
              </>
            ) : (
              <span>
                {currentPassengerIndex === passengers.length - 1
                  ? "Continue to Extras"
                  : "Next Passenger"}
              </span>
            )}
          </button>
        </div>

        {/* Form-level errors */}
        {errors.root && <ErrorMessage message={errors.root.message} />}
      </form>
    </div>
  );
};

export default PassengerForm;
