/**
 * Unit tests for passenger validation schemas
 * Tests: Requirements 7.2, 7.3, 7.4, 7.5, 7.6
 */

import { describe, it, expect } from "vitest";
import { addMonths, subYears } from "date-fns";
import {
  contactInfoSchema,
  passportInfoSchema,
  createPassportSchemaWithTravelDate,
  basePassengerInfoSchema,
  domesticPassengerSchema,
  internationalPassengerSchema,
  createInternationalPassengerSchema,
  primaryDomesticPassengerSchema,
  primaryInternationalPassengerSchema,
  createPrimaryInternationalPassengerSchema,
  domesticPassengerListSchema,
  internationalPassengerListSchema,
  createInternationalPassengerListSchema,
  validatePassengerAge,
  validateContactInfo,
  validatePassportInfo,
  validatePassengerInfo,
  validatePassengerList,
} from "@/lib/validation/passenger";

describe("Contact Information Validation", () => {
  describe("contactInfoSchema", () => {
    it("should accept valid contact information", () => {
      const validContact = {
        email: "john.doe@example.com",
        phone: "1234567890",
        countryCode: "+1",
      };

      const result = contactInfoSchema.safeParse(validContact);
      expect(result.success).toBe(true);
    });

    it("should reject invalid email format", () => {
      const invalidContact = {
        email: "invalid-email",
        phone: "1234567890",
        countryCode: "+1",
      };

      const result = contactInfoSchema.safeParse(invalidContact);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("valid email");
      }
    });

    it("should reject phone number with invalid format", () => {
      const invalidContact = {
        email: "john@example.com",
        phone: "123", // Too short
        countryCode: "+1",
      };

      const result = contactInfoSchema.safeParse(invalidContact);
      expect(result.success).toBe(false);
    });

    it("should reject invalid country code format", () => {
      const invalidContact = {
        email: "john@example.com",
        phone: "1234567890",
        countryCode: "1", // Missing +
      };

      const result = contactInfoSchema.safeParse(invalidContact);
      expect(result.success).toBe(false);
    });

    it("should trim and lowercase email", () => {
      const contact = {
        email: "  JOHN.DOE@EXAMPLE.COM  ",
        phone: "1234567890",
        countryCode: "+1",
      };

      const result = contactInfoSchema.safeParse(contact);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe("john.doe@example.com");
      }
    });
  });
});

describe("Passport Information Validation", () => {
  describe("passportInfoSchema", () => {
    it("should accept valid passport information", () => {
      const validPassport = {
        number: "AB1234567",
        expiryDate: addMonths(new Date(), 12),
        nationality: "United States",
        issuingCountry: "United States",
      };

      const result = passportInfoSchema.safeParse(validPassport);
      expect(result.success).toBe(true);
    });

    it("should reject passport number that is too short", () => {
      const invalidPassport = {
        number: "AB123", // Too short
        expiryDate: addMonths(new Date(), 12),
        nationality: "United States",
        issuingCountry: "United States",
      };

      const result = passportInfoSchema.safeParse(invalidPassport);
      expect(result.success).toBe(false);
    });

    it("should reject passport number with invalid characters", () => {
      const invalidPassport = {
        number: "ab-1234567", // Lowercase and special char
        expiryDate: addMonths(new Date(), 12),
        nationality: "United States",
        issuingCountry: "United States",
      };

      const result = passportInfoSchema.safeParse(invalidPassport);
      expect(result.success).toBe(false);
    });
  });

  describe("createPassportSchemaWithTravelDate", () => {
    it("should accept passport valid for 6+ months after travel", () => {
      const travelDate = new Date("2024-06-01");
      const validPassport = {
        number: "AB1234567",
        expiryDate: new Date("2024-12-15"), // 6+ months after travel
        nationality: "United States",
        issuingCountry: "United States",
      };

      const schema = createPassportSchemaWithTravelDate(travelDate);
      const result = schema.safeParse(validPassport);
      expect(result.success).toBe(true);
    });

    it("should reject passport expiring within 6 months of travel", () => {
      const travelDate = new Date("2024-06-01");
      const invalidPassport = {
        number: "AB1234567",
        expiryDate: new Date("2024-09-01"), // Less than 6 months after travel
        nationality: "United States",
        issuingCountry: "United States",
      };

      const schema = createPassportSchemaWithTravelDate(travelDate);
      const result = schema.safeParse(invalidPassport);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("6 months");
      }
    });
  });
});

describe("Passenger Information Validation", () => {
  describe("basePassengerInfoSchema", () => {
    it("should accept valid passenger information", () => {
      const validPassenger = {
        id: "passenger-1",
        type: "adult" as const,
        firstName: "John",
        lastName: "Doe",
        dateOfBirth: subYears(new Date(), 30),
        gender: "male" as const,
      };

      const result = basePassengerInfoSchema.safeParse(validPassenger);
      expect(result.success).toBe(true);
    });

    it("should reject first name with invalid characters", () => {
      const invalidPassenger = {
        id: "passenger-1",
        type: "adult" as const,
        firstName: "John123", // Numbers not allowed
        lastName: "Doe",
        dateOfBirth: subYears(new Date(), 30),
        gender: "male" as const,
      };

      const result = basePassengerInfoSchema.safeParse(invalidPassenger);
      expect(result.success).toBe(false);
    });

    it("should reject date of birth in the future", () => {
      const invalidPassenger = {
        id: "passenger-1",
        type: "adult" as const,
        firstName: "John",
        lastName: "Doe",
        dateOfBirth: addMonths(new Date(), 1), // Future date
        gender: "male" as const,
      };

      const result = basePassengerInfoSchema.safeParse(invalidPassenger);
      expect(result.success).toBe(false);
    });

    it("should accept names with hyphens and apostrophes", () => {
      const validPassenger = {
        id: "passenger-1",
        type: "adult" as const,
        firstName: "Mary-Jane",
        lastName: "O'Brien",
        dateOfBirth: subYears(new Date(), 30),
        gender: "female" as const,
      };

      const result = basePassengerInfoSchema.safeParse(validPassenger);
      expect(result.success).toBe(true);
    });
  });

  describe("domesticPassengerSchema", () => {
    it("should accept passenger without passport", () => {
      const validPassenger = {
        id: "passenger-1",
        type: "adult" as const,
        firstName: "John",
        lastName: "Doe",
        dateOfBirth: subYears(new Date(), 30),
        gender: "male" as const,
      };

      const result = domesticPassengerSchema.safeParse(validPassenger);
      expect(result.success).toBe(true);
    });
  });

  describe("internationalPassengerSchema", () => {
    it("should require passport for international passenger", () => {
      const passengerWithoutPassport = {
        id: "passenger-1",
        type: "adult" as const,
        firstName: "John",
        lastName: "Doe",
        dateOfBirth: subYears(new Date(), 30),
        gender: "male" as const,
      };

      const result = internationalPassengerSchema.safeParse(
        passengerWithoutPassport,
      );
      expect(result.success).toBe(false);
    });

    it("should accept passenger with valid passport", () => {
      const validPassenger = {
        id: "passenger-1",
        type: "adult" as const,
        firstName: "John",
        lastName: "Doe",
        dateOfBirth: subYears(new Date(), 30),
        gender: "male" as const,
        passport: {
          number: "AB1234567",
          expiryDate: addMonths(new Date(), 12),
          nationality: "United States",
          issuingCountry: "United States",
        },
      };

      const result = internationalPassengerSchema.safeParse(validPassenger);
      expect(result.success).toBe(true);
    });
  });

  describe("primaryDomesticPassengerSchema", () => {
    it("should require contact information for primary passenger", () => {
      const passengerWithoutContact = {
        id: "passenger-1",
        type: "adult" as const,
        firstName: "John",
        lastName: "Doe",
        dateOfBirth: subYears(new Date(), 30),
        gender: "male" as const,
      };

      const result = primaryDomesticPassengerSchema.safeParse(
        passengerWithoutContact,
      );
      expect(result.success).toBe(false);
    });

    it("should accept primary passenger with contact information", () => {
      const validPassenger = {
        id: "passenger-1",
        type: "adult" as const,
        firstName: "John",
        lastName: "Doe",
        dateOfBirth: subYears(new Date(), 30),
        gender: "male" as const,
        contact: {
          email: "john@example.com",
          phone: "1234567890",
          countryCode: "+1",
        },
      };

      const result = primaryDomesticPassengerSchema.safeParse(validPassenger);
      expect(result.success).toBe(true);
    });
  });

  describe("primaryInternationalPassengerSchema", () => {
    it("should require both passport and contact for primary international passenger", () => {
      const passengerWithoutBoth = {
        id: "passenger-1",
        type: "adult" as const,
        firstName: "John",
        lastName: "Doe",
        dateOfBirth: subYears(new Date(), 30),
        gender: "male" as const,
      };

      const result =
        primaryInternationalPassengerSchema.safeParse(passengerWithoutBoth);
      expect(result.success).toBe(false);
    });

    it("should accept primary passenger with both passport and contact", () => {
      const validPassenger = {
        id: "passenger-1",
        type: "adult" as const,
        firstName: "John",
        lastName: "Doe",
        dateOfBirth: subYears(new Date(), 30),
        gender: "male" as const,
        passport: {
          number: "AB1234567",
          expiryDate: addMonths(new Date(), 12),
          nationality: "United States",
          issuingCountry: "United States",
        },
        contact: {
          email: "john@example.com",
          phone: "1234567890",
          countryCode: "+1",
        },
      };

      const result =
        primaryInternationalPassengerSchema.safeParse(validPassenger);
      expect(result.success).toBe(true);
    });
  });
});

describe("Passenger List Validation", () => {
  describe("domesticPassengerListSchema", () => {
    it("should require first passenger to have contact information", () => {
      const passengers = [
        {
          id: "passenger-1",
          type: "adult" as const,
          firstName: "John",
          lastName: "Doe",
          dateOfBirth: subYears(new Date(), 30),
          gender: "male" as const,
          // Missing contact
        },
      ];

      const result = domesticPassengerListSchema.safeParse(passengers);
      expect(result.success).toBe(false);
    });

    it("should accept list with primary passenger having contact", () => {
      const passengers = [
        {
          id: "passenger-1",
          type: "adult" as const,
          firstName: "John",
          lastName: "Doe",
          dateOfBirth: subYears(new Date(), 30),
          gender: "male" as const,
          contact: {
            email: "john@example.com",
            phone: "1234567890",
            countryCode: "+1",
          },
        },
        {
          id: "passenger-2",
          type: "child" as const,
          firstName: "Jane",
          lastName: "Doe",
          dateOfBirth: subYears(new Date(), 8),
          gender: "female" as const,
        },
      ];

      const result = domesticPassengerListSchema.safeParse(passengers);
      expect(result.success).toBe(true);
    });
  });

  describe("internationalPassengerListSchema", () => {
    it("should require all passengers to have passport", () => {
      const passengers = [
        {
          id: "passenger-1",
          type: "adult" as const,
          firstName: "John",
          lastName: "Doe",
          dateOfBirth: subYears(new Date(), 30),
          gender: "male" as const,
          passport: {
            number: "AB1234567",
            expiryDate: addMonths(new Date(), 12),
            nationality: "United States",
            issuingCountry: "United States",
          },
          contact: {
            email: "john@example.com",
            phone: "1234567890",
            countryCode: "+1",
          },
        },
        {
          id: "passenger-2",
          type: "child" as const,
          firstName: "Jane",
          lastName: "Doe",
          dateOfBirth: subYears(new Date(), 8),
          gender: "female" as const,
          // Missing passport
        },
      ];

      const result = internationalPassengerListSchema.safeParse(passengers);
      expect(result.success).toBe(false);
    });

    it("should accept list with all passengers having passport and primary having contact", () => {
      const passengers = [
        {
          id: "passenger-1",
          type: "adult" as const,
          firstName: "John",
          lastName: "Doe",
          dateOfBirth: subYears(new Date(), 30),
          gender: "male" as const,
          passport: {
            number: "AB1234567",
            expiryDate: addMonths(new Date(), 12),
            nationality: "United States",
            issuingCountry: "United States",
          },
          contact: {
            email: "john@example.com",
            phone: "1234567890",
            countryCode: "+1",
          },
        },
        {
          id: "passenger-2",
          type: "child" as const,
          firstName: "Jane",
          lastName: "Doe",
          dateOfBirth: subYears(new Date(), 8),
          gender: "female" as const,
          passport: {
            number: "CD7890123",
            expiryDate: addMonths(new Date(), 12),
            nationality: "United States",
            issuingCountry: "United States",
          },
        },
      ];

      const result = internationalPassengerListSchema.safeParse(passengers);
      expect(result.success).toBe(true);
    });
  });
});

describe("Age Validation", () => {
  describe("validatePassengerAge", () => {
    it("should validate adult age correctly", () => {
      const travelDate = new Date("2024-06-01");
      const adultBirthDate = new Date("2000-01-01"); // 24 years old

      const result = validatePassengerAge(adultBirthDate, "adult", travelDate);
      expect(result).toBe(true);
    });

    it("should reject adult under 12 years", () => {
      const travelDate = new Date("2024-06-01");
      const childBirthDate = new Date("2015-01-01"); // 9 years old

      const result = validatePassengerAge(childBirthDate, "adult", travelDate);
      expect(result).toBe(false);
    });

    it("should validate child age correctly", () => {
      const travelDate = new Date("2024-06-01");
      const childBirthDate = new Date("2015-01-01"); // 9 years old

      const result = validatePassengerAge(childBirthDate, "child", travelDate);
      expect(result).toBe(true);
    });

    it("should validate infant age correctly", () => {
      const travelDate = new Date("2024-06-01");
      const infantBirthDate = new Date("2023-01-01"); // 1 year old

      const result = validatePassengerAge(
        infantBirthDate,
        "infant",
        travelDate,
      );
      expect(result).toBe(true);
    });

    it("should reject infant over 2 years", () => {
      const travelDate = new Date("2024-06-01");
      const childBirthDate = new Date("2020-01-01"); // 4 years old

      const result = validatePassengerAge(childBirthDate, "infant", travelDate);
      expect(result).toBe(false);
    });
  });
});

describe("Helper Functions", () => {
  describe("validateContactInfo", () => {
    it("should validate contact info using helper function", () => {
      const validContact = {
        email: "john@example.com",
        phone: "1234567890",
        countryCode: "+1",
      };

      const result = validateContactInfo(validContact);
      expect(result.success).toBe(true);
    });
  });

  describe("validatePassportInfo", () => {
    it("should validate passport without travel date", () => {
      const validPassport = {
        number: "AB1234567",
        expiryDate: addMonths(new Date(), 12),
        nationality: "United States",
        issuingCountry: "United States",
      };

      const result = validatePassportInfo(validPassport);
      expect(result.success).toBe(true);
    });

    it("should validate passport with travel date", () => {
      const travelDate = new Date("2024-06-01");
      const validPassport = {
        number: "AB1234567",
        expiryDate: new Date("2024-12-15"),
        nationality: "United States",
        issuingCountry: "United States",
      };

      const result = validatePassportInfo(validPassport, travelDate);
      expect(result.success).toBe(true);
    });
  });

  describe("validatePassengerInfo", () => {
    it("should validate domestic primary passenger", () => {
      const validPassenger = {
        id: "passenger-1",
        type: "adult" as const,
        firstName: "John",
        lastName: "Doe",
        dateOfBirth: subYears(new Date(), 30),
        gender: "male" as const,
        contact: {
          email: "john@example.com",
          phone: "1234567890",
          countryCode: "+1",
        },
      };

      const result = validatePassengerInfo(validPassenger, false, true);
      expect(result.success).toBe(true);
    });

    it("should validate international primary passenger", () => {
      const validPassenger = {
        id: "passenger-1",
        type: "adult" as const,
        firstName: "John",
        lastName: "Doe",
        dateOfBirth: subYears(new Date(), 30),
        gender: "male" as const,
        passport: {
          number: "AB1234567",
          expiryDate: addMonths(new Date(), 12),
          nationality: "United States",
          issuingCountry: "United States",
        },
        contact: {
          email: "john@example.com",
          phone: "1234567890",
          countryCode: "+1",
        },
      };

      const result = validatePassengerInfo(validPassenger, true, true);
      expect(result.success).toBe(true);
    });
  });

  describe("validatePassengerList", () => {
    it("should validate domestic passenger list", () => {
      const passengers = [
        {
          id: "passenger-1",
          type: "adult" as const,
          firstName: "John",
          lastName: "Doe",
          dateOfBirth: subYears(new Date(), 30),
          gender: "male" as const,
          contact: {
            email: "john@example.com",
            phone: "1234567890",
            countryCode: "+1",
          },
        },
      ];

      const result = validatePassengerList(passengers, false);
      expect(result.success).toBe(true);
    });

    it("should validate international passenger list", () => {
      const passengers = [
        {
          id: "passenger-1",
          type: "adult" as const,
          firstName: "John",
          lastName: "Doe",
          dateOfBirth: subYears(new Date(), 30),
          gender: "male" as const,
          passport: {
            number: "AB1234567",
            expiryDate: addMonths(new Date(), 12),
            nationality: "United States",
            issuingCountry: "United States",
          },
          contact: {
            email: "john@example.com",
            phone: "1234567890",
            countryCode: "+1",
          },
        },
      ];

      const result = validatePassengerList(passengers, true);
      expect(result.success).toBe(true);
    });
  });
});
