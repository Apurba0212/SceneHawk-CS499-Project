---
name: scenehawk-design
description: SceneHawk's visual design system — color tokens, typography, shared UI primitives, layout and copy rules. Use whenever adding or changing any page, component, or styling in src/app or src/components, so the site stays consistent and professional.
---

# SceneHawk design system

This skill wins where it conflicts with the general skills in this folder
(`design-taste-frontend`, `web-design-guidelines`, `image-to-code`). Its
rules already include the parts of those that fit a search app.

Dark, cinematic, editorial. Think film-festival programme, not streaming
app: calm surfaces, one warm accent, serif display type, honest labels.

## 1. Tokens — never hard-code hex

All colors live in `src/app/globals.css` under `@theme`. Use the
generated Tailwind utilities (`bg-surface`, `text-fg-muted`,
`border-line`, …). A raw `#xxxxxx` in a `.tsx` file is a bug.

| Token | Use |
|---|---|
| `canvas` | page background |
| `surface` → `surface-2` → `surface-3` | cards, hover state, selected state |
| `line` / `line-strong` | default borders / emphasized + input borders |
| `fg` | headings, primary text |
| `fg-muted` | body copy, paragraph text in cards |
| `fg-subtle` | secondary info, labels, metadata |
| `fg-faint` | placeholders, tertiary meta (years, counts) |
| `accent` / `accent-hi` / `accent-soft` | brand orange: primary buttons, the one italic word, active states / hover / tinted backgrounds |
| `warn` / `warn-bg` / `warn-line` | provider notices, "lesser-known" flags |

Accent is precious: at most one primary button and one accent word per
view. Don't color whole sections orange.

## 2. Typography

- `font-display` (Playfair) for headings and film titles only.
- `font-sans` (Inter) for everything else.
- Page title: `font-display text-4xl md:text-5xl tracking-tight text-balance`,
  with at most one word wrapped in `<Em>` (italic accent), e.g.
  "Film collections by *mood*".
- **No all-caps labels.** `<Eyebrow>` (accent) and `<Label>` (`fg-subtle`)
  are sentence case, `text-sm font-medium`. Use an eyebrow only where it
  adds a fact (the film page's genres), not as decoration.
- Body copy `text-sm`/`text-[15px]` with `leading-relaxed`.
- Numbers that line up (scores, counts): `tabular-nums`.

## 3. Use the primitives in `src/components/ui.tsx`

Don't re-type class strings — compose these:

- `PageHeader` (eyebrow + title + lead, optional `center`) — every page.
- `Card` (`href` makes it a hover-able link card with `group`).
- `Tag` (`tone`: default | accent | warn) — static descriptors.
- `pillClass(active)` — clickable rounded pills (starter prompts, filters).
- `buttonClass(variant, size)` — `primary` | `secondary` | `ghost`.
- `inputClass` — text inputs (includes focus ring).
- `Notice` — caution/info banner. `Arrow` — link affordance.
- `Eyebrow`, `Label`, `Em` — type helpers above.

If you need something new and reusable, add it to `ui.tsx` rather than
inlining it in a page.

## 4. Shape, spacing, layout

- Radius: `rounded-xl` cards/panels, `rounded-lg` buttons/inputs,
  `rounded-md` tags and nav items, `rounded-full` only for pills.
- Cards: `p-5`/`p-6`, `gap-3`/`gap-4` grids.
- Content width: `max-w-6xl` (set by layout). Search/chat columns
  `max-w-3xl`. Paragraphs `max-w-xl`.
- Sections on long pages: `py-20 md:py-28`, separated by `border-t border-line`.
- Motion (from taste-skill `motion.md`): a linked card lifts 2px and its
  border darkens; buttons step up 1px on hover and press down on click;
  arrows move 3px; the current nav item has a 2px accent bar under it.
  Transitions list their properties (never `transition: all`). No scroll
  reveals, parallax, tilt, bounce or auto-playing motion.
- FAQs show every answer: no accordion.
- Must work at 390px wide with no horizontal scroll. Nav stacks under
  the logo below `sm`.

## 5. Product rules

- **No sign-in / accounts.** SceneHawk only searches a public corpus;
  there is nothing personal to protect. Don't add auth UI.
- "Cinematic match" scores are retrieval scores — always keep that
  label and the tooltip saying it's not a quality rating.
- Show provider notices (`result.note`) via `Notice`; never hide the
  fact that the app is running on heuristic/template fallbacks.
- Copy (from taste-skill `copy.md`): plain words a stranger gets in five
  seconds. The h1 names the category ("Film search by mood, not genre").
  The first screen holds one hard fact (the film count). Headings name a
  thing; never a question, command or metaphor ("Common questions", not
  "Questions, answered."). Buttons are a verb plus an object ("Find films",
  "Compare the systems"), never "Explore", "Discover" or "Learn more".
  No exclamation marks, no invented proof or numbers.
- Errors say what to do next. Loading labels end with `…` ("Sending…").

## 6. Accessibility

- Visible focus is global (`:focus-visible` accent outline) — don't remove.
- A "Skip to content" link is the first focusable element (layout).
- Inputs need a `<label>` (use `sr-only` if visual label is redundant),
  a `name`, and `autoComplete="off"` (they are not personal fields).
- Async results (chat log, answers) sit in `aria-live="polite"` regions.
- Icon-only controls need `aria-label`; decorative SVGs `aria-hidden`.
- Toggles: `aria-expanded` / `aria-current` / `aria-selected` as appropriate.
- Reduced motion is respected in `globals.css`.

## Checklist before finishing a UI change

0. Run the `web-design-guidelines` skill on the changed files.

1. `grep -rn "#[0-9a-fA-F]\{6\}" src/app src/components` → only `globals.css`.
2. `npx tsc --noEmit` and `npm run build` pass.
3. Screenshot the changed page at 1440px and 390px (Playwright is
   preinstalled) and check spacing, overflow, and contrast.
