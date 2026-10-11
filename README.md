# Selected Work — Built by Sai

A self-contained interactive exhibition extracted from the **Selected work** section of the [main portfolio](https://github.com/builtbysai/builtbysai.github.io). The original portfolio was not modified.

**Live URL (once GitHub Pages is enabled):** https://builtbysai.com/showcase/

## What was extracted

All nine projects, original titles, categories, stacks, statuses, one-line descriptions, case-study copy, technical illustrations, hyperlinks and interactive embeds were carried over. The original case-study HTML is preserved as a `<template>` in `index.html`. Project metadata is embedded as JSON and read by `app.js`.

The original project screenshots are currently served from `https://builtbysai.com/screenshots/` so the showcase can reuse the exact existing images without copying unrelated portfolio files. If those source URLs are moved or removed, the gallery shows a designed fallback instead of a broken image. Full case studies retain the original screenshot URLs and embedded external demos.

## Design

Visual direction is inspired by the motion-first work of [Aristide Benoist](https://aristidebenoist.com/), **not** a reproduction of his copyrighted assets or site code.

- One project per viewport on desktop, tablet, and standard-size phones.
- Editorial typography, large framed imagery, minimal metadata and a compact numbered index.
- Arrow buttons, numbered project navigation, keyboard Left/Right, desktop wheel, and swipe gestures.
- Native accessible project dialog, deep links using original project IDs, browser Back and Escape.
- Reduced-motion fallback, visible keyboard focus, touch-friendly controls.
- Rich case studies containing the existing project narrative, real screenshots, links and opt-in live embeds.

The artwork for projects without screenshots is a purposely designed CSS illustration, not a screenshot or representation of actual app UI. There is no runtime framework and no scroll hijacking.

## Developing

Run a local static server in this directory:

```bash
python3 -m http.server 4173
```

Then visit `http://localhost:4173`. No production build step is required.

For browser tests:

```bash
npm install
npx playwright install chromium
npm test
```

Tests check **real browser behavior**, including project switching, case-study opening/closing, deep links, keyboard and mobile layouts. CI saves desktop and mobile screenshots to artifacts.

## GitHub Pages

This is a GitHub project site. To make it available at `https://builtbysai.com/showcase/`:

1. In **Settings → Pages** for this repository, choose **Deploy from a branch**.
2. Select **main** and **/(root)**, then save.
3. The existing main site (`builtbysai.github.io`) owns the `builtbysai.com` custom domain. Do **not** add a new `CNAME` in this project repository.
4. Wait for Pages to publish, then visit `https://builtbysai.com/showcase/`.

The GitHub Actions workflow in this repository performs browser QA; it does not override Pages deployment settings.

## Original work vs standalone edition

The source site uses a long sticky-scroll gallery on desktop and a stacked grid on mobile. This standalone edition retains its content and expands the design while fixing that interaction debt: one project in view at a time, with clear navigation and a full case-study layer. This is intentionally not a mirror of the unrelated About, Experience, Skills, Contact or Resume sections.

Project information stays here until explicitly updated; don't fabricate stats, screenshots, products, client names or live features.
