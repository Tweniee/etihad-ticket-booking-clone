# Modal Component

An accessible dialog component for displaying content in an overlay with proper focus management and keyboard navigation.

## Features

- Focus trap (keeps focus within modal)
- Close on Escape key
- Close on backdrop click (optional)
- Accessible with ARIA attributes
- Multiple size variants
- Customizable header and footer
- Scroll handling for long content
- Body scroll prevention when open
- Focus restoration on close

## Requirements

**Validates Requirements:**

- 15.2: Provide keyboard navigation for all interactive elements
- 15.3: Provide ARIA labels for all form inputs and interactive components

## Usage

### Basic Usage

```tsx
import { Modal } from "@/components/shared";
import { useState } from "react";

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Modal</button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <p>Modal content goes here</p>
      </Modal>
    </>
  );
}
```

### With Title

```tsx
<Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Modal Title">
  <p>Content</p>
</Modal>
```

### With Footer Actions

```tsx
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirm Action"
  footer={
    <>
      <button onClick={() => setIsOpen(false)}>Cancel</button>
      <button onClick={handleConfirm}>Confirm</button>
    </>
  }
>
  <p>Are you sure you want to proceed?</p>
</Modal>
```

### Size Variants

```tsx
<Modal size="small" isOpen={isOpen} onClose={onClose}>
  <p>Small modal</p>
</Modal>

<Modal size="medium" isOpen={isOpen} onClose={onClose}>
  <p>Medium modal (default)</p>
</Modal>

<Modal size="large" isOpen={isOpen} onClose={onClose}>
  <p>Large modal</p>
</Modal>

<Modal size="full" isOpen={isOpen} onClose={onClose}>
  <p>Full width modal</p>
</Modal>
```

### Non-Closeable Modal

```tsx
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  closeable={false}
  showCloseButton={false}
>
  <p>This modal cannot be closed with Escape or backdrop click</p>
  <button onClick={() => setIsOpen(false)}>Done</button>
</Modal>
```

### Prevent Backdrop Close

```tsx
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  closeOnBackdropClick={false}
>
  <p>Click backdrop won't close this modal</p>
</Modal>
```

## Props

| Prop                   | Type                                       | Default     | Description                            |
| ---------------------- | ------------------------------------------ | ----------- | -------------------------------------- |
| `isOpen`               | `boolean`                                  | _required_  | Whether the modal is open              |
| `onClose`              | `() => void`                               | _required_  | Callback when modal should close       |
| `title`                | `string`                                   | `undefined` | Modal title                            |
| `children`             | `ReactNode`                                | _required_  | Modal content                          |
| `footer`               | `ReactNode`                                | `undefined` | Footer content (typically buttons)     |
| `size`                 | `"small" \| "medium" \| "large" \| "full"` | `"medium"`  | Size variant                           |
| `closeOnBackdropClick` | `boolean`                                  | `true`      | Whether clicking backdrop closes modal |
| `showCloseButton`      | `boolean`                                  | `true`      | Whether close button is shown          |
| `closeable`            | `boolean`                                  | `true`      | Whether modal can be closed            |
| `className`            | `string`                                   | `""`        | Additional CSS classes                 |
| `testId`               | `string`                                   | `"modal"`   | Test ID for testing                    |
| `ariaLabel`            | `string`                                   | `undefined` | ARIA label for the modal               |

## Common Use Cases

### Confirmation Dialog

```tsx
<Modal
  isOpen={confirmOpen}
  onClose={() => setConfirmOpen(false)}
  title="Cancel Booking"
  size="small"
  footer={
    <>
      <button onClick={() => setConfirmOpen(false)}>Keep Booking</button>
      <button onClick={handleCancel}>Cancel Booking</button>
    </>
  }
>
  <p>Are you sure you want to cancel this booking?</p>
  <p className="text-sm text-gray-600">Cancellation fee: $50.00</p>
</Modal>
```

### Form Modal

```tsx
<Modal
  isOpen={formOpen}
  onClose={() => setFormOpen(false)}
  title="Add Passenger"
  footer={
    <>
      <button onClick={() => setFormOpen(false)}>Cancel</button>
      <button onClick={handleSubmit}>Add Passenger</button>
    </>
  }
>
  <form className="space-y-4">
    <div>
      <label htmlFor="firstName">First Name</label>
      <input id="firstName" type="text" />
    </div>
    <div>
      <label htmlFor="lastName">Last Name</label>
      <input id="lastName" type="text" />
    </div>
  </form>
</Modal>
```

### Information Modal

```tsx
<Modal
  isOpen={infoOpen}
  onClose={() => setInfoOpen(false)}
  title="Flight Details"
  size="large"
>
  <div className="space-y-4">
    <h3>Itinerary</h3>
    <p>Flight details go here...</p>
    <h3>Baggage Allowance</h3>
    <p>Baggage information...</p>
  </div>
</Modal>
```

### Processing Modal

```tsx
<Modal
  isOpen={processing}
  onClose={() => {}}
  title="Processing Payment"
  closeable={false}
  showCloseButton={false}
>
  <div className="text-center py-4">
    <LoadingSpinner centered />
    <p className="mt-4">Please wait...</p>
  </div>
</Modal>
```

## Keyboard Navigation

- **Escape**: Closes the modal (when `closeable` is true)
- **Tab**: Cycles through focusable elements within the modal
- **Shift + Tab**: Cycles backwards through focusable elements
- Focus is trapped within the modal while open
- Focus returns to the trigger element when closed

## Accessibility Features

- **Focus Management**:
  - Automatically focuses the modal when opened
  - Traps focus within the modal
  - Restores focus to previous element when closed
- **ARIA Attributes**:
  - `role="dialog"` for screen reader identification
  - `aria-modal="true"` to indicate modal behavior
  - `aria-labelledby` links to the title
  - `aria-label` for custom labeling
- **Keyboard Support**:
  - Escape key to close
  - Tab key navigation with focus trap
- **Body Scroll**:
  - Prevents background scrolling when modal is open
  - Restores scroll when modal closes

## Testing

The component includes comprehensive unit tests covering:

- Open/close behavior
- Title and footer rendering
- Close button functionality
- Escape key handling
- Backdrop click handling
- Size variants
- Closeable behavior
- ARIA attributes
- Body scroll prevention
- Focus management

Run tests with:

```bash
pnpm test tests/unit/components/Modal.test.tsx
```

## Examples

See `Modal.example.tsx` for interactive examples of all features and use cases.

## Best Practices

1. **Always provide a way to close**: Even if `closeable` is false, provide a button to close the modal
2. **Use appropriate sizes**: Small for confirmations, medium for forms, large for detailed content
3. **Provide clear actions**: Use footer buttons for primary actions
4. **Accessible titles**: Always provide a title or aria-label for screen readers
5. **Focus management**: Ensure the first focusable element is meaningful
6. **Loading states**: Use non-closeable modals for processing states
7. **Error handling**: Show errors within the modal rather than closing it
