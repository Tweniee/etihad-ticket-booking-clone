import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  LoadingSpinner,
  FullPageLoadingSpinner,
} from "@/components/shared/LoadingSpinner";

describe("LoadingSpinner", () => {
  it("renders with default props", () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByTestId("loading-spinner");
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute("role", "status");
    expect(spinner).toHaveAttribute("aria-live", "polite");
  });

  it("renders with custom text", () => {
    render(<LoadingSpinner text="Loading flights..." />);
    expect(screen.getByText("Loading flights...")).toBeInTheDocument();
  });

  it("renders different sizes", () => {
    const { rerender } = render(<LoadingSpinner size="small" />);
    let icon = screen.getByTestId("loading-spinner-icon");
    expect(icon).toHaveClass("w-4", "h-4");

    rerender(<LoadingSpinner size="medium" />);
    icon = screen.getByTestId("loading-spinner-icon");
    expect(icon).toHaveClass("w-8", "h-8");

    rerender(<LoadingSpinner size="large" />);
    icon = screen.getByTestId("loading-spinner-icon");
    expect(icon).toHaveClass("w-12", "h-12");
  });

  it("renders different colors", () => {
    const { rerender } = render(<LoadingSpinner color="primary" />);
    let icon = screen.getByTestId("loading-spinner-icon");
    expect(icon).toHaveClass("text-blue-600");

    rerender(<LoadingSpinner color="white" />);
    icon = screen.getByTestId("loading-spinner-icon");
    expect(icon).toHaveClass("text-white");

    rerender(<LoadingSpinner color="gray" />);
    icon = screen.getByTestId("loading-spinner-icon");
    expect(icon).toHaveClass("text-gray-600");
  });

  it("centers when centered prop is true", () => {
    render(<LoadingSpinner centered />);
    const spinner = screen.getByTestId("loading-spinner");
    expect(spinner).toHaveClass(
      "flex",
      "flex-col",
      "items-center",
      "justify-center",
    );
  });

  it("renders inline when centered is false", () => {
    render(<LoadingSpinner centered={false} />);
    const spinner = screen.getByTestId("loading-spinner");
    expect(spinner).toHaveClass("inline-flex");
  });

  it("applies custom className", () => {
    render(<LoadingSpinner className="custom-class" />);
    const spinner = screen.getByTestId("loading-spinner");
    expect(spinner).toHaveClass("custom-class");
  });

  it("uses custom test ID", () => {
    render(<LoadingSpinner testId="custom-spinner" />);
    expect(screen.getByTestId("custom-spinner")).toBeInTheDocument();
  });

  it("uses custom aria label", () => {
    render(<LoadingSpinner ariaLabel="Loading data" />);
    const spinner = screen.getByTestId("loading-spinner");
    expect(spinner).toHaveAttribute("aria-label", "Loading data");
  });
});

describe("FullPageLoadingSpinner", () => {
  it("renders full page overlay", () => {
    render(<FullPageLoadingSpinner />);
    const overlay = screen.getByTestId("full-page-loading");
    expect(overlay).toBeInTheDocument();
    expect(overlay).toHaveClass("fixed", "inset-0", "z-50");
  });

  it("renders with custom text", () => {
    render(<FullPageLoadingSpinner text="Processing payment..." />);
    expect(screen.getByText("Processing payment...")).toBeInTheDocument();
  });

  it("contains a LoadingSpinner", () => {
    render(<FullPageLoadingSpinner />);
    expect(screen.getByTestId("full-page-loading-spinner")).toBeInTheDocument();
  });
});
