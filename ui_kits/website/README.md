# ui_kits/website — VerticalParts marketing site recreation

A click-through recreation of **verticalparts.com.br** built from the brand
tokens in `../../colors_and_type.css`.

> Goal: **pixel-credible**, not pixel-perfect — every component reuses the
> design system primitives so it can be lifted into mocks. Visual reference
> was the live site (May 2026 snapshot) — see `../../research/site-notes.md`.

## Files

| File | Role |
|---|---|
| `index.html` | Boots React + Babel and mounts `App` into the page. |
| `App.jsx` | Composes the page (nav → hero → trust → services → catalog → projects → FAQ → contact → footer) and owns light interactive state (FAQ accordion, mobile-nav, contact form). |
| `Header.jsx` | Top bar with phone/email strip + 80px dark nav + 2px yellow under-rule. |
| `Hero.jsx` | Full-bleed hero with photographic placeholder + eyebrow → display → body → 2 CTAs. |
| `TrustStats.jsx` | `+11 / +4 mil / +20` trio with display numbers in yellow on black. |
| `ServicesGrid.jsx` | 9 category cards (Elevadores, Escadas rolantes, Esteiras…). Sharp cards, yellow stripe top-left, image placeholder, ghost-outline CTA. |
| `FAQ.jsx` | Accordion with yellow `+` / `–` toggle and sentence-case questions. |
| `ContactBlock.jsx` | Right-aligned dark form section with two inputs, a select and a yellow submit. |
| `Footer.jsx` | Dark footer with negative-wordmark, contact list, links, copyright. |
| `primitives.jsx` | `<Button>`, `<Eyebrow>`, `<Rule>`, `<SectionLabel>` — load FIRST. |

## What the kit covers (and what it doesn't)

✅ Marketing home page  
✅ Nav, hero, services, FAQ, contact form, footer  
✅ Color/type/spacing match the design tokens  

❌ Inner product detail pages, blog posts, "Projetos" case-study pages  
❌ The standalone parts store at `lojaverticalparts.com` — separate kit needed  
❌ Real product photography (placeholder cells used)  

## Visual placeholders flagged
- Product/category photographs are not bundled. We render typed cells
  (uppercase category name on a neutral background). Drop your category JPGs
  into `ui_kits/website/img/` and update `ServicesGrid.jsx → CATEGORIES[…].img`.
- The header logo uses `../../assets/logo-verticalparts-white.png`, which is
  itself a wordmark placeholder. Replace once the real PNG is available.
