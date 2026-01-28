import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Modal } from "@/components/shared/Modal";

describe("Modal", () => {
  beforeEach(() => {
    // Reset body overflow before each test
    document.body.style.overflow = "";
  });

  afterEach(() => {
    // Clean up after each test
    document.body.style.overflow = "";
  });

  it("does not render when isOpen is false", () => {
    render(
      <Modal isOpen={false} onClose={() => {}}>
        <p>Modal content</p>
      </Modal>,
    );
    expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
  });

  it("renders when isOpen is true", () => {
    render(
      <Modal isOpen={true} onClose={() => {}}>
        <p>Modal content</p>
      </Modal>,
    );
    expect(screen.getByTestId("modal")).toBeInTheDocument();
    expect(screen.getByText("Modal content")).toBeInTheDocument();
  });

  it("renders with title", () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal">
        <p>Content</p>
      </Modal>,
    );
    expect(screen.getByText("Test Modal")).toBeInTheDocument();
  });

  it("renders with footer", () => {
    render(
      <Modal isOpen={true} onClose={() => {}} footer={<button>Save</button>}>
        <p>Content</p>
      </Modal>,
    );
    expect(screen.getByText("Save")).toBeInTheDocument();
  });

  it("renders close button by default", () => {
    render(
      <Modal isOpen={true} onClose={() => {}}>
        <p>Content</p>
      </Modal>,
    );
    expect(screen.getByTestId("modal-close-button")).toBeInTheDocument();
  });

  it("hides close button when showCloseButton is false", () => {
    render(
      <Modal isOpen={true} onClose={() => {}} showCloseButton={false}>
        <p>Content</p>
      </Modal>,
    );
    expect(screen.queryByTestId("modal-close-button")).not.toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose}>
        <p>Content</p>
      </Modal>,
    );

    const closeButton = screen.getByTestId("modal-close-button");
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when Escape key is pressed", () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose}>
        <p>Content</p>
      </Modal>,
    );

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not close on Escape when closeable is false", () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose} closeable={false}>
        <p>Content</p>
      </Modal>,
    );

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).not.toHaveBeenCalled();
  });

  it("calls onClose when backdrop is clicked", () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose}>
        <p>Content</p>
      </Modal>,
    );

    const backdrop = screen.getByTestId("modal-backdrop");
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not close on backdrop click when closeOnBackdropClick is false", () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose} closeOnBackdropClick={false}>
        <p>Content</p>
      </Modal>,
    );

    const backdrop = screen.getByTestId("modal-backdrop");
    fireEvent.click(backdrop);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("does not close on backdrop click when closeable is false", () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose} closeable={false}>
        <p>Content</p>
      </Modal>,
    );

    const backdrop = screen.getByTestId("modal-backdrop");
    fireEvent.click(backdrop);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("renders different sizes", () => {
    const { rerender } = render(
      <Modal isOpen={true} onClose={() => {}} size="small">
        <p>Content</p>
      </Modal>,
    );
    let content = screen.getByTestId("modal-content");
    expect(content).toHaveClass("max-w-md");

    rerender(
      <Modal isOpen={true} onClose={() => {}} size="medium">
        <p>Content</p>
      </Modal>,
    );
    content = screen.getByTestId("modal-content");
    expect(content).toHaveClass("max-w-lg");

    rerender(
      <Modal isOpen={true} onClose={() => {}} size="large">
        <p>Content</p>
      </Modal>,
    );
    content = screen.getByTestId("modal-content");
    expect(content).toHaveClass("max-w-2xl");

    rerender(
      <Modal isOpen={true} onClose={() => {}} size="full">
        <p>Content</p>
      </Modal>,
    );
    content = screen.getByTestId("modal-content");
    expect(content).toHaveClass("max-w-full");
  });

  it("applies custom className", () => {
    render(
      <Modal isOpen={true} onClose={() => {}} className="custom-class">
        <p>Content</p>
      </Modal>,
    );
    const content = screen.getByTestId("modal-content");
    expect(content).toHaveClass("custom-class");
  });

  it("uses custom test ID", () => {
    render(
      <Modal isOpen={true} onClose={() => {}} testId="custom-modal">
        <p>Content</p>
      </Modal>,
    );
    expect(screen.getByTestId("custom-modal")).toBeInTheDocument();
  });

  it("has proper ARIA attributes", () => {
    render(
      <Modal
        isOpen={true}
        onClose={() => {}}
        title="Test Modal"
        ariaLabel="Test dialog"
      >
        <p>Content</p>
      </Modal>,
    );
    const modal = screen.getByTestId("modal");
    expect(modal).toHaveAttribute("role", "dialog");
    expect(modal).toHaveAttribute("aria-modal", "true");
    expect(modal).toHaveAttribute("aria-label", "Test dialog");
  });

  it("prevents body scroll when open", () => {
    const { rerender } = render(
      <Modal isOpen={true} onClose={() => {}}>
        <p>Content</p>
      </Modal>,
    );
    expect(document.body.style.overflow).toBe("hidden");

    rerender(
      <Modal isOpen={false} onClose={() => {}}>
        <p>Content</p>
      </Modal>,
    );
    expect(document.body.style.overflow).toBe("");
  });

  it("renders backdrop", () => {
    render(
      <Modal isOpen={true} onClose={() => {}}>
        <p>Content</p>
      </Modal>,
    );
    const backdrop = screen.getByTestId("modal-backdrop");
    expect(backdrop).toBeInTheDocument();
    expect(backdrop).toHaveClass(
      "fixed",
      "inset-0",
      "bg-black",
      "bg-opacity-50",
    );
  });

  it("renders header when title is provided", () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test Title">
        <p>Content</p>
      </Modal>,
    );
    expect(screen.getByTestId("modal-header")).toBeInTheDocument();
  });

  it("renders footer when footer prop is provided", () => {
    render(
      <Modal isOpen={true} onClose={() => {}} footer={<div>Footer</div>}>
        <p>Content</p>
      </Modal>,
    );
    expect(screen.getByTestId("modal-footer")).toBeInTheDocument();
  });

  it("does not render header when no title and showCloseButton is false", () => {
    render(
      <Modal isOpen={true} onClose={() => {}} showCloseButton={false}>
        <p>Content</p>
      </Modal>,
    );
    expect(screen.queryByTestId("modal-header")).not.toBeInTheDocument();
  });
});
