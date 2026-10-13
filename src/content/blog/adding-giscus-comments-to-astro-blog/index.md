---
title: "Adding Giscus Comments to an Astro Blog"
description: "How I added GitHub Discussions-powered comments to this Astro portfolio with Giscus, why the repo needs to be public, and what parts of the configuration are safe to commit."
date: "Oct 13 2026"
tags:
  - astro
  - github
  - web
spaces:
  - homelab
---

I wanted a lightweight comment system for the technical notes on this site. The requirements were simple:

- Keep the site static.
- Avoid ad-heavy or tracker-heavy comment platforms.
- Let technical readers ask questions or leave corrections.
- Use an identity system that already makes sense for the audience.

That made [Giscus](https://giscus.app/) a good fit. It uses GitHub Discussions as the backend and embeds the discussion thread into each blog post.

## Why Giscus

For a technical blog, GitHub is a reasonable place for discussion. Most readers who want to comment on Kubernetes, SRE, GitOps, or infrastructure posts are likely to have a GitHub account already.

The tradeoff is also clear: comments are not anonymous and readers need GitHub to participate. For this site, that is acceptable. I prefer a smaller, higher-signal discussion area over a generic comment box.

## Making the repository public

Giscus requires the repository that stores the discussions to be public. In my case, that meant making the portfolio repository public:

```txt
Vamsi-344/vamsisethu-portfolio
```

Before doing that, I checked the repository history for secrets:

```bash
gitleaks detect --source . --no-banner --redact --exit-code 0
gitleaks detect --source . --no-banner --redact --exit-code 0 --log-opts="--all"
```

The scan found no leaks. I also checked that local tooling and generated files were ignored, including:

```txt
.kirograph/
.astro/
.agents/
.claude/
dist/
node_modules/
```

The only intentionally personal public asset is my resume PDF, which is already linked from the website for job opportunities.

## GitHub setup

The GitHub side has three steps.

First, enable Discussions on the repository:

```txt
Settings → Features → Discussions
```

Then create a discussion category for blog comments:

```txt
Name: Blog Comments
Format: Open-ended discussion
Description: Comments and discussions for blog posts on vamsisethu.com
```

Open-ended discussion is a better fit than Q&A because blog comments are usually questions, corrections, and related notes rather than one accepted answer.

Finally, install the Giscus GitHub App for the repository:

```txt
https://github.com/apps/giscus
```

## Giscus configuration

After the GitHub setup, Giscus generates an embed script from:

```txt
https://giscus.app
```

The important choices I used were:

```txt
Repository: Vamsi-344/vamsisethu-portfolio
Discussion category: Blog Comments
Mapping: pathname
Reactions: enabled
Input position: bottom
Theme: preferred_color_scheme
Language: en
```

Using `pathname` means each blog post URL maps to its own discussion. For example:

```txt
/blog/adding-giscus-comments-to-astro-blog/
```

gets a separate discussion thread from:

```txt
/blog/k3s-cis-benchmark-contribution/
```

## Is the Giscus config safe to commit?

Yes. The Giscus configuration is safe to include in a public repository.

Values like these are identifiers, not secrets:

```html
data-repo="Vamsi-344/vamsisethu-portfolio"
data-repo-id="YOUR_REPO_ID"
data-category="Blog Comments"
data-category-id="YOUR_CATEGORY_ID"
```

They tell the Giscus script which public repository and discussion category to use. They do not grant write access to the repository. Commenting still happens through GitHub authentication and the installed Giscus app.

The real considerations are not secret exposure, but product and moderation tradeoffs:

- The repository must be public.
- A third-party script from `https://giscus.app/client.js` loads on blog posts.
- Visitors need a GitHub account to comment.
- Discussions may need moderation if spam appears.

For this site, those tradeoffs are acceptable.

## Astro component

I added a dedicated component for the comments embed:

```astro
---
// src/components/GiscusComments.astro
---

<section class="animate mt-12 space-y-4 border-t border-black/10 pt-8 dark:border-white/10" aria-labelledby="discussion-heading">
  <div>
    <h2 id="discussion-heading" class="font-semibold text-black dark:text-white">Discussion</h2>
    <p class="mt-1 text-sm text-black/50 dark:text-white/55">
      Questions, corrections, or notes? Comment through GitHub Discussions.
    </p>
  </div>
  <div class="rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-white/[0.03]">
    <script
      is:inline
      src="https://giscus.app/client.js"
      data-repo="Vamsi-344/vamsisethu-portfolio"
      data-repo-id="YOUR_REPO_ID"
      data-category="Blog Comments"
      data-category-id="YOUR_CATEGORY_ID"
      data-mapping="pathname"
      data-strict="0"
      data-reactions-enabled="1"
      data-emit-metadata="1"
      data-input-position="bottom"
      data-theme="preferred_color_scheme"
      data-lang="en"
      crossorigin="anonymous"
      async
    ></script>
  </div>
</section>
```

The `is:inline` directive matters in Astro because the script should be emitted as written instead of being processed as a bundled component script.

## Adding comments to blog posts

Then I imported the component in the blog post route:

```astro
---
import GiscusComments from "@components/GiscusComments.astro";
---
```

and rendered it near the bottom of each post:

```astro
<GiscusComments />
```

I placed it after the previous/next post navigation. That keeps the reading experience clean: the article comes first, navigation comes next, and discussion is available after that.

## Verifying the setup

After wiring it in, I built the site locally:

```bash
pnpm build
```

Then the live-site checklist is:

1. Deploy the site.
2. Open a blog post.
3. Confirm the Discussion section loads.
4. Sign in with GitHub if needed.
5. Add a test comment.
6. Confirm a new GitHub Discussion appears under `Blog Comments`.

## Final thought

Giscus keeps comments close to the development workflow. The site remains static, the discussions live in GitHub, and each post gets a durable thread mapped by URL.

For a personal technical site, that feels like the right amount of interactivity without turning the blog into a full application.
