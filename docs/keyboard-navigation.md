# Keyboard Navigation Implementation

This document describes the keyboard navigation implementation across the flight booking system, ensuring all interactive elements are accessible via keyboard.

## Requirements

**Requirement 15.2**: The system SHALL provide keyboard navigation for all interactive elements.

## Implementation Overview

### Core Utilities

#### 1. Keyboard Navigation Utilities (`lib/utils/keyboard-navigation.ts`)

Provides comprehensive utilities for implementing keyboard navigation:

- **Focus Ring Classes**: Consistent styling for keyboard focus indicators
  - `FOCUS_RING_CLASSES`: Standard focus ring with offset
  - `FOCUS_RING_INSET_CLASSES`: Focus ring without offset (for nested elements)
  - `FOCUS_RING_DARK_CLASSES`: Focus ring for dark backgrounds

- **Keyboard Event Handlers**:
  - `handleKeyboardActivation()`: Handle Enter/Space key activation
  - `handleEscapeKey()`: Handle Escape key press
  - `handleArrowKeyNavigation()`: Navigate lists with arrow keys

- **Focus Management**:
  - `getFocusableElements()`: Find all focusable elements in a container
  - `focusFirstElement()`: Focus the first focusable element
  - `focusLastElement()`: Focus the last focusable element
  - `trapFocus()`: Trap focus within a container (for modals)
  - `saveFocus()` / `restoreFocus()`: Save and restore focus state

- **Advanced Features**:
  - `RovingTabIndexManager`: Manage roving tabindex for lists
  - `skipToMainContent()`: Skip to main content functionality
  - `announceToScreenReader()`: Announce dynamic content changes

#### 2. Custom Hooks (`lib/hooks/useKeyboardNavigation.ts`)

React hooks for keyboard navigation:

- **`useKeyboardNavigation`**: Manage keyboard navigation in lists/grids
  - Supports vertical and horizontal navigation
  - Configurable looping behavior
  - Home/End key support
  - Enter/Space selection

- **`useFocusTrap`**: Trap focus within a component (for modals/dialogs)
  - Automatic focus management
  - Cleanup on unmount

- **`useFocusManagement`**: General focus management utilities
  - Save and restore focus
  - Focus specific elements

## Component Implementation

### 1. Search Component

**Keyboard Support**:

- ✅ Tab navigation through all form fields
- ✅ Enter/Space to toggle trip type buttons
- ✅ Arrow keys in autocomplete dropdowns
- ✅ Enter to select autocomplete suggestions
- ✅ Escape to close autocomplete
- ✅ Tab through passenger counters
- ✅ Enter/Space to increment/decrement passengers
- ✅ Arrow keys in cabin class radio buttons
- ✅ Enter to submit form

**Focus Management**:

- Focus visible on all interactive elements
- Focus ring: `focus:outline-none focus:ring-2 focus:ring-blue-500`
- Proper tab order maintained

### 2. Flight Results Components

#### FlightCard

**Keyboard Support**:

- ✅ Entire card is keyboard accessible with `role="button"` and `tabIndex={0}`
- ✅ Enter/Space to select flight
- ✅ Focus ring on card
- ✅ ARIA labels for screen readers

#### FilterSidebar

**Keyboard Support**:

- ✅ Tab through all filter controls
- ✅ Enter/Space to toggle filter sections
- ✅ Arrow keys for range sliders
- ✅ Enter/Space for checkboxes
- ✅ Focus visible on all controls
- ✅ Close button keyboard accessible (mobile)

### 3. Seat Selection Components

#### SeatMap

**Keyboard Support**:

- ✅ Tab through passenger selector buttons
- ✅ Enter/Space to switch passengers
- ✅ Tab through seat grid
- ✅ Enter/Space to select seat
- ✅ Focus visible on seats
- ✅ Disabled seats not in tab order
- ✅ Continue/Skip buttons keyboard accessible

#### Seat Component

**Keyboard Support**:

- ✅ Button element with proper focus
- ✅ Enter/Space to select seat
- ✅ Focus ring: `focus:ring-2 focus:ring-blue-500`
- ✅ Disabled state prevents keyboard activation
- ✅ ARIA labels describe seat details

### 4. Passenger Form

**Keyboard Support**:

- ✅ Tab through all form fields
- ✅ Enter to submit form
- ✅ Focus visible on all inputs
- ✅ DatePicker keyboard accessible:
  - Enter/Space to open calendar
  - Arrow keys to navigate dates
  - Enter to select date
  - Escape to close calendar
- ✅ Select dropdowns keyboard accessible
- ✅ Back/Next buttons keyboard accessible

### 5. Extras Component

**Keyboard Support**:

- ✅ Tab through tab buttons
- ✅ Enter/Space to switch tabs
- ✅ Tab through extra options
- ✅ Enter/Space to select extras
- ✅ Focus visible on all interactive elements
- ✅ Back/Continue buttons keyboard accessible

### 6. Payment Component

**Keyboard Support**:

- ✅ Tab through payment form
- ✅ Razorpay checkout is keyboard accessible
- ✅ Back/Pay buttons keyboard accessible
- ✅ Focus visible on all controls

### 7. Shared Components

#### Modal

**Keyboard Support**:

- ✅ Focus trap within modal
- ✅ Escape to close (if closeable)
- ✅ Tab cycles through modal elements only
- ✅ Focus returns to trigger element on close
- ✅ Close button keyboard accessible

#### AutocompleteInput

**Keyboard Support**:

- ✅ Type to search
- ✅ Arrow Down/Up to navigate suggestions
- ✅ Enter to select highlighted suggestion
- ✅ Escape to close dropdown
- ✅ Tab to close and move to next field
- ✅ Clear button keyboard accessible

#### DatePicker

**Keyboard Support**:

- ✅ Enter/Space to open calendar
- ✅ Arrow keys to navigate calendar
- ✅ Enter to select date
- ✅ Escape to close calendar
- ✅ Previous/Next month buttons keyboard accessible
- ✅ Today button keyboard accessible
- ✅ Manual date entry supported

## Testing

### Unit Tests

All keyboard navigation utilities are tested in `tests/unit/utils/keyboard-navigation.test.ts`:

- ✅ Keyboard activation handlers
- ✅ Focus management functions
- ✅ Arrow key navigation
- ✅ Roving tabindex manager
- ✅ Focus trap functionality
- ✅ Screen reader announcements

### Manual Testing Checklist

To verify keyboard navigation:

1. **Tab Navigation**:
   - [ ] Press Tab to move forward through all interactive elements
   - [ ] Press Shift+Tab to move backward
   - [ ] Verify focus is always visible
   - [ ] Verify tab order is logical

2. **Keyboard Activation**:
   - [ ] Press Enter on buttons to activate
   - [ ] Press Space on buttons to activate
   - [ ] Verify both keys work consistently

3. **Arrow Key Navigation**:
   - [ ] Use arrow keys in autocomplete dropdowns
   - [ ] Use arrow keys in date picker calendar
   - [ ] Use arrow keys in seat map (if implemented)

4. **Escape Key**:
   - [ ] Press Escape to close modals
   - [ ] Press Escape to close dropdowns
   - [ ] Press Escape to close date picker

5. **Focus Management**:
   - [ ] Open modal - focus moves to modal
   - [ ] Close modal - focus returns to trigger
   - [ ] Tab within modal - focus stays trapped
   - [ ] Navigate between pages - focus is managed appropriately

## Accessibility Standards

### WCAG 2.1 Level AA Compliance

- **2.1.1 Keyboard (Level A)**: All functionality available via keyboard ✅
- **2.1.2 No Keyboard Trap (Level A)**: Users can navigate away from any component ✅
- **2.4.3 Focus Order (Level A)**: Focus order is logical and meaningful ✅
- **2.4.7 Focus Visible (Level AA)**: Keyboard focus is clearly visible ✅

### Focus Indicators

All interactive elements have visible focus indicators:

- **Color**: Blue ring (`ring-blue-500`)
- **Width**: 2px (`ring-2`)
- **Offset**: 2px (`ring-offset-2`) for most elements
- **Contrast**: Meets WCAG AA requirements (4.5:1 minimum)

## Best Practices

### 1. Always Use Semantic HTML

```tsx
// ✅ Good - Button element
<button onClick={handleClick}>Click me</button>

// ❌ Bad - Div with click handler
<div onClick={handleClick}>Click me</div>
```

### 2. Add Keyboard Support to Custom Interactive Elements

```tsx
// ✅ Good - Div with keyboard support
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => handleKeyboardActivation(e, handleClick)}
>
  Click me
</div>
```

### 3. Use Focus Ring Classes

```tsx
// ✅ Good - Visible focus indicator
<button className="focus:outline-none focus:ring-2 focus:ring-blue-500">
  Button
</button>

// ❌ Bad - No focus indicator
<button className="focus:outline-none">
  Button
</button>
```

### 4. Manage Focus in Modals

```tsx
// ✅ Good - Focus trap in modal
const modalRef = useFocusTrap(isOpen);

return (
  <div ref={modalRef} role="dialog">
    {/* Modal content */}
  </div>
);
```

### 5. Provide Keyboard Shortcuts

```tsx
// ✅ Good - Arrow key navigation in lists
const { handleKeyDown } = useKeyboardNavigation({
  itemCount: items.length,
  onSelect: handleSelect,
});

return <div onKeyDown={handleKeyDown}>{/* List items */}</div>;
```

## Common Patterns

### Pattern 1: Clickable Card

```tsx
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => handleKeyboardActivation(e, handleClick)}
  className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
>
  {/* Card content */}
</div>
```

### Pattern 2: Dropdown Menu

```tsx
const { currentIndex, handleKeyDown } = useKeyboardNavigation({
  itemCount: options.length,
  onSelect: (index) => handleSelect(options[index]),
});

return (
  <div onKeyDown={handleKeyDown}>
    {options.map((option, index) => (
      <button
        key={option.id}
        tabIndex={index === currentIndex ? 0 : -1}
        onClick={() => handleSelect(option)}
      >
        {option.label}
      </button>
    ))}
  </div>
);
```

### Pattern 3: Modal Dialog

```tsx
const modalRef = useFocusTrap(isOpen);

return (
  <div
    ref={modalRef}
    role="dialog"
    aria-modal="true"
    onKeyDown={(e) => handleEscapeKey(e, onClose)}
  >
    {/* Modal content */}
  </div>
);
```

## Future Enhancements

1. **Keyboard Shortcuts**: Add global keyboard shortcuts (e.g., Ctrl+K for search)
2. **Skip Links**: Add skip navigation links for screen reader users
3. **Focus Indicators**: Consider adding custom focus indicators for brand consistency
4. **Keyboard Help**: Add keyboard shortcut help dialog (press ? to show)

## Resources

- [WCAG 2.1 Keyboard Accessible](https://www.w3.org/WAI/WCAG21/Understanding/keyboard)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM: Keyboard Accessibility](https://webaim.org/techniques/keyboard/)
