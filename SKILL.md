---
name: vpprd-design
description: Use this skill to generate well-branded interfaces and assets for vpprd / VerticalParts (Brazilian B2B supplier of elevators, escalators, moving walkways and replacement parts), either for production or throwaway prototypes/mocks. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping in Portuguese (pt-BR).
user-invocable: true
---

Read the `README.md` file within this skill, and explore the other available
files. Highlights:

- `colors_and_type.css` is the single token source — link it in any HTML you
  generate (`<link rel="stylesheet" href="colors_and_type.css">`) and put
  `class="vp"` on `<body>`.
- `preview/` holds atomic component samples (buttons, badges, cards, nav,
  etc.). Copy-paste from these rather than inventing.
- `ui_kits/website/` is the recreation of `verticalparts.com.br` — modular
  React components plus a working `index.html`.
- `assets/` has the (placeholder) brand wordmark and round "selo" badge.

**Voice & copy rules** (see README CONTENT FUNDAMENTALS):
- Portuguese (pt-BR), direct technical tone, no emoji.
- Headings, buttons, badges and eyebrows are **UPPERCASE**.
- Body copy is sentence case; numbers carry trust signals
  (`+11 anos`, `+4 mil peças`).
- Primary CTA always ends with `→`. The arrow is text, not an icon.

**Visual rules** (see README VISUAL FOUNDATIONS):
- Yellow `#F5C400` + Black + White. Status colors do not become brand accents.
- Default radius is 0 (sharp industrial blocks). Soft only for inputs (`--r-sm`)
  and KPI cards (`--r-md`). Pills (`--r-pill`) only for SKU/tag badges.
- Hover lifts cards 3px and swaps border to yellow. Primary buttons add a
  solid black offset block (`--shadow-yellow`), not a soft glow.
- No gradients, no glass/blur, no emoji icons. Use Lucide stroke icons via
  CDN if needed.

If creating visual artifacts (slides, mocks, throwaway prototypes), copy
assets out and create static HTML files for the user to view. If working on
production code, copy assets and follow the rules in `README.md` to become
an expert in designing with this brand.

If the user invokes this skill without other guidance, ask them what they
want to build or design, ask a few focused questions (audience, surface,
desired variations), and act as an expert designer who outputs HTML
artifacts _or_ production code, depending on the need.
