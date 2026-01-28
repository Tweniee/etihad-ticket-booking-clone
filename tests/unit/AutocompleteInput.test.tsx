import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AutocompleteInput } from "@/components/shared/AutocompleteInput";
import { Airport } from "@/lib/types";

describe("AutocompleteInput", () => {
  const mockAirports: Airport[] = [
    {
      code: "JFK",
      name: "John F. Kennedy International Airport",
      city: "New York",
      country: "United States",
    },
    {
      code: "LHR",
      name: "London Heathrow Airport",
      city: "London",
      country: "United Kingdom",
    },
    {
      code: "DXB",
      name: "Dubai International Airport",
      city: "Dubai",
      country: "United Arab Emirates",
    },
  ];

  const mockOnChange = vi.fn();
  const mockOnSearch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with placeholder", () => {
    render(
      <AutocompleteInput
        value={null}
        onChange={mockOnChange}
        onSearch={mockOnSearch}
        placeholder="Search airports..."
      />,
    );

    expect(
      screen.getByPlaceholderText("Search airports..."),
    ).toBeInTheDocument();
  });

  it("renders with label", () => {
    render(
      <AutocompleteInput
        value={null}
        onChange={mockOnChange}
        onSearch={mockOnSearch}
        label="Origin Airport"
      />,
    );

    expect(screen.getByLabelText("Origin Airport")).toBeInTheDocument();
  });

  it("displays required indicator when required", () => {
    render(
      <AutocompleteInput
        value={null}
        onChange={mockOnChange}
        onSearch={mockOnSearch}
        label="Origin Airport"
        required
      />,
    );

    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("displays error message when error prop is provided", () => {
    render(
      <AutocompleteInput
        value={null}
        onChange={mockOnChange}
        onSearch={mockOnSearch}
        error="This field is required"
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "This field is required",
    );
  });

  it("displays selected airport value", () => {
    render(
      <AutocompleteInput
        value={mockAirports[0]}
        onChange={mockOnChange}
        onSearch={mockOnSearch}
      />,
    );

    expect(
      screen.getByDisplayValue(
        "New York - John F. Kennedy International Airport (JFK)",
      ),
    ).toBeInTheDocument();
  });

  it("debounces search after typing", async () => {
    mockOnSearch.mockResolvedValue(mockAirports);

    render(
      <AutocompleteInput
        value={null}
        onChange={mockOnChange}
        onSearch={mockOnSearch}
        debounceMs={100}
        minChars={2}
      />,
    );

    const input = screen.getByRole("textbox");
    await userEvent.type(input, "New");

    // Wait for debounce to complete
    await waitFor(
      () => {
        expect(mockOnSearch).toHaveBeenCalledWith("New");
      },
      { timeout: 500 },
    );

    expect(mockOnSearch).toHaveBeenCalledTimes(1);
  });

  it("does not search when input is less than minChars", async () => {
    mockOnSearch.mockResolvedValue(mockAirports);

    render(
      <AutocompleteInput
        value={null}
        onChange={mockOnChange}
        onSearch={mockOnSearch}
        debounceMs={100}
        minChars={2}
      />,
    );

    const input = screen.getByRole("textbox");
    await userEvent.type(input, "N");

    // Wait a bit to ensure no search is triggered
    await new Promise((resolve) => setTimeout(resolve, 200));

    expect(mockOnSearch).not.toHaveBeenCalled();
  });

  it("displays loading indicator during search", async () => {
    let resolveSearch: (value: Airport[]) => void;
    const searchPromise = new Promise<Airport[]>((resolve) => {
      resolveSearch = resolve;
    });
    mockOnSearch.mockReturnValue(searchPromise);

    render(
      <AutocompleteInput
        value={null}
        onChange={mockOnChange}
        onSearch={mockOnSearch}
        debounceMs={100}
        minChars={2}
      />,
    );

    const input = screen.getByRole("textbox");
    await userEvent.type(input, "New");

    // Wait for loading indicator
    await waitFor(
      () => {
        expect(screen.getByLabelText("Loading")).toBeInTheDocument();
      },
      { timeout: 500 },
    );

    // Resolve the search
    resolveSearch!(mockAirports);
  });

  it("displays suggestions after search", async () => {
    mockOnSearch.mockResolvedValue(mockAirports);

    render(
      <AutocompleteInput
        value={null}
        onChange={mockOnChange}
        onSearch={mockOnSearch}
        debounceMs={100}
        minChars={2}
      />,
    );

    const input = screen.getByRole("textbox");
    await userEvent.type(input, "New");

    await waitFor(
      () => {
        expect(screen.getByText("New York (JFK)")).toBeInTheDocument();
        expect(
          screen.getByText(
            "John F. Kennedy International Airport, United States",
          ),
        ).toBeInTheDocument();
      },
      { timeout: 500 },
    );
  });

  it("displays no results message when search returns empty array", async () => {
    mockOnSearch.mockResolvedValue([]);

    render(
      <AutocompleteInput
        value={null}
        onChange={mockOnChange}
        onSearch={mockOnSearch}
        debounceMs={100}
        minChars={2}
      />,
    );

    const input = screen.getByRole("textbox");
    await userEvent.type(input, "XYZ");

    await waitFor(
      () => {
        expect(screen.getByText("No airports found")).toBeInTheDocument();
      },
      { timeout: 500 },
    );
  });

  it("calls onChange when suggestion is clicked", async () => {
    mockOnSearch.mockResolvedValue(mockAirports);

    render(
      <AutocompleteInput
        value={null}
        onChange={mockOnChange}
        onSearch={mockOnSearch}
        debounceMs={100}
        minChars={2}
      />,
    );

    const input = screen.getByRole("textbox");
    await userEvent.type(input, "New");

    await waitFor(
      () => {
        expect(screen.getByText("New York (JFK)")).toBeInTheDocument();
      },
      { timeout: 500 },
    );

    const suggestion = screen.getByText("New York (JFK)");
    await userEvent.click(suggestion);

    expect(mockOnChange).toHaveBeenCalledWith(mockAirports[0]);
  });

  it("closes dropdown after selection", async () => {
    mockOnSearch.mockResolvedValue(mockAirports);

    render(
      <AutocompleteInput
        value={null}
        onChange={mockOnChange}
        onSearch={mockOnSearch}
        debounceMs={100}
        minChars={2}
      />,
    );

    const input = screen.getByRole("textbox");
    await userEvent.type(input, "New");

    await waitFor(
      () => {
        expect(screen.getByText("New York (JFK)")).toBeInTheDocument();
      },
      { timeout: 500 },
    );

    const suggestion = screen.getByText("New York (JFK)");
    await userEvent.click(suggestion);

    await waitFor(() => {
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });
  });

  it("clears input when clear button is clicked", async () => {
    render(
      <AutocompleteInput
        value={mockAirports[0]}
        onChange={mockOnChange}
        onSearch={mockOnSearch}
      />,
    );

    const clearButton = screen.getByLabelText("Clear input");
    await userEvent.click(clearButton);

    expect(mockOnChange).toHaveBeenCalledWith(null);
  });

  it("supports keyboard navigation with ArrowDown", async () => {
    mockOnSearch.mockResolvedValue(mockAirports);

    render(
      <AutocompleteInput
        value={null}
        onChange={mockOnChange}
        onSearch={mockOnSearch}
        debounceMs={100}
        minChars={2}
      />,
    );

    const input = screen.getByRole("textbox");
    await userEvent.type(input, "New");

    await waitFor(
      () => {
        expect(screen.getByText("New York (JFK)")).toBeInTheDocument();
      },
      { timeout: 500 },
    );

    // Press ArrowDown to highlight first item
    fireEvent.keyDown(input, { key: "ArrowDown" });

    const firstOption = screen.getByRole("option", { name: /New York/i });
    expect(firstOption).toHaveClass("bg-blue-600");
  });

  it("supports keyboard navigation with ArrowUp", async () => {
    mockOnSearch.mockResolvedValue(mockAirports);

    render(
      <AutocompleteInput
        value={null}
        onChange={mockOnChange}
        onSearch={mockOnSearch}
        debounceMs={100}
        minChars={2}
      />,
    );

    const input = screen.getByRole("textbox");
    await userEvent.type(input, "New");

    await waitFor(
      () => {
        expect(screen.getByText("New York (JFK)")).toBeInTheDocument();
      },
      { timeout: 500 },
    );

    // Press ArrowDown twice to highlight second item
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "ArrowDown" });

    // Press ArrowUp to go back to first item
    fireEvent.keyDown(input, { key: "ArrowUp" });

    const firstOption = screen.getByRole("option", { name: /New York/i });
    expect(firstOption).toHaveClass("bg-blue-600");
  });

  it("selects highlighted item on Enter key", async () => {
    mockOnSearch.mockResolvedValue(mockAirports);

    render(
      <AutocompleteInput
        value={null}
        onChange={mockOnChange}
        onSearch={mockOnSearch}
        debounceMs={100}
        minChars={2}
      />,
    );

    const input = screen.getByRole("textbox");
    await userEvent.type(input, "New");

    await waitFor(
      () => {
        expect(screen.getByText("New York (JFK)")).toBeInTheDocument();
      },
      { timeout: 500 },
    );

    // Press ArrowDown to highlight first item
    fireEvent.keyDown(input, { key: "ArrowDown" });

    // Press Enter to select
    fireEvent.keyDown(input, { key: "Enter" });

    expect(mockOnChange).toHaveBeenCalledWith(mockAirports[0]);
  });

  it("closes dropdown on Escape key", async () => {
    mockOnSearch.mockResolvedValue(mockAirports);

    render(
      <AutocompleteInput
        value={null}
        onChange={mockOnChange}
        onSearch={mockOnSearch}
        debounceMs={100}
        minChars={2}
      />,
    );

    const input = screen.getByRole("textbox");
    await userEvent.type(input, "New");

    await waitFor(
      () => {
        expect(screen.getByText("New York (JFK)")).toBeInTheDocument();
      },
      { timeout: 500 },
    );

    fireEvent.keyDown(input, { key: "Escape" });

    await waitFor(() => {
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });
  });

  it("is disabled when disabled prop is true", () => {
    render(
      <AutocompleteInput
        value={null}
        onChange={mockOnChange}
        onSearch={mockOnSearch}
        disabled
      />,
    );

    const input = screen.getByRole("textbox");
    expect(input).toBeDisabled();
  });

  it("has proper ARIA attributes", () => {
    render(
      <AutocompleteInput
        value={null}
        onChange={mockOnChange}
        onSearch={mockOnSearch}
        label="Origin Airport"
        required
      />,
    );

    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("aria-required", "true");
    expect(input).toHaveAttribute("aria-autocomplete", "list");
    expect(input).toHaveAttribute("aria-expanded", "false");
  });

  it("updates ARIA attributes when dropdown is open", async () => {
    mockOnSearch.mockResolvedValue(mockAirports);

    render(
      <AutocompleteInput
        value={null}
        onChange={mockOnChange}
        onSearch={mockOnSearch}
        debounceMs={100}
        minChars={2}
      />,
    );

    const input = screen.getByRole("textbox");
    await userEvent.type(input, "New");

    await waitFor(
      () => {
        expect(input).toHaveAttribute("aria-expanded", "true");
        expect(input).toHaveAttribute("aria-controls");
      },
      { timeout: 500 },
    );
  });

  it("cancels previous search when typing continues", async () => {
    mockOnSearch.mockResolvedValue(mockAirports);

    render(
      <AutocompleteInput
        value={null}
        onChange={mockOnChange}
        onSearch={mockOnSearch}
        debounceMs={100}
        minChars={2}
      />,
    );

    const input = screen.getByRole("textbox");

    // Type "Ne"
    await userEvent.type(input, "Ne");

    // Type "w" quickly after
    await userEvent.type(input, "w");

    // Should only search once with final value
    await waitFor(
      () => {
        expect(mockOnSearch).toHaveBeenCalledTimes(1);
        expect(mockOnSearch).toHaveBeenCalledWith("New");
      },
      { timeout: 500 },
    );
  });

  it("resets selection when input is cleared manually", async () => {
    render(
      <AutocompleteInput
        value={mockAirports[0]}
        onChange={mockOnChange}
        onSearch={mockOnSearch}
      />,
    );

    const input = screen.getByRole("textbox");
    await userEvent.clear(input);

    expect(mockOnChange).toHaveBeenCalledWith(null);
  });
});
