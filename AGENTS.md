# Writing and publishing articles

This repository contains Vamsi's personal portfolio and technical blog. Articles should sound like thoughtful personal notes from an engineer, not generated documentation or marketing copy.

## Editorial voice

- Use first person when describing work, experiments, incidents, and decisions.
- Start with a concrete problem, surprising result, failure, or decision.
- Explain what was expected, what actually happened, and how it was investigated.
- Prefer specific observations over broad claims.
- Distinguish clearly between `I observed`, `I tested`, `I believe`, and general advice.
- Preserve uncertainty and limitations; do not turn one environment's result into a universal rule.
- Explain jargon in plain language before using it repeatedly.
- End with lessons learned, trade-offs, and what should be tested next.

## Recommended article shape

Use this structure when it fits:

1. Hook: the incident, question, or decision.
2. Context: environment, versions, constraints, and goal.
3. Expectation versus reality.
4. Investigation and evidence.
5. Solution or design.
6. Verification and measured outcome.
7. Trade-offs, limitations, and security considerations.
8. Practical takeaways.

Long articles should use descriptive headings, short paragraphs, tables where useful, and a contents section when navigation needs it.

## Technical quality

- Include tested versions and a `last verified` note for fast-changing tools or APIs.
- Make commands copy-pasteable: check quoting, paths, permissions, shell behavior, and required variables.
- Mark pseudocode, abbreviated examples, and placeholders explicitly.
- Include verification commands or observable success criteria after configuration steps.
- Link security-sensitive and provider-specific claims to authoritative upstream documentation.
- Do not claim `secure`, `production-ready`, `faster`, or `works everywhere` without evidence and scope.
- Separate personal experience from general recommendations.
- For benchmarks, state hardware, model/version, workload, warm-up, repetitions, and metrics.
- For incidents, preserve the symptom, key evidence, root cause, fix, and prevention.

## Privacy and disclosure

Before publishing, inspect every article and code block for:

- AWS account IDs and resource ARNs
- internal URLs, hostnames, IP addresses, and DNS names
- cluster names, certificate subjects, namespaces, secret paths, and repository names
- customer, employer, team, or proprietary system names
- credentials, tokens, encrypted values, logs, screenshots, and metadata
- topology details that reveal security boundaries or operational weaknesses

Replace internal details with meaningful placeholders such as `<cloud-account>`, `<cluster>`, `<internal-host>`, or `<provider>`. Do not assume that a value is safe merely because it is not a secret. When in doubt, keep exact operational notes private.

## Diagrams and media

Use Mermaid diagrams for relationships and flows: identity boundaries, Terraform/GitOps pipelines, certificate delivery, request paths, or failure dependencies. Add a short prose explanation and accessible text for each diagram.

Use a GIF or screenshot only when motion or visual evidence teaches something faster than prose, such as:

- a failure changing to success;
- an ArgoCD status transition;
- a certificate renewal;
- a benchmark comparison;
- a PR or deployment flow.

Do not add decorative media. Remove sensitive terminal output, URLs, names, and identifiers from captures.

## Review workflow

Before committing an article:

1. Read it as a newcomer with no repository context.
2. Confirm the opening explains why the reader should care.
3. Verify every command, link, version, and technical claim.
4. Check that observed facts are separated from advice.
5. Run a privacy/disclosure review.
6. Render the Astro site and inspect the page visually.
7. Run the project validation/build.
8. Commit only the approved article changes.

Publish articles individually. Do not publish drafts, internal runbooks, or provider-specific incident details without explicit sanitization and review.

## SEO and social metadata verification

For public pages, use these as manual review tools:

- [OpenGraph.xyz](https://www.opengraph.xyz/) for Open Graph previews;
- [Google Rich Results Test](https://search.google.com/test/rich-results) for structured data;
- Lighthouse or PageSpeed Insights for performance.

Treat external checkers as advisory, not as build dependencies or the source of truth. Before publishing, verify generated HTML locally for canonical URLs, title and description length, OG image dimensions and alt text, JSON-LD, `sitemap-index.xml`, and `robots.txt`. Do not add an X/Twitter account attribution unless the account actually exists.

## Design system (neobrutalist theme)

The site uses a neobrutalist theme: flat cream/charcoal surfaces with a dot grid, thick black borders, hard offset shadows (no blur), square-ish corners (6px), and bold saturated accents. When editing or adding UI, reuse the existing primitives instead of hand-rolling styles.

### Where things live

- `src/styles/global.css` — the theme core: design tokens (`--nb-shadow`, `--nb-dot`), all `.nb-*` component classes, long-form `article` styling, the entrance-animation and view-transition rules.
- `tailwind.config.mjs` — the `nb-*` colour palette, `shadow-nb*` tokens, `rounded-nb` (6px), and font families.
- `src/components/Head.astro` — font imports/preloads and the scroll-reveal (`animate()`) + theme (`preloadTheme`/`toggleTheme`) scripts.

### Primitives (prefer these over ad-hoc classes)

- Surfaces: `.nb-card`, `.nb-card-interactive`, `.nb-panel`.
- **Accent surfaces** (a fixed bright colour that must stay bright in BOTH themes): `.nb-accent-card`, `.nb-accent-card-interactive`.
- Buttons: `.nb-btn` and colour variants (`.nb-btn-pink`, `.nb-btn-blue`, `.nb-btn-green`, `.nb-btn-white`).
- Small bits: `.nb-tag`, `.nb-chip`, `.nb-h2` (section label, with `.blue/.green/.yellow/.purple/.orange` shadow variants), `.nb-mark`, `.nb-input`, `.nb-muted`.
- Interaction: `.nb-lift` (hover raise), `.nb-press` (press-in), `.nb-tilt-l/-r` (tilt that straightens on hover). List colour cycling via `.nb-cycle` + `.nb-accent`.

### Dark-mode rules — do not break these

- Every surface MUST set a background together with a readable text colour for both themes. A half-set pair renders invisible in dark mode.
- `.nb-card` flips its background to dark (`dark:bg-nb-card-dark`) in dark mode. `.nb-on-color` forces dark ink (`#111`) on its contents. **Never combine `nb-card`/`nb-card-interactive` with `nb-on-color` on a bright-accent surface** — the dark background wins and the forced dark ink becomes invisible (dark-on-dark). Use `.nb-accent-card` / `.nb-accent-card-interactive` instead: they keep the accent background in both themes.
- `.nb-on-color` is only for surfaces that stay a bright accent colour in both themes (hero, page heroes, connect block, accent cards). The dark shadow token is cream (`#f5f3ea`) so the hard offset still reads on the dark background.
- When adding a new accent card, verify it in BOTH light and dark before committing.

### Layout and width

- `src/components/Container.astro` is the shared page frame at `max-w-[70rem]` (1120px), matching the plan-doc reference. List/card pages use it full-width.
- Long-form reading columns (blog post, project detail) cap at `48rem` (~768px) for a comfortable measure. Keep any new article/reading page at the same width so content width is consistent across the site.

### Motion

- Entrance reveals use the `.animate` class plus the `IntersectionObserver` in `Head.astro`. It reveals in-view content immediately, pre-triggers ~120px before entering the viewport, and reveals INSTANTLY on view-transition navigations (`init(true)`), so internal nav does not re-fade.
- Astro's view-transition morph is disabled in CSS (`::view-transition-*`) to keep SPA navigation instant.
- All motion must respect `prefers-reduced-motion` (the global rule already disables transitions/animations under it). Animate only when motion carries meaning.

### Fonts

- Display + body are both **Space Grotesk** (the default `sans`); Inter is the fallback. Weights 400/500/600/700 are imported and 700 is preloaded in `Head.astro`. Lora (serif) is retained but unused by default.

### After any UI change

Run `pnpm build` (0 errors/warnings expected) and inspect the page in BOTH light and dark mode before committing. For local visual checks prefer `pnpm preview` (production build) over `pnpm dev` — the dev server compiles routes on demand and makes navigation feel artificially slow.
