---
title: "Canonical JAAS Edge POC — Managing Multi-Site Infrastructure with Juju at Scale"
description: "A deep-dive into our Proof of Concept evaluating Canonical's JAAS (Juju-as-a-Service) for managing edge Kubernetes clusters from a central AWS EKS control plane, covering architecture, setup, findings, and production considerations."
date: "Jul 21 2026"
spaces:
  - kubernetes
  - aws-cloud
  - homelab
---

I investigated Canonical's JAAS (Juju-as-a-Service) ecosystem because managing distributed edge infrastructure was becoming a coordination problem, not just a provisioning problem. This post records what I observed in a time-bounded proof of concept: connecting edge Juju controllers to a central management plane running on AWS EKS, with connectivity provided by Tailscale.

The findings are POC results, not a production recommendation. Product names, APIs, pricing, and supported architectures can change; verify them against current Canonical documentation before adopting this design.

## What is Juju?

As per Canonical's documentation:

> Juju is an open source application orchestration engine that enables any application operation (deployment, integration, lifecycle management) on any infrastructure (Kubernetes or otherwise) at any scale (development or production) in the same easy way (typically, one line of code), through special operators called 'charms'.

Think of Juju like a Kubernetes operator — but broader. While a Kubernetes operator manages application state based on a CRD and can only be deployed on Kubernetes, Juju can be deployed on VMs, LXD containers, and Kubernetes clusters across different clouds (local, AWS, GCP, Azure). It handles multiple applications by deploying bundles/pods called **charms**.

## What is JAAS?

JAAS (Juju-as-a-Service) is a control plane service that connects all Juju controllers spread across infrastructure/sites at a single place.

It has a backend API server named **JIMM** (Juju Infinite Model Manager), which sits centrally and connects downstream Juju controllers. Admins and users interact with all downstream controllers via the `juju` CLI with an additional plugin (`juju-jaas`) or via Juju's Terraform provider.

## Why This POC Exists

We needed to evaluate:
- The functionality of JAAS and Juju
- How easy it is to provision infrastructure and leverage Ubuntu Pro subscriptions efficiently
- Difficulties and caveats of the technology stack

## Goals

1. Setup Juju controller(s)
2. Setup JAAS (JIMM + Canonical IAM + Juju Dashboard)
3. Connect existing Juju controllers to our central JAAS
4. Interact with JAAS to deploy Charmed Kubernetes on edge infrastructure

## Architecture Overview

### Components

| Component | Purpose |
|-----------|---------|
| **AWS EKS** | Hosts the central management plane |
| **Canonical IAM (Identity Platform)** | Provides identity/authentication services |
| **JIMM/JAAS** | Central control plane connecting downstream controllers |
| **Juju Dashboard** | Web UI for managing models and applications |
| **Tailscale** | Provides secure mesh connectivity between cloud and edge |
| **MicroK8s** | Lightweight Kubernetes on edge VMs |
| **MAAS/LXD** | Bare-metal/container provisioning at edge sites |
| **Charmed Kubernetes** | Production-grade Kubernetes deployed via Juju |

### Control Plane vs Managed Clusters

- **Control Plane (AWS EKS):** Runs JAAS/JIMM, Canonical IAM, Vault, and Juju Dashboard
- **Edge Sites:** Run MicroK8s or MAAS-based Juju controllers, registered with JAAS

### Connectivity Model

Tailscale provides the mesh network between the EKS-hosted control plane and edge Juju controllers. An egress service in EKS allows JIMM to reach edge controllers via Tailscale's private network.

## Technology Stack

| Technology | Version/Notes |
|-----------|---------------|
| AWS EKS | Management plane hosting |
| Juju | Orchestration engine |
| JIMM | Juju Infinite Model Manager |
| Canonical IAM | Identity Platform (Kratos/Hydra based) |
| Vault | Secrets management for JIMM |
| Tailscale | Mesh VPN for edge connectivity |
| MicroK8s | Lightweight K8s for edge controllers |
| MAAS | Metal-as-a-Service for bare-metal provisioning |
| LXD | System container manager |
| Charmed Kubernetes | Production K8s via Juju charms |

## Key Setup Steps

### 1. Management EKS + IAM + JAAS Setup

The central management plane setup involves:
- Adding EKS to Juju as a cloud/credential
- Deploying Canonical IAM (Identity Platform) on EKS
- Creating IAM admin users
- Deploying JIMM/JAAS with Vault integration
- Configuring JIMM to use IAM for authentication
- Deploying the Juju Dashboard

### 2. MicroK8s Edge Controller Setup

For each edge site:
- Install MicroK8s and Juju on the edge VM
- Add MicroK8s to Juju as a cloud
- Bootstrap an edge Juju controller
- Expose the controller API locally
- Install Tailscale on the edge VM
- Create a Tailscale egress service in EKS
- Register the MicroK8s controller in JAAS/JIMM
- Upload credentials and add models through JAAS

### 3. MAAS/LXD Lab Setup (for bare-metal edge)

- Enable HTTPS for MAAS
- Configure LXD bridge for MAAS-managed machines
- Register LXD host in MAAS
- Bootstrap an edge Juju controller on MAAS
- Add edge models through JAAS

### 4. Charmed Kubernetes Deployment

- Login to JAAS
- Provision MAAS machines
- Deploy a reduced Charmed Kubernetes bundle

## POC Findings

### Pros

- **Unified Management:** JAAS provides a single pane of glass for all Juju controllers across sites
- **Flexible Substrate Support:** Juju works across K8s, VMs, LXD, and bare-metal (MAAS)
- **Charm Ecosystem:** Rich library of pre-built operators for common workloads
- **Model-Driven Operations:** Declarative approach to infrastructure and application management
- **Tailscale Integration:** Simple, secure connectivity between cloud and edge without complex VPN setup

### Cons and Gaps

- **Complexity:** The full stack (EKS + IAM + JIMM + Vault + Tailscale + Juju) has many moving parts
- **Documentation Gaps:** Some integration scenarios lack clear documentation
- **Maturity:** Certain components (especially JIMM) are still evolving
- **Learning Curve:** Teams need to learn Juju's model/charm concepts in addition to existing tooling
- **Debugging:** When things go wrong, troubleshooting across the distributed system can be challenging

### Production Considerations

- **High Availability:** JIMM and IAM need HA configurations for production
- **Backup/Recovery:** Juju controller state backup and restoration procedures must be established
- **Network Reliability:** Edge connectivity via Tailscale must be monitored and have fallback paths
- **Security:** Certificate management, secret rotation (Vault), and IAM policies need hardening
- **Scalability:** Testing with larger numbers of edge controllers and models is recommended

### Security and operational boundaries

A central management plane increases consistency but also concentrates control. Before production use, define which operators can manage which models, isolate management traffic from workload traffic, rotate join credentials, restrict Tailscale routes, and test controller recovery without the management plane. Keep lab endpoints, credentials, and topology details out of public documentation.

## Overall Takeaway

JAAS/Juju provides a viable path for managing distributed infrastructure at scale, particularly in scenarios with mixed substrates (K8s + bare-metal + VMs). The technology is most valuable when:

1. You have many sites to manage centrally
2. You want consistent deployment patterns across heterogeneous infrastructure
3. You're already invested in the Ubuntu/Canonical ecosystem
4. You need operator-pattern lifecycle management beyond what basic Helm/Kustomize provides

However, the operational complexity is significant, and teams should carefully weigh this against simpler alternatives (like ArgoCD/Fleet for pure Kubernetes environments) before committing to the full JAAS stack in production.

---

*This documentation was generated from our internal POC notes covering AWS EKS management plane, Canonical IAM, JIMM/JAAS, Juju Dashboard, Tailscale edge connectivity, MAAS/LXD lab setup, MicroK8s edge controller, and Charmed Kubernetes deployment.*
