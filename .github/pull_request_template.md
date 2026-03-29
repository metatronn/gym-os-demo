## Summary

<!-- What changed and why. Link to the relevant task or issue if applicable. -->

## Changes

<!-- Bulleted list of meaningful changes. -->

-

## Testing

<!-- How was this tested? Manual steps, automated tests, screenshots if UI. -->

## Checklist

- [ ] `npx tsc --noEmit` passes
- [ ] `npm run lint` passes
- [ ] No secrets or `.env` files committed
- [ ] All database queries include tenant isolation (`WHERE tenant_id = ?`)
