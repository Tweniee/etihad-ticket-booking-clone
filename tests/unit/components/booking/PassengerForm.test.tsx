/**
 * Unit tests for PassengerForm component
 * Tests form rendering, validation, and submission
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PassengerForm } from "@/components/booking/PassengerForm";
import type { PassengerCount, PassengerInfo } from "@/lib/types";

describe("PassengerForm", () => {
  const mockOnSubmit = vi.fn();
  const travelDate = new Date("2024-12-01");

  const defaultPassengerCount: PassengerCount = {
    adults: 1,
    children: 0,
    infants: 0,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders passenger form with basic fields", () => {
      render(
        <PassengerForm
          passengerCount={defaultPassengerCount}
          isInternational={false}
          travelDate={travelDate}
          onSubmit={mockOnSubmit}
        />,
      );

      expect(screen.getByText("Passenger Information")).toBeInTheDocument();
      expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Date of Birth/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Gender/i)).toBeInTheDocument();
    });

    it("renders contact information fields for primary passenger", () => {
      render(
        <PassengerForm
          passengerCount={defaultPassengerCount}
          isInternational={false}
          travelDate={travelDate}
          onSubmit={mockOnSubmit}
        />,
      );

      expect(screen.getByText(/Primary Contact/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Phone Number/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Country Code/i)).toBeInTheDocument();
    });

    it("renders passport fields for international flights", () => {
      render(
        <PassengerForm
          passengerCount={defaultPassengerCount}
          isInternational={true}
          travelDate={travelDate}
          onSubmit={mockOnSubmit}
        />,
      );

      expect(screen.getByText("Passport Information")).toBeInTheDocument();
      expect(screen.getByLabelText(/Passport Number/i)).toBeInTheDocument();
      expect(
        screen.getByLabelText(/Passport Expiry Date/i),
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/Nationality/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Issuing Country/i)).toBeInTheDocument();
    });

    it("does not render passport fields for domestic flights", () => {
      render(
        <PassengerForm
          passengerCount={defaultPassengerCount}
          isInternational={false}
          travelDate={travelDate}
          onSubmit={mockOnSubmit}
        />,
      );

      expect(
        screen.queryByText("Passport Information"),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByLabelText(/Passport Number/i),
      ).not.toBeInTheDocument();
    });

    it("displays progress indicator", () => {
      render(
        <PassengerForm
          passengerCount={{ adults: 2, children: 1, infants: 0 }}
          isInternational={false}
          travelDate={travelDate}
          onSubmit={mockOnSubmit}
        />,
      );

      expect(screen.getByText("1 of 3")).toBeInTheDocument();
    });
  });

  describe("Validation - Basic Fields", () => {
    it("shows error for empty first name", async () => {
      const user = userEvent.setup();
      render(
        <PassengerForm
          passengerCount={defaultPassengerCount}
          isInternational={false}
          travelDate={travelDate}
          onSubmit={mockOnSubmit}
        />,
      );

      const submitButton = screen.getByRole("button", {
        name: /Continue to Extras/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/First name is required/i)).toBeInTheDocument();
      });
    });

    it("shows error for empty last name", async () => {
      const user = userEvent.setup();
      render(
        <PassengerForm
          passengerCount={defaultPassengerCount}
          isInternational={false}
          travelDate={travelDate}
          onSubmit={mockOnSubmit}
        />,
      );

      const submitButton = screen.getByRole("button", {
        name: /Continue to Extras/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Last name is required/i)).toBeInTheDocument();
      });
    });

    it("shows error for invalid first name with numbers", async () => {
      const user = userEvent.setup();
      render(
        <PassengerForm
          passengerCount={defaultPassengerCount}
          isInternational={false}
          travelDate={travelDate}
          onSubmit={mockOnSubmit}
        />,
      );

      const firstNameInput = screen.getByLabelText(/First Name/i);
      await user.type(firstNameInput, "John123");

      const submitButton = screen.getByRole("button", {
        name: /Continue to Extras/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/can only contain letters/i),
        ).toBeInTheDocument();
      });
    });
  });

  describe("Validation - Contact Information", () => {
    it("shows error for empty email", async () => {
      const user = userEvent.setup();
      render(
        <PassengerForm
          passengerCount={defaultPassengerCount}
          isInternational={false}
          travelDate={travelDate}
          onSubmit={mockOnSubmit}
        />,
      );

      const submitButton = screen.getByRole("button", {
        name: /Continue to Extras/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
      });
    });

    it("shows error for empty phone number", async () => {
      const user = userEvent.setup();
      render(
        <PassengerForm
          passengerCount={defaultPassengerCount}
          isInternational={false}
          travelDate={travelDate}
          onSubmit={mockOnSubmit}
        />,
      );

      const submitButton = screen.getByRole("button", {
        name: /Continue to Extras/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/Phone number is required/i),
        ).toBeInTheDocument();
      });
    });
  });

  describe("Validation - Passport Information", () => {
    it("shows error for empty passport number on international flights", async () => {
      const user = userEvent.setup();
      render(
        <PassengerForm
          passengerCount={defaultPassengerCount}
          isInternational={true}
          travelDate={travelDate}
          onSubmit={mockOnSubmit}
        />,
      );

      const submitButton = screen.getByRole("button", {
        name: /Continue to Extras/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/Passport number is required/i),
        ).toBeInTheDocument();
      });
    });

    it("shows error for invalid passport number format", async () => {
      const user = userEvent.setup();
      render(
        <PassengerForm
          passengerCount={defaultPassengerCount}
          isInternational={true}
          travelDate={travelDate}
          onSubmit={mockOnSubmit}
        />,
      );

      const passportInput = screen.getByLabelText(/Passport Number/i);
      await user.type(passportInput, "abc-123");

      const submitButton = screen.getByRole("button", {
        name: /Continue to Extras/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/must contain only uppercase letters and numbers/i),
        ).toBeInTheDocument();
      });
    });

    it("shows error for empty nationality", async () => {
      const user = userEvent.setup();
      render(
        <PassengerForm
          passengerCount={defaultPassengerCount}
          isInternational={true}
          travelDate={travelDate}
          onSubmit={mockOnSubmit}
        />,
      );

      const submitButton = screen.getByRole("button", {
        name: /Continue to Extras/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/Nationality is required/i),
        ).toBeInTheDocument();
      });
    });
  });

  describe("Multi-passenger Flow", () => {
    it("shows next passenger button for multiple passengers", () => {
      render(
        <PassengerForm
          passengerCount={{ adults: 2, children: 0, infants: 0 }}
          isInternational={false}
          travelDate={travelDate}
          onSubmit={mockOnSubmit}
        />,
      );

      expect(
        screen.getByRole("button", { name: /Next Passenger/i }),
      ).toBeInTheDocument();
    });

    it("shows continue to extras button for last passenger", () => {
      render(
        <PassengerForm
          passengerCount={defaultPassengerCount}
          isInternational={false}
          travelDate={travelDate}
          onSubmit={mockOnSubmit}
        />,
      );

      expect(
        screen.getByRole("button", { name: /Continue to Extras/i }),
      ).toBeInTheDocument();
    });

    it("disables back button on first passenger", () => {
      render(
        <PassengerForm
          passengerCount={{ adults: 2, children: 0, infants: 0 }}
          isInternational={false}
          travelDate={travelDate}
          onSubmit={mockOnSubmit}
        />,
      );

      const backButton = screen.getByRole("button", { name: /Back/i });
      expect(backButton).toBeDisabled();
    });
  });

  describe("Loading State", () => {
    it("disables submit button when loading", () => {
      render(
        <PassengerForm
          passengerCount={defaultPassengerCount}
          isInternational={false}
          travelDate={travelDate}
          onSubmit={mockOnSubmit}
          isLoading={true}
        />,
      );

      const submitButton = screen.getByRole("button", {
        name: /Processing/i,
      });
      expect(submitButton).toBeDisabled();
    });

    it("shows loading spinner when loading", () => {
      render(
        <PassengerForm
          passengerCount={defaultPassengerCount}
          isInternational={false}
          travelDate={travelDate}
          onSubmit={mockOnSubmit}
          isLoading={true}
        />,
      );

      expect(screen.getByText(/Processing/i)).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has proper labels for all inputs", () => {
      render(
        <PassengerForm
          passengerCount={defaultPassengerCount}
          isInternational={true}
          travelDate={travelDate}
          onSubmit={mockOnSubmit}
        />,
      );

      expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Date of Birth/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Gender/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Phone Number/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Passport Number/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Nationality/i)).toBeInTheDocument();
    });

    it("marks required fields with asterisk", () => {
      render(
        <PassengerForm
          passengerCount={defaultPassengerCount}
          isInternational={false}
          travelDate={travelDate}
          onSubmit={mockOnSubmit}
        />,
      );

      const requiredMarkers = screen.getAllByText("*");
      expect(requiredMarkers.length).toBeGreaterThan(0);
    });
  });
});
