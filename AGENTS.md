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
