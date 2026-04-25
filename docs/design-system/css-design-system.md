# CSS Design System

Use this guide when applying the local frontend design skill.

## Principles

- Prefer existing app tokens from `client/src/styles/_theme.scss`.
- Keep component styles colocated with the component SCSS pattern already used in `client/src`.
- Use CSS variables or Sass variables for repeated colors, spacing, shadows, and z-index values.
- Avoid one-off magic values when a named token or local pattern exists.
- Keep visual treatments appropriate to the Body Vantage product: clear, fitness-oriented, readable, and task-focused.

## Component Styling

- Use semantic class names that describe the component or state.
- Include hover, focus-visible, disabled, loading, empty, and error states where relevant.
- Do not hide focus outlines without replacing them with an accessible visible focus style.
- Keep text readable over images with overlays or solid surfaces.
- Avoid nesting cards inside cards unless the existing component requires it.

## Accessibility

- Maintain sufficient color contrast for text and controls.
- Preserve native control behavior where possible.
- Pair icons with accessible names when the icon carries meaning.
- Use reduced-motion media queries for nonessential animation.
