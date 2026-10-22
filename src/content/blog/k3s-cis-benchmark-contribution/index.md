---
title: "What I Learned Contributing CIS Benchmark Updates to K3s"
description: "A practical look at investigating a K3s security documentation issue, comparing CIS Kubernetes Benchmark 2.1, and learning the project's required assessment workflow."
date: "Oct 6 2026"
tags:
  - kubernetes
  - k3s
  - security
  - open-source
spaces:
  - kubernetes
---

I investigated [K3s issue #14739](https://github.com/k3s-io/k3s/issues/14739) after noticing that a security-documentation update required more than changing a version string. The useful lesson was that benchmark claims need reproducible assessment output and project-specific review, not just polished prose.

This article describes that contribution workflow at the time of investigation. Benchmark versions, K3s release branches, and project submission requirements should be checked against the current upstream repository.

I initially treated it as a documentation update. That turned out to be only part of the work—and the most useful lesson was discovering how a security assessment must be generated and maintained, not just written.

## Reading the benchmark

The CIS Kubernetes Benchmark v2.1.0 targets Kubernetes v1.36 and v1.37. Compared with the existing K3s assessment, it introduces or highlights controls covering:

- Authentication mechanisms that should not be used by human users, including client certificates, service account tokens, and bootstrap tokens.
- Minimal and security-focused API server audit policies.
- Kubelet drop-in configuration directory permissions.
- Fine-grained kubelet API subresources instead of broad `nodes/proxy` access.
- Containers using unmasked `procMount` settings.

The release also updates references, changes some audit and remediation procedures, removes insecure cipher recommendations, and changes some controls between automated and manual assessment classifications.

## What automated and manual mean

In a CIS benchmark, an **automated** control is suitable for a repeatable scanner check. For example, a tool can reliably inspect whether a file has restrictive permissions or whether a command-line flag is present.

A **manual** control needs human or environment-specific judgment. For example, a scanner may find the configured cipher list, but deciding whether it is appropriate can depend on Kubernetes version, compatibility requirements, and the cluster's security policy.

A change from automated to manual does not necessarily mean that the security requirement became less important. It means that CIS no longer considers a generic machine-only pass/fail check sufficient. The reverse change means the control has become sufficiently well-defined for reliable automated validation.

## The first approach

I prepared a pull request in the K3s documentation repository that:

- Added a CIS 2.1 self-assessment page.
- Added the new controls and updated control classifications.
- Updated the security landing page, sidebar, and self-assessment redirect.
- Updated related hardening-guide references.

The documentation build, link checks, spell check, and DCO checks all passed.

The pull request was then closed by a maintainer—not because of a build failure, but because the assessment workflow was incomplete.

## The important project workflow

K3s does not create a CIS assessment page by manually copying the CIS PDF. The project-specific process is:

1. A generic CIS benchmark configuration is published.
2. The corresponding configuration is added to [kube-bench](https://github.com/aquasecurity/kube-bench/tree/main/cfg).
3. A K3s-specific configuration is derived from that generic version and previous K3s assessments.
4. The K3s configuration is published first in [Rancher's security-scan repository](https://github.com/rancher/security-scan/tree/main/package/cfg).
5. A hardened K3s cluster is scanned using the new configuration.
6. The resulting JSON report is converted to Markdown with K3s' [`kubebench-to-markdown.sh`](https://github.com/k3s-io/docs/blob/main/scripts/kubebench-to-markdown.sh) script.
7. The generated assessment page is submitted to the K3s documentation repository.

At the time of the contribution, the maintainer explained that K3s had a `k3s-cis-2.0` configuration, but there was not yet a valid generic CIS 2.1 kube-bench configuration to base a K3s-specific assessment on.

## What I took away

A benchmark document is not itself a security guarantee. Treat it as one input to a threat model, and validate the actual release configuration, host hardening, admission controls, secrets handling, and runtime exposure. Do not copy benchmark commands into production without checking what they read, change, or disclose.

The main lesson was that security documentation is often the output of a reproducible validation pipeline. A polished Markdown page is not enough if it cannot be traced back to the scanner configuration and a real hardened-cluster assessment.

The contribution was still valuable: it helped me understand the benchmark changes, the distinction between automated and manual controls, and the project's actual path for introducing a new security assessment. The next contribution should start with the benchmark configuration and test report, then generate the documentation from those artifacts.

That is a useful open-source lesson: before implementing the visible artifact, find out how the project produces and validates it.
