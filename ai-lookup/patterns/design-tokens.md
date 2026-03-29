# Design Tokens

**Last Updated:** 2026-03-29
**Confidence:** High

## Summary
GYM OS uses a dark theme exclusively. All colors are defined as `gym-*` Tailwind tokens in `tailwind.config.ts`. Never use raw hex values.

**Key Facts:**
- Dark background: `gym-bg` (#0A0F1C)
- Card surfaces: `gym-card` (#111827)
- Primary blue: `gym-primary` (#0350FF)
- All status colors: `gym-success`, `gym-warning`, `gym-danger`
- Three text levels: `gym-text`, `gym-text-secondary`, `gym-text-muted`

**File Pointer:** `tailwind.config.ts:10-24`

## Usage Pattern
```tsx
// Correct
<div className="bg-gym-card border border-gym-border text-gym-text">

// Wrong — never raw hex
<div className="bg-[#111827] border-[#1E293B]">
```

## Related Topics
- [Mock data status](../features/mock-data.md)
