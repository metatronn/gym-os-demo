# Task 027: Marketing Landing Page

**Phase:** 6 — Growth
**Priority:** Medium
**Depends on:** [006](./006-clerk-auth.md)
**Blocks:** Nothing (leaf task)

---

## Objective

Build a public-facing landing page at `/` (instead of the current redirect to `/dashboard`). This is what unauthenticated visitors see — it sells the product and drives sign-ups.

## Steps

### 1. Route Structure

- `/` — Public landing page (no auth required)
- `/sign-up` — Clerk sign-up page
- `/sign-in` — Clerk sign-in page
- `/dashboard` — Authenticated app (existing)

Update `src/app/page.tsx` from a redirect to a real page.

### 2. Landing Page Sections

1. **Hero:** Headline, subheadline, CTA ("Start Free Trial"), product screenshot/video
2. **Features:** 3-4 feature cards (Dashboard, Members, Schedule, AI Command Panel)
3. **Pricing:** Single plan with trial CTA
4. **Social Proof:** Testimonials or gym logos (placeholder for now)
5. **Footer:** Links, legal, contact

### 3. Design

- Same dark theme as the app (gym-bg, gym-card colors)
- Full-width sections, not constrained by the sidebar layout
- Landing page should NOT show the sidebar or command panel (different layout)

### 4. Layout Split

Create a layout group to separate public and authenticated layouts:

```
src/app/
  (public)/
    page.tsx              # Landing page
    layout.tsx            # No sidebar, no auth
  (app)/
    layout.tsx            # Sidebar + auth required
    dashboard/page.tsx
    members/page.tsx
    ...
```

Or use middleware-based routing — if user is authenticated and hits `/`, redirect to `/dashboard`.

### 5. SEO

- Meta tags, Open Graph, Twitter Card
- `robots.txt` and `sitemap.xml`
- Structured data (Organization schema)

## Acceptance Criteria

- Unauthenticated visitors see a marketing page at `/`
- Authenticated visitors are redirected to `/dashboard`
- Landing page has hero, features, pricing, and CTA
- CTA links to `/sign-up`
- Same dark theme as the app
- Basic SEO is in place
