---
name: scenehawk-design
description: SceneHawk's visual design system (the CoDeed house style) — color tokens, Fraunces/Inter/JetBrains Mono type, shared UI primitives, section bands, layout and copy rules. Use whenever adding or changing any page, component, or styling in src/app or src/components, so the site stays consistent.
---

# SceneHawk design system

SceneHawk uses the same house style as the team's CoDeed site
(github.com/Apurba0212/Codeed): warm ink background, paper-colored text, one
rust accent, an editorial serif, and mono labels. Calm, flat, full-width
sections divided by hairlines.

This skill wins where it conflicts with the general skills in this folder
(`design-taste-frontend`, `web-design-guidelines`, `image-to-code`).

## 1. Tokens — never hard-code hex

All colors live in `src/app/globals.css` under `@theme`. Use the generated
Tailwind utilities. A raw `#xxxxxx` in a `.tsx` file is a bug (the one
exception is `themeColor` in `layout.tsx`, which must be a literal).

| Token | Value | Use |
|---|---|---|
| `canvas` | #0E0E0C | page background (CoDeed `--ink`) |
| `surface` | #1A1A17 | alternate section bands, cards on canvas (`--ink-soft`) |
| `surface-2`, `surface-3` | | hover and selected states |
| `line` / `line-strong` | paper at 12% / 24% | hairlines / outlines, inputs, ghost buttons |
| `fg` | #F2EFE7 | headings, primary text (`--paper`) |
| `fg-muted` | #C9C4B6 | body copy (`--paper-dim`) |
| `fg-subtle` | #A39E90 | secondary info |
| `fg-faint` | #8A8678 | mono labels, meta, placeholders (`--paper-faint`) |
| `accent` | #C9542F | primary buttons, the accent word, active states |
| `warn` | | provider notices, low-confidence flags |

## 2. Typography

- `font-display` = **Fraunces**, weight 500, slight negative tracking:
  every heading and film title.
- `font-sans` = **Inter**: body text, buttons, nav.
- `font-mono` = **JetBrains Mono**: eyebrows, small uppercase labels, FAQ
  numbers (Q1…), score captions, the footer.
- Hero h1: `text-[clamp(38px,7vw,88px)] leading-[1.02] tracking-[-0.03em]`.
- Page h1 (`PageHeader`): `clamp(30px,4.4vw,48px)`.
- Section h2 (`SectionTitle`): `clamp(26px,3.6vw,38px)`; row-list headings
  `clamp(22px,3vw,30px)`; card h3 19–22px.
- One accent word per heading via `<Em>` (italic, rust): "you want to
  *feel.*", "Questions, *answered*". "Why SceneHawk" colors "SceneHawk"
  without italics.
- `<Eyebrow>`: mono, uppercase, 0.14em tracking, accent. `<Label>`: mono,
  uppercase, 0.08em, faint (e.g. "RESEARCH COMPARISON" beside a heading).

## 3. Primitives in `src/components/ui.tsx`

- `Container` / `containerClass`: 1180px column, `px-[clamp(20px,5vw,64px)]`.
  `main` is full width; every page wraps its content in `Container`.
- `Band`: full-width section with a top hairline; `soft` = `surface` band.
  The home page alternates canvas and soft bands.
- `Wordmark`: "Scene" + rust "Hawk" in Fraunces 600 (header).
- `buttonClass(variant, size)`: all **pill** (`rounded-full`).
  `primary` rust with paper text, `secondary` hairline ghost, `light` paper
  with ink text (the header CTA). Arrows are the text glyph `→` (`Arrow`).
- `Card` (`rounded-[14px]`, hairline; `tone="canvas"` inside a soft band).
- `Tag` (pill, hairline), `pillClass(active)` (clickable pills, the system
  switcher), `inputClass`, `Notice`, `PageHeader`, `SectionTitle`, `Label`.
- `Faq` (`src/components/Faq.tsx`): the CoDeed accordion — "Questions,
  *answered*" on the left, numbered Q1… rows on the right, one open at a
  time, the first open on load. Answers are arrays of paragraphs.

## 4. Layout patterns (from CoDeed's landing page)

- **Hero:** eyebrow, big serif h1, `fg-muted` lead (max 52ch), two pills.
  The SceneHawk hero copy ("Describe the film you want to *feel.*") was
  chosen by the team; don't rewrite it.
- **Card band:** soft band, SectionTitle + lead, auto-fit grid of canvas
  cards (title + one or two sentences).
- **Row list:** `grid gap-px bg-line rounded-[14px] overflow-hidden`, each row
  canvas with `hover:bg-surface-2`: name | description | mono label.
- **Why block:** two columns (`minmax(220px,0.8fr) 1.6fr`), heading left,
  stacked items with hairlines between them right. Stacks below 720px.
- **Closing:** centered serif line + one primary pill.
- **Footer:** two mono lines, faint.
- Header: sticky, `bg-canvas/70 backdrop-blur`, hairline under it; below
  720px the links fold into a menu button.
- Must work at 390px with no horizontal scroll.

## 5. Product rules

- **No sign-in / accounts.** SceneHawk only searches a public corpus.
- "Cinematic match" scores are retrieval scores: keep that label and the
  tooltip saying it's not a quality rating.
- Show provider notices (`result.note`) via `Notice`; never hide that the
  app is on heuristic/template fallbacks.
- Plain copy elsewhere: headings name a thing, buttons are a verb + object,
  errors say what to do next, loading labels end with `…`.

## 6. Accessibility

- "Skip to content" is the first focusable element (layout).
- Visible keyboard focus is global (`:focus-visible` rust outline).
- Inputs have a `<label>` (sr-only is fine), a `name`, `autoComplete="off"`.
- Accordions and menus use `aria-expanded` + `aria-controls`; the current nav
  item has `aria-current="page"`; async results sit in `aria-live="polite"`.
- Reduced motion is respected in `globals.css`.

## Checklist before finishing a UI change

0. Run the `web-design-guidelines` skill on the changed files.
1. `grep -rn "#[0-9a-fA-F]\{6\}" src/app src/components` → only `globals.css`
   and `themeColor`.
2. `npx tsc --noEmit` and `npm run build` pass.
3. Screenshot the changed page at 1440px and 390px (Playwright is
   preinstalled) and compare against the patterns above.
