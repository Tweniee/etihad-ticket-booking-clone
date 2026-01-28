import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PriceDisplay } from "@/components/shared/PriceDisplay";
import type { PriceBreakdown, DetailedPriceBreakdown } from "@/lib/types";

describe("PriceDisplay Component", () => {
  const simpleBreakdown: PriceBreakdown = {
    baseFare: 450.0,
    taxes: 75.5,
    fees: 24.5,
  };

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

  describe("Basic Rendering", () => {
    it("renders the price amount correctly", () => {
      render(<PriceDisplay amount={550.0} currency="USD" />);

      const priceElement = screen.getByTestId("price-display-amount");
      expect(priceElement).toBeInTheDocument();
      expect(priceElement).toHaveTextContent("$550.00");
    });

    it("renders with different currencies", () => {
      const { rerender } = render(
        <PriceDisplay amount={495.0} currency="EUR" />,
      );
      expect(screen.getByTestId("price-display-amount")).toHaveTextContent(
        "€495.00",
      );

      rerender(<PriceDisplay amount={2020.0} currency="AED" />);
      expect(screen.getByTestId("price-display-amount")).toHaveTextContent(
        "AED 2,020.00",
      );

      rerender(<PriceDisplay amount={425.0} currency="GBP" />);
      expect(screen.getByTestId("price-display-amount")).toHaveTextContent(
        "£425.00",
      );
    });

    it("renders with a label", () => {
      render(
        <PriceDisplay amount={550.0} currency="USD" label="Total Price" />,
      );

      expect(screen.getByTestId("price-display-label")).toHaveTextContent(
        "Total Price",
      );
    });

    it("applies custom className", () => {
      const { container } = render(
        <PriceDisplay amount={550.0} currency="USD" className="custom-class" />,
      );

      const priceDisplay = container.querySelector(".custom-class");
      expect(priceDisplay).toBeInTheDocument();
    });

    it("uses custom testId", () => {
      render(
        <PriceDisplay amount={550.0} currency="USD" testId="custom-price" />,
      );

      expect(screen.getByTestId("custom-price")).toBeInTheDocument();
      expect(screen.getByTestId("custom-price-amount")).toBeInTheDocument();
    });
  });

  describe("Size Variants", () => {
    it("renders small size correctly", () => {
      render(<PriceDisplay amount={550.0} currency="USD" size="small" />);

      const priceElement = screen.getByTestId("price-display-amount");
      expect(priceElement).toHaveClass("text-sm");
    });

    it("renders medium size correctly (default)", () => {
      render(<PriceDisplay amount={550.0} currency="USD" size="medium" />);

      const priceElement = screen.getByTestId("price-display-amount");
      expect(priceElement).toHaveClass("text-lg");
    });

    it("renders large size correctly", () => {
      render(<PriceDisplay amount={550.0} currency="USD" size="large" />);

      const priceElement = screen.getByTestId("price-display-amount");
      expect(priceElement).toHaveClass("text-2xl");
      expect(priceElement).toHaveClass("font-bold");
    });
  });

  describe("Per-Passenger Pricing (Requirement 9.5)", () => {
    it("does not show per-passenger price for single passenger", () => {
      render(<PriceDisplay amount={550.0} currency="USD" passengerCount={1} />);

      expect(
        screen.queryByTestId("price-display-per-passenger"),
      ).not.toBeInTheDocument();
    });

    it("shows per-passenger price for multiple passengers", () => {
      render(
        <PriceDisplay amount={1100.0} currency="USD" passengerCount={2} />,
      );

      const perPassengerElement = screen.getByTestId(
        "price-display-per-passenger",
      );
      expect(perPassengerElement).toBeInTheDocument();
      expect(perPassengerElement).toHaveTextContent("$550.00 per person");
    });

    it("calculates per-passenger price correctly for family", () => {
      render(
        <PriceDisplay amount={2200.0} currency="USD" passengerCount={4} />,
      );

      const perPassengerElement = screen.getByTestId(
        "price-display-per-passenger",
      );
      expect(perPassengerElement).toHaveTextContent("$550.00 per person");
    });

    it("handles decimal per-passenger prices", () => {
      render(
        <PriceDisplay amount={1000.0} currency="USD" passengerCount={3} />,
      );

      const perPassengerElement = screen.getByTestId(
        "price-display-per-passenger",
      );
      expect(perPassengerElement).toHaveTextContent("$333.33 per person");
    });
  });

  describe("Price Breakdown (Requirements 9.1, 19.4)", () => {
    it("shows breakdown button when breakdown is provided", () => {
      render(
        <PriceDisplay
          amount={550.0}
          currency="USD"
          breakdown={simpleBreakdown}
        />,
      );

      expect(
        screen.getByTestId("price-display-breakdown-button"),
      ).toBeInTheDocument();
    });

    it("does not show breakdown button when showBreakdown is false", () => {
      render(
        <PriceDisplay
          amount={550.0}
          currency="USD"
          breakdown={simpleBreakdown}
          showBreakdown={false}
        />,
      );

      expect(
        screen.queryByTestId("price-display-breakdown-button"),
      ).not.toBeInTheDocument();
    });

    it("does not show breakdown button when no breakdown provided", () => {
      render(<PriceDisplay amount={550.0} currency="USD" />);

      expect(
        screen.queryByTestId("price-display-breakdown-button"),
      ).not.toBeInTheDocument();
    });

    it("shows tooltip when breakdown button is clicked", async () => {
      const user = userEvent.setup();
      render(
        <PriceDisplay
          amount={550.0}
          currency="USD"
          breakdown={simpleBreakdown}
        />,
      );

      const button = screen.getByTestId("price-display-breakdown-button");
      await user.click(button);

      await waitFor(() => {
        expect(
          screen.getByTestId("price-display-breakdown-tooltip"),
        ).toBeInTheDocument();
      });
    });

    it("displays simple breakdown items correctly", async () => {
      const user = userEvent.setup();
      render(
        <PriceDisplay
          amount={550.0}
          currency="USD"
          breakdown={simpleBreakdown}
        />,
      );

      const button = screen.getByTestId("price-display-breakdown-button");
      await user.click(button);

      await waitFor(() => {
        const tooltip = screen.getByTestId("price-display-breakdown-tooltip");
        expect(tooltip).toHaveTextContent("Base Fare");
        expect(tooltip).toHaveTextContent("$450.00");
        expect(tooltip).toHaveTextContent("Taxes");
        expect(tooltip).toHaveTextContent("$75.50");
        expect(tooltip).toHaveTextContent("Fees");
        expect(tooltip).toHaveTextContent("$24.50");
        expect(tooltip).toHaveTextContent("Total");
        expect(tooltip).toHaveTextContent("$550.00");
      });
    });

    it("displays detailed breakdown items correctly", async () => {
      const user = userEvent.setup();
      render(
        <PriceDisplay
          amount={710.0}
          currency="USD"
          breakdown={detailedBreakdown}
        />,
      );

      const button = screen.getByTestId("price-display-breakdown-button");
      await user.click(button);

      await waitFor(() => {
        const tooltip = screen.getByTestId("price-display-breakdown-tooltip");
        expect(tooltip).toHaveTextContent("Base Fare");
        expect(tooltip).toHaveTextContent("$450.00");
        expect(tooltip).toHaveTextContent("Seat Fees");
        expect(tooltip).toHaveTextContent("$50.00");
        expect(tooltip).toHaveTextContent("Extra Baggage");
        expect(tooltip).toHaveTextContent("$30.00");
        expect(tooltip).toHaveTextContent("Meals");
        expect(tooltip).toHaveTextContent("$15.00");
        expect(tooltip).toHaveTextContent("Insurance");
        expect(tooltip).toHaveTextContent("$25.00");
        expect(tooltip).toHaveTextContent("Lounge Access");
        expect(tooltip).toHaveTextContent("$40.00");
      });
    });

    it("hides tooltip when clicking outside", async () => {
      const user = userEvent.setup();
      render(
        <div>
          <PriceDisplay
            amount={550.0}
            currency="USD"
            breakdown={simpleBreakdown}
          />
          <div data-testid="outside">Outside</div>
        </div>,
      );

      const button = screen.getByTestId("price-display-breakdown-button");
      await user.click(button);

      await waitFor(() => {
        expect(
          screen.getByTestId("price-display-breakdown-tooltip"),
        ).toBeInTheDocument();
      });

      const outside = screen.getByTestId("outside");
      fireEvent.mouseDown(outside);

      await waitFor(() => {
        expect(
          screen.queryByTestId("price-display-breakdown-tooltip"),
        ).not.toBeInTheDocument();
      });
    });

    it("closes tooltip on Escape key", async () => {
      const user = userEvent.setup();
      render(
        <PriceDisplay
          amount={550.0}
          currency="USD"
          breakdown={simpleBreakdown}
        />,
      );

      const button = screen.getByTestId("price-display-breakdown-button");
      await user.click(button);

      await waitFor(() => {
        expect(
          screen.getByTestId("price-display-breakdown-tooltip"),
        ).toBeInTheDocument();
      });

      fireEvent.keyDown(button, { key: "Escape" });

      await waitFor(() => {
        expect(
          screen.queryByTestId("price-display-breakdown-tooltip"),
        ).not.toBeInTheDocument();
      });
    });

    it("does not show zero-value extras in detailed breakdown", async () => {
      const user = userEvent.setup();
      const breakdownWithZeros: DetailedPriceBreakdown = {
        baseFare: 450.0,
        taxes: 75.5,
        fees: 24.5,
        seatFees: 0,
        extraBaggage: 0,
        meals: 0,
        insurance: 0,
        loungeAccess: 0,
        total: 550.0,
      };

      render(
        <PriceDisplay
          amount={550.0}
          currency="USD"
          breakdown={breakdownWithZeros}
        />,
      );

      const button = screen.getByTestId("price-display-breakdown-button");
      await user.click(button);

      await waitFor(() => {
        const tooltip = screen.getByTestId("price-display-breakdown-tooltip");
        expect(tooltip).not.toHaveTextContent("Seat Fees");
        expect(tooltip).not.toHaveTextContent("Extra Baggage");
        expect(tooltip).not.toHaveTextContent("Meals");
        expect(tooltip).not.toHaveTextContent("Insurance");
        expect(tooltip).not.toHaveTextContent("Lounge Access");
      });
    });
  });

  describe("Highlight Animation (Requirement 19.5)", () => {
    it("applies highlight class when highlight prop is true", () => {
      render(<PriceDisplay amount={550.0} currency="USD" highlight={true} />);

      const priceElement = screen.getByTestId("price-display-amount");
      expect(priceElement).toHaveClass("text-green-600");
    });

    it("does not apply highlight class when highlight prop is false", () => {
      render(<PriceDisplay amount={550.0} currency="USD" highlight={false} />);

      const priceElement = screen.getByTestId("price-display-amount");
      expect(priceElement).not.toHaveClass("text-green-600");
    });

    it("removes highlight class after animation duration", async () => {
      vi.useFakeTimers();

      const { rerender } = render(
        <PriceDisplay amount={550.0} currency="USD" highlight={false} />,
      );

      rerender(<PriceDisplay amount={600.0} currency="USD" highlight={true} />);

      const priceElement = screen.getByTestId("price-display-amount");
      expect(priceElement).toHaveClass("text-green-600");

      // Advance timers and run pending timers
      await vi.advanceTimersByTimeAsync(1000);

      expect(priceElement).not.toHaveClass("text-green-600");

      vi.useRealTimers();
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA labels for price", () => {
      render(<PriceDisplay amount={550.0} currency="USD" />);

      const priceElement = screen.getByTestId("price-display-amount");
      expect(priceElement).toHaveAttribute(
        "aria-label",
        "Total price: $550.00",
      );
    });

    it("has proper ARIA labels for per-passenger price", () => {
      render(
        <PriceDisplay amount={1100.0} currency="USD" passengerCount={2} />,
      );

      const perPassengerElement = screen.getByTestId(
        "price-display-per-passenger",
      );
      expect(perPassengerElement).toHaveAttribute(
        "aria-label",
        "Price per passenger: $550.00",
      );
    });

    it("has proper ARIA attributes for breakdown button", () => {
      render(
        <PriceDisplay
          amount={550.0}
          currency="USD"
          breakdown={simpleBreakdown}
        />,
      );

      const button = screen.getByTestId("price-display-breakdown-button");
      expect(button).toHaveAttribute("aria-label", "Show price breakdown");
      expect(button).toHaveAttribute("aria-expanded", "false");
      expect(button).toHaveAttribute("aria-haspopup", "true");
    });

    it("updates aria-expanded when tooltip is shown", async () => {
      render(
        <PriceDisplay
          amount={550.0}
          currency="USD"
          breakdown={simpleBreakdown}
        />,
      );

      const button = screen.getByTestId("price-display-breakdown-button");
      expect(button).toHaveAttribute("aria-expanded", "false");

      fireEvent.click(button);

      expect(button).toHaveAttribute("aria-expanded", "true");
    });

    it("has role='tooltip' on breakdown tooltip", async () => {
      render(
        <PriceDisplay
          amount={550.0}
          currency="USD"
          breakdown={simpleBreakdown}
        />,
      );

      const button = screen.getByTestId("price-display-breakdown-button");
      fireEvent.click(button);

      const tooltip = screen.getByTestId("price-display-breakdown-tooltip");
      expect(tooltip).toHaveAttribute("role", "tooltip");
    });

    it("is keyboard navigable", async () => {
      render(
        <PriceDisplay
          amount={550.0}
          currency="USD"
          breakdown={simpleBreakdown}
        />,
      );

      const button = screen.getByTestId("price-display-breakdown-button");

      // Focus the button
      button.focus();
      expect(button).toHaveFocus();

      // Press Enter to open tooltip
      fireEvent.keyDown(button, { key: "Enter" });
      fireEvent.click(button); // Simulate the click that happens on Enter

      expect(
        screen.getByTestId("price-display-breakdown-tooltip"),
      ).toBeInTheDocument();
    });
  });

  describe("Currency Formatting (Requirement 9.4)", () => {
    it("formats USD correctly", () => {
      render(<PriceDisplay amount={1234.56} currency="USD" />);

      expect(screen.getByTestId("price-display-amount")).toHaveTextContent(
        "$1,234.56",
      );
    });

    it("formats EUR correctly", () => {
      render(<PriceDisplay amount={1234.56} currency="EUR" />);

      expect(screen.getByTestId("price-display-amount")).toHaveTextContent(
        "€1,234.56",
      );
    });

    it("formats GBP correctly", () => {
      render(<PriceDisplay amount={1234.56} currency="GBP" />);

      expect(screen.getByTestId("price-display-amount")).toHaveTextContent(
        "£1,234.56",
      );
    });

    it("handles invalid currency code gracefully", () => {
      render(<PriceDisplay amount={1234.56} currency="INVALID" />);

      const priceElement = screen.getByTestId("price-display-amount");
      expect(priceElement).toHaveTextContent("INVALID");
      expect(priceElement).toHaveTextContent("1234.56");
    });

    it("always shows two decimal places", () => {
      render(<PriceDisplay amount={100} currency="USD" />);

      expect(screen.getByTestId("price-display-amount")).toHaveTextContent(
        "$100.00",
      );
    });
  });

  describe("Edge Cases", () => {
    it("handles zero amount", () => {
      render(<PriceDisplay amount={0} currency="USD" />);

      expect(screen.getByTestId("price-display-amount")).toHaveTextContent(
        "$0.00",
      );
    });

    it("handles very large amounts", () => {
      render(<PriceDisplay amount={999999.99} currency="USD" />);

      expect(screen.getByTestId("price-display-amount")).toHaveTextContent(
        "$999,999.99",
      );
    });

    it("handles negative amounts", () => {
      render(<PriceDisplay amount={-50.0} currency="USD" />);

      expect(screen.getByTestId("price-display-amount")).toHaveTextContent(
        "-$50.00",
      );
    });

    it("handles very small decimal amounts", () => {
      render(<PriceDisplay amount={0.01} currency="USD" />);

      expect(screen.getByTestId("price-display-amount")).toHaveTextContent(
        "$0.01",
      );
    });
  });
});
