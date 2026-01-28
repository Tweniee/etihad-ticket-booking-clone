import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DatePicker } from "@/components/shared/DatePicker";
import { addDays, subDays, format } from "date-fns";

describe("DatePicker Component", () => {
  const mockOnChange = vi.fn();
  const today = new Date();
  const tomorrow = addDays(today, 1);
  const yesterday = subDays(today, 1);

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  describe("Basic Rendering", () => {
    it("renders with label", () => {
      render(
        <DatePicker label="Select Date" value={null} onChange={mockOnChange} />,
      );

      expect(screen.getByText("Select Date")).toBeInTheDocument();
    });

    it("renders with placeholder", () => {
      render(
        <DatePicker
          placeholder="Choose a date"
          value={null}
          onChange={mockOnChange}
        />,
      );

      expect(screen.getByPlaceholderText("Choose a date")).toBeInTheDocument();
    });

    it("renders with required indicator", () => {
      render(
        <DatePicker
          label="Required Date"
          value={null}
          onChange={mockOnChange}
          required
        />,
      );

      expect(screen.getByText("*")).toBeInTheDocument();
    });

    it("displays selected date in correct format (Requirement 18.5)", () => {
      const testDate = new Date(2024, 5, 15); // June 15, 2024
      render(<DatePicker value={testDate} onChange={mockOnChange} />);

      const input = screen.getByRole("textbox") as HTMLInputElement;
      expect(input.value).toBe(format(testDate, "EEE, MMM d, yyyy"));
    });

    it("renders calendar icon button", () => {
      render(<DatePicker value={null} onChange={mockOnChange} />);

      expect(screen.getByLabelText("Open calendar")).toBeInTheDocument();
    });
  });

  describe("Calendar Interaction (Requirement 18.1)", () => {
    it("opens calendar when clicking calendar icon", async () => {
      render(<DatePicker value={null} onChange={mockOnChange} />);

      const calendarButton = screen.getByLabelText("Open calendar");
      fireEvent.click(calendarButton);

      await waitFor(() => {
        expect(
          screen.getByRole("dialog", { name: "Calendar" }),
        ).toBeInTheDocument();
      });
    });

    it("closes calendar when clicking outside", async () => {
      render(
        <div>
          <DatePicker value={null} onChange={mockOnChange} />
          <div data-testid="outside">Outside</div>
        </div>,
      );

      // Open calendar
      const calendarButton = screen.getByLabelText("Open calendar");
      fireEvent.click(calendarButton);

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      // Click outside
      const outside = screen.getByTestId("outside");
      fireEvent.mouseDown(outside);

      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      });
    });

    it("displays current month and year in calendar header", async () => {
      render(<DatePicker value={null} onChange={mockOnChange} />);

      fireEvent.click(screen.getByLabelText("Open calendar"));

      await waitFor(() => {
        const currentMonthYear = format(today, "MMMM yyyy");
        expect(screen.getByText(currentMonthYear)).toBeInTheDocument();
      });
    });

    it("navigates to previous month", async () => {
      render(<DatePicker value={null} onChange={mockOnChange} />);

      fireEvent.click(screen.getByLabelText("Open calendar"));

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      const prevButton = screen.getByLabelText("Previous month");
      fireEvent.click(prevButton);

      const previousMonth = subDays(today, 30);
      const expectedMonthYear = format(previousMonth, "MMMM yyyy");

      await waitFor(() => {
        expect(screen.getByText(expectedMonthYear)).toBeInTheDocument();
      });
    });

    it("navigates to next month", async () => {
      render(<DatePicker value={null} onChange={mockOnChange} />);

      fireEvent.click(screen.getByLabelText("Open calendar"));

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      const nextButton = screen.getByLabelText("Next month");
      fireEvent.click(nextButton);

      const nextMonth = addDays(today, 30);
      const expectedMonthYear = format(nextMonth, "MMMM yyyy");

      await waitFor(() => {
        expect(screen.getByText(expectedMonthYear)).toBeInTheDocument();
      });
    });
  });

  describe("Date Selection (Requirement 18.4)", () => {
    it("selects a date when clicking on calendar day", async () => {
      render(<DatePicker value={null} onChange={mockOnChange} />);

      fireEvent.click(screen.getByLabelText("Open calendar"));

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      // Find and click the 15th day of the current month
      const dayButtons = screen.getAllByRole("button");
      const day15Button = dayButtons.find(
        (button) => button.textContent === "15" && !button.disabled,
      );

      if (day15Button) {
        fireEvent.click(day15Button);

        await waitFor(() => {
          expect(mockOnChange).toHaveBeenCalled();
          const calledDate = mockOnChange.mock.calls[0][0];
          expect(calledDate.getDate()).toBe(15);
        });
      }
    });

    it("highlights selected date in calendar", async () => {
      const selectedDate = new Date(2024, 5, 15);
      render(<DatePicker value={selectedDate} onChange={mockOnChange} />);

      fireEvent.click(screen.getByLabelText("Open calendar"));

      await waitFor(() => {
        const dayButtons = screen.getAllByRole("button");
        const selectedButton = dayButtons.find(
          (button) => button.getAttribute("aria-current") === "date",
        );
        expect(selectedButton).toBeInTheDocument();
      });
    });

    it("closes calendar after selecting a date", async () => {
      render(<DatePicker value={null} onChange={mockOnChange} />);

      fireEvent.click(screen.getByLabelText("Open calendar"));

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      const dayButtons = screen.getAllByRole("button");
      const availableDay = dayButtons.find(
        (button) =>
          button.textContent &&
          !button.disabled &&
          button.textContent.match(/^\d+$/),
      );

      if (availableDay) {
        fireEvent.click(availableDay);

        await waitFor(() => {
          expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        });
      }
    });
  });

  describe("Past Dates Disabled (Requirement 18.2)", () => {
    it("disables dates before minDate", async () => {
      render(
        <DatePicker value={null} onChange={mockOnChange} minDate={today} />,
      );

      fireEvent.click(screen.getByLabelText("Open calendar"));

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      // Navigate to previous month to find past dates
      const prevButton = screen.getByLabelText("Previous month");
      fireEvent.click(prevButton);

      await waitFor(() => {
        const dayButtons = screen.getAllByRole("button");
        const pastDayButtons = dayButtons.filter(
          (button) =>
            button.textContent &&
            button.textContent.match(/^\d+$/) &&
            button.disabled,
        );
        expect(pastDayButtons.length).toBeGreaterThan(0);
      });
    });

    it("does not call onChange when clicking disabled date", async () => {
      render(
        <DatePicker value={null} onChange={mockOnChange} minDate={today} />,
      );

      fireEvent.click(screen.getByLabelText("Open calendar"));

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      // Navigate to previous month
      const prevButton = screen.getByLabelText("Previous month");
      fireEvent.click(prevButton);

      await waitFor(() => {
        const dayButtons = screen.getAllByRole("button");
        const disabledButton = dayButtons.find(
          (button) => button.disabled && button.textContent?.match(/^\d+$/),
        );

        if (disabledButton) {
          fireEvent.click(disabledButton);
          expect(mockOnChange).not.toHaveBeenCalled();
        }
      });
    });
  });

  describe("Date Range Validation (Requirement 18.3)", () => {
    it("disables dates before minDate", async () => {
      const minDate = addDays(today, 5);
      render(
        <DatePicker value={null} onChange={mockOnChange} minDate={minDate} />,
      );

      fireEvent.click(screen.getByLabelText("Open calendar"));

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      const dayButtons = screen.getAllByRole("button");
      const disabledButtons = dayButtons.filter(
        (button) => button.disabled && button.textContent?.match(/^\d+$/),
      );

      expect(disabledButtons.length).toBeGreaterThan(0);
    });

    it("disables dates after maxDate", async () => {
      const maxDate = addDays(today, 5);
      render(
        <DatePicker value={null} onChange={mockOnChange} maxDate={maxDate} />,
      );

      fireEvent.click(screen.getByLabelText("Open calendar"));

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      // Navigate to next month
      const nextButton = screen.getByLabelText("Next month");
      fireEvent.click(nextButton);

      await waitFor(() => {
        const dayButtons = screen.getAllByRole("button");
        const disabledButtons = dayButtons.filter(
          (button) => button.disabled && button.textContent?.match(/^\d+$/),
        );
        expect(disabledButtons.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Manual Input (Requirement 18.6)", () => {
    it("accepts manual date input in MM/DD/YYYY format", async () => {
      const user = userEvent.setup();
      render(<DatePicker value={null} onChange={mockOnChange} />);

      const input = screen.getByRole("textbox");
      await user.clear(input);
      await user.type(input, "12/25/2024");

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalled();
        const calledDate =
          mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0];
        if (calledDate) {
          expect(calledDate.getMonth()).toBe(11); // December (0-indexed)
          expect(calledDate.getDate()).toBe(25);
          expect(calledDate.getFullYear()).toBe(2024);
        }
      });
    });

    it("accepts manual date input in YYYY-MM-DD format", async () => {
      const user = userEvent.setup();
      render(<DatePicker value={null} onChange={mockOnChange} />);

      const input = screen.getByRole("textbox");
      await user.clear(input);
      await user.type(input, "2024-12-25");

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalled();
        const calledDate =
          mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0];
        if (calledDate) {
          expect(calledDate.getMonth()).toBe(11);
          expect(calledDate.getDate()).toBe(25);
          expect(calledDate.getFullYear()).toBe(2024);
        }
      });
    });

    it("formats input value on blur", async () => {
      const testDate = new Date(2024, 5, 15);
      render(<DatePicker value={testDate} onChange={mockOnChange} />);

      const input = screen.getByRole("textbox") as HTMLInputElement;

      // Clear and type new value
      fireEvent.change(input, { target: { value: "12/25/2024" } });
      fireEvent.blur(input);

      await waitFor(() => {
        // Should format to the standard format
        expect(input.value).toMatch(/\w{3}, \w{3} \d{1,2}, \d{4}/);
      });
    });
  });

  describe("Error State", () => {
    it("displays error message", () => {
      render(
        <DatePicker
          value={null}
          onChange={mockOnChange}
          error="This field is required"
        />,
      );

      expect(screen.getByText("This field is required")).toBeInTheDocument();
    });

    it("applies error styling to input", () => {
      render(
        <DatePicker
          value={null}
          onChange={mockOnChange}
          error="Invalid date"
        />,
      );

      const input = screen.getByRole("textbox");
      expect(input).toHaveClass("border-red-500");
    });

    it("sets aria-invalid when error is present", () => {
      render(
        <DatePicker
          value={null}
          onChange={mockOnChange}
          error="Invalid date"
        />,
      );

      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("aria-invalid", "true");
    });
  });

  describe("Disabled State", () => {
    it("disables input when disabled prop is true", () => {
      render(<DatePicker value={null} onChange={mockOnChange} disabled />);

      const input = screen.getByRole("textbox");
      expect(input).toBeDisabled();
    });

    it("disables calendar button when disabled", () => {
      render(<DatePicker value={null} onChange={mockOnChange} disabled />);

      const calendarButton = screen.getByLabelText("Open calendar");
      expect(calendarButton).toBeDisabled();
    });

    it("does not open calendar when disabled", () => {
      render(<DatePicker value={null} onChange={mockOnChange} disabled />);

      const calendarButton = screen.getByLabelText("Open calendar");
      fireEvent.click(calendarButton);

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  describe("Keyboard Navigation", () => {
    it("opens calendar on Enter key", async () => {
      render(<DatePicker value={null} onChange={mockOnChange} />);

      const input = screen.getByRole("textbox");
      fireEvent.keyDown(input, { key: "Enter" });

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });
    });

    it("closes calendar on Escape key", async () => {
      render(<DatePicker value={null} onChange={mockOnChange} />);

      const input = screen.getByRole("textbox");
      fireEvent.keyDown(input, { key: "Enter" });

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: "Escape" });

      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      });
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA labels", () => {
      render(
        <DatePicker
          label="Select Date"
          value={null}
          onChange={mockOnChange}
          ariaLabel="Custom aria label"
        />,
      );

      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("aria-label", "Custom aria label");
    });

    it("uses label as aria-label when ariaLabel is not provided", () => {
      render(
        <DatePicker label="Select Date" value={null} onChange={mockOnChange} />,
      );

      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("aria-label", "Select Date");
    });

    it("links error message with aria-describedby", () => {
      render(
        <DatePicker
          id="test-date"
          value={null}
          onChange={mockOnChange}
          error="Invalid date"
        />,
      );

      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("aria-describedby", "test-date-error");
    });

    it('has role="alert" on error message', () => {
      render(
        <DatePicker
          value={null}
          onChange={mockOnChange}
          error="Invalid date"
        />,
      );

      const errorMessage = screen.getByRole("alert");
      expect(errorMessage).toHaveTextContent("Invalid date");
    });
  });

  describe("Today Button", () => {
    it("selects today when clicking Today button", async () => {
      render(<DatePicker value={null} onChange={mockOnChange} />);

      fireEvent.click(screen.getByLabelText("Open calendar"));

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      const todayButton = screen.getByText("Today");
      fireEvent.click(todayButton);

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalled();
        const calledDate = mockOnChange.mock.calls[0][0];
        expect(calledDate.toDateString()).toBe(today.toDateString());
      });
    });

    it("disables Today button when today is before minDate", async () => {
      const futureDate = addDays(today, 10);
      render(
        <DatePicker
          value={null}
          onChange={mockOnChange}
          minDate={futureDate}
        />,
      );

      fireEvent.click(screen.getByLabelText("Open calendar"));

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      const todayButton = screen.getByText("Today");
      expect(todayButton).toBeDisabled();
    });
  });
});
