# Responsive Design

Use this guide when applying the local frontend design skill.

## Breakpoint Approach

- Start from the smallest practical viewport and scale up.
- Prefer fluid layouts with `minmax()`, `clamp()`, `max-width`, and flexible wrapping.
- Add breakpoints only when the layout needs a real structural change.

## Layout Checks

- Confirm no horizontal overflow at mobile widths.
- Ensure form controls and buttons have usable touch targets.
- Let long labels and dynamic content wrap without overlapping nearby content.
- Keep fixed-format elements stable with explicit dimensions, aspect ratios, or grid tracks.
- Verify image containers have predictable sizing before images load.

## Content Priority

- Put the primary action and primary information first on small screens.
- Collapse secondary navigation or dense metadata before shrinking essential content too far.
- Avoid hiding required information only on mobile.

## Verification

- Check at least one narrow mobile viewport, one tablet-ish width, and one desktop width.
- Inspect loading, empty, and error states when those states are part of the UI.
