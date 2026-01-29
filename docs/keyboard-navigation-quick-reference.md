# Keyboard Navigation Quick Reference

## For Developers

### Quick Start

Import the utilities you need:

```tsx
import {
  FOCUS_RING_CLASSES,
  handleKeyboardActivation,
  handleEscapeKey,
} from "@/lib/utils/keyboard-navigation";

import {
  useKeyboardNavigation,
  useFocusTrap,
} from "@/lib/hooks/useKeyboardNavation";
```

### Common Patterns

#### 1. Make a Div Clickable and Keyboard Accessible

```tsx
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => handleKeyboardActivation(e, handleClick)}
  className={`cursor-pointer ${FOCUS_RING_CLASSES}`}
>
  Click me
</div>
```

#### 2. Add Focus Ring to Button

```tsx
<button className={`px-4 py-2 bg-blue-600 text-white ${FOCUS_RING_CLASSES}`}>
  Submit
</button>
```

#### 3. Keyboard Navigation in List

```tsx
const { currentIndex, handleKeyDown } = useKeyboardNavigation({
  itemCount: items.length,
  onSelect: (index) => handleSelect(items[index]),
});

<div onKeyDown={handleKeyDown}>
  {items.map((item, index) => (
    <button
      key={item.id}
      tabIndex={index === currentIndex ? 0 : -1}
      className={FOCUS_RING_CLASSES}
    >
      {item.label}
    </button>
  ))}
</div>;
```

#### 4. Focus Trap in Modal

```tsx
const modalRef = useFocusTrap(isOpen);

<div
  ref={modalRef}
  role="dialog"
  aria-modal="true"
  onKeyDown={(e) => handleEscapeKey(e, onClose)}
>
  <h2>Modal Title</h2>
  <button onClick={onClose}>Close</button>
</div>;
```

### Focus Ring Classes

- **Standard**: `FOCUS_RING_CLASSES` - Use for most elements
- **Inset**: `FOCUS_RING_INSET_CLASSES` - Use for nested elements
- **Dark**: `FOCUS_RING_DARK_CLASSES` - Use on dark backgrounds

### Keyboard Events

| Function                   | Keys         | Use Case                           |
| -------------------------- | ------------ | ---------------------------------- |
| `handleKeyboardActivation` | Enter, Space | Make non-button elements clickable |
| `handleEscapeKey`          | Escape       | Close modals, dropdowns            |
| `handleArrowKeyNavigation` | Arrow keys   | Navigate lists                     |

### Testing Checklist

- [ ] All buttons have visible focus ring
- [ ] Tab order is logical
- [ ] Enter/Space activates buttons
- [ ] Escape closes modals
- [ ] Arrow keys work in lists
- [ ] No keyboard traps
- [ ] Focus returns after modal closes

### WCAG Requirements

✅ **2.1.1 Keyboard**: All functionality via keyboard  
✅ **2.1.2 No Keyboard Trap**: Can navigate away  
✅ **2.4.3 Focus Order**: Logical tab order  
✅ **2.4.7 Focus Visible**: Clear focus indicators

### Resources

- Full Documentation: `docs/keyboard-navigation.md`
- Test Examples: `tests/unit/utils/keyboard-navigation.test.ts`
- Component Examples: See existing components in `components/`
