# Portfolio Improvements Log

A record of intentional changes made to the site, with the reasoning behind
each — so future work (mine or another contributor's) understands *why* these
exist before changing them.

Date: 2026-09-21

## Summary

A focused pass to improve SEO, social sharing, correctness, and
maintainability. All changes keep the site a **pure static build** (no runtime
server), verified with a clean `pnpm build` (0 errors/warnings/hints, 17 pages).

---

## High impact

### 1. JSON-LD structured data
- **What:** Added a `structuredData` prop to `src/components/Head.astro`, passed
  through `src/layouts/PageLayout.astro`. Homepage emits `Person` schema;
  blog posts emit `BlogPosting` schema (author, date, image, keywords).
- **Why:** Machine-readable context lets search engines build a knowledge-graph
  entity for the author and makes posts eligible for rich results and Google
  Discover. Turns pages into recognized entities rather than plain HTML.

### 2. Per-post Open Graph images
- **What:** New build-time endpoint `src/pages/og/[...slug].png.ts` renders a
  1200×630 branded PNG per post (title + date + name/domain) using `satori`
  (SVG) + `sharp` (rasterize). Posts reference their own image via the `image`
  prop.
- **Why:** Branded, title-bearing share cards on LinkedIn/Twitter/Slack increase
  click-through vs. a generic logo. The audience skews LinkedIn-heavy.
- **Note:** Images are generated at build time into static PNGs — **zero runtime
  cost** on the static host. `satori` is pinned to an exact version.
- **Gotcha:** satori needs `woff`/`ttf`/`otf` fonts, **not** `woff2`. Fonts are
  read from `node_modules/@fontsource/inter/files/*.woff`.

### 3. 404 page
- **What:** `src/pages/404.astro` styled with the site layout, with links back to
  Home / Blog / Projects.
- **Why:** Broken links become a soft recovery instead of a bare host default
  page.

### 4. Blog post metadata
- **What:** Posts now show an author line alongside date and reading time.
- **Why:** Reinforces attribution (mirrors the structured data). The `<time>`
  element was already semantic via `FormattedDate`.

---

## Medium impact

### 5. Blog tags
- **What:** Added optional `tags: z.array(z.string())` to the blog schema in
  `src/content/config.ts`; renders tag pills on posts.
- **Why:** Topic signal for readers and groundwork for future tag filtering.
- **Usage:** Add `tags: ["kubernetes", "aws"]` to any post's frontmatter.

### 6. Template cleanup
- **What:** Removed Astro Nano demo leftovers — empty numbered blog dirs
  (`01`–`08`), `project-1`/`project-2`, root `_astro_nano.png` /
  `_deploy_*.svg` / `_lighthouse.png`, unused `public/` assets, and the unused
  `public/fonts/` directory (MonaSans / Atkinson).
- **Why:** ~600 KB+ of unused assets removed from the deploy; cleaner repo; no
  risk of accidentally publishing demo content. Fonts now come solely from
  `@fontsource` via preloads in `Head.astro`.

---

## Correctness

### 7. `readingTime` accuracy
- **What:** `src/lib/utils.ts` now strips fenced/inline code, MDX
  `import`/`export` lines, and markup before counting words; uses `Math.ceil`
  with a 1-minute floor.
- **Why:** The old version counted code blocks and imports as prose, inflating
  estimates for code-heavy posts. Accurate estimates keep reader trust.

### 8. Sitemap configuration
- **What:** `astro.config.mjs` sets `changefreq` / `priority` / `lastmod`
  (home = 1.0, blog index = 0.9, posts = 0.8) and a `filter` excluding the
  `/og/` image endpoints.
- **Why:** Gives crawlers prioritization hints so new posts index faster; keeps
  the sitemap limited to real pages.

---

## Implementation gotchas (for future edits)

- `Response` body for the OG endpoint must be `new Uint8Array(buffer)`, not a
  raw Node `Buffer` (type mismatch with the Web `Response` API).
- The JSON-LD `<script>` needs the `is:inline` directive to silence Astro's
  script-processing hint.
- The global `article` CSS in `src/styles/global.css` already applies
  `prose dark:prose-invert` — do **not** add `prose` again on the post
  `<article>` element.

## Follow-ups (not done)

- Theme-flash (FOUC) polish — low impact; current inline `preloadTheme()` runs
  early enough. Revisit only if a flash is observed.
- After deploying, resubmit the sitemap in Google Search Console — structured
  data and crawl changes take weeks to reflect.
