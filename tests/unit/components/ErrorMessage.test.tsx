import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  ErrorMessage,
  InlineFieldError,
} from "@/components/shared/ErrorMessage";

describe("ErrorMessage", () => {
  it("renders with default props", () => {
    render(<ErrorMessage message="An error occurred" />);
    const error = screen.getByTestId("error-message");
    expect(error).toBeInTheDocument();
    expect(error).toHaveAttribute("role", "alert");
    expect(screen.getByText("An error occurred")).toBeInTheDocument();
  });

  it("displays error title based on type", () => {
    const { rerender } = render(
      <ErrorMessage message="Test error" type="validation" />,
    );
    expect(screen.getByText("Validation Error")).toBeInTheDocument();

    rerender(<ErrorMessage message="Test error" type="network" />);
    expect(screen.getByText("Connection Error")).toBeInTheDocument();

    rerender(<ErrorMessage message="Test error" type="server" />);
    expect(screen.getByText("Server Error")).toBeInTheDocument();

    rerender(<ErrorMessage message="Test error" type="payment" />);
    expect(screen.getByText("Payment Error")).toBeInTheDocument();

    rerender(<ErrorMessage message="Test error" type="session" />);
    expect(screen.getByText("Session Error")).toBeInTheDocument();
  });

  it("renders different severity levels with appropriate colors", () => {
    const { rerender } = render(
      <ErrorMessage message="Test" severity="error" />,
    );
    let container = screen.getByTestId("error-message");
    expect(container).toHaveClass("bg-red-50", "border-red-200");

    rerender(<ErrorMessage message="Test" severity="warning" />);
    container = screen.getByTestId("error-message");
    expect(container).toHaveClass("bg-yellow-50", "border-yellow-200");

    rerender(<ErrorMessage message="Test" severity="info" />);
    container = screen.getByTestId("error-message");
    expect(container).toHaveClass("bg-blue-50", "border-blue-200");
  });

  it("renders retry button when retryable", () => {
    const onRetry = vi.fn();
    render(
      <ErrorMessage message="Network error" retryable onRetry={onRetry} />,
    );

    const retryButton = screen.getByTestId("error-message-retry-button");
    expect(retryButton).toBeInTheDocument();
    expect(retryButton).toHaveTextContent("Try Again");

    fireEvent.click(retryButton);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("does not render retry button when not retryable", () => {
    render(<ErrorMessage message="Error" retryable={false} />);
    expect(
      screen.queryByTestId("error-message-retry-button"),
    ).not.toBeInTheDocument();
  });

  it("renders dismiss button when dismissible", () => {
    const onDismiss = vi.fn();
    render(
      <ErrorMessage
        message="Dismissible error"
        dismissible
        onDismiss={onDismiss}
      />,
    );

    const dismissButton = screen.getByTestId("error-message-dismiss-button");
    expect(dismissButton).toBeInTheDocument();

    fireEvent.click(dismissButton);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("hides error after dismissing", () => {
    render(<ErrorMessage message="Dismissible error" dismissible />);

    const dismissButton = screen.getByTestId("error-message-dismiss-button");
    fireEvent.click(dismissButton);

    expect(screen.queryByTestId("error-message")).not.toBeInTheDocument();
  });

  it("renders different variants", () => {
    const { rerender } = render(
      <ErrorMessage message="Test" variant="inline" />,
    );
    let container = screen.getByTestId("error-message");
    expect(container).toHaveClass("text-sm", "py-1");

    rerender(<ErrorMessage message="Test" variant="block" />);
    container = screen.getByTestId("error-message");
    expect(container).toHaveClass("p-4", "rounded-md", "border");

    rerender(<ErrorMessage message="Test" variant="banner" />);
    container = screen.getByTestId("error-message");
    expect(container).toHaveClass("p-4", "border-l-4");
  });

  it("displays field name for inline errors", () => {
    render(
      <ErrorMessage message="is required" field="Email" variant="inline" />,
    );
    expect(screen.getByText(/Email:/)).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<ErrorMessage message="Test" className="custom-class" />);
    const error = screen.getByTestId("error-message");
    expect(error).toHaveClass("custom-class");
  });

  it("uses custom test ID", () => {
    render(<ErrorMessage message="Test" testId="custom-error" />);
    expect(screen.getByTestId("custom-error")).toBeInTheDocument();
  });
});

describe("InlineFieldError", () => {
  it("renders error message", () => {
    render(<InlineFieldError message="This field is required" />);
    expect(screen.getByText("This field is required")).toBeInTheDocument();
  });

  it("has role alert", () => {
    render(<InlineFieldError message="Error" />);
    const error = screen.getByRole("alert");
    expect(error).toBeInTheDocument();
  });

  it("associates with field ID", () => {
    render(<InlineFieldError message="Error" fieldId="email" />);
    const error = screen.getByTestId("field-error");
    expect(error).toHaveAttribute("id", "email-error");
  });

  it("uses custom test ID", () => {
    render(<InlineFieldError message="Error" testId="custom-field-error" />);
    expect(screen.getByTestId("custom-field-error")).toBeInTheDocument();
  });

  it("displays error icon", () => {
    render(<InlineFieldError message="Error" />);
    const error = screen.getByTestId("field-error");
    const svg = error.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });
});
