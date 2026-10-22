import type { Site, Metadata, Socials } from "@types";

export const SITE: Site = {
  NAME: "Vamsi Krishna Sethu",
  EMAIL: "hello@vamsisethu.com",
  NUM_POSTS_ON_HOMEPAGE: 3,
  NUM_WORKS_ON_HOMEPAGE: 2,
  NUM_PROJECTS_ON_HOMEPAGE: 3,
};

export const HOME: Metadata = {
  TITLE: "SRE & Platform Engineer",
  DESCRIPTION: "Portfolio and technical writing by Vamsi Krishna Sethu, CNCF Kubestronaut and Site Reliability Engineer focused on Kubernetes, GitOps, and cloud infrastructure.",
};

export const BLOG: Metadata = {
  TITLE: "Blog",
  DESCRIPTION: "Technical notes on DevOps, SRE, Kubernetes, cloud infrastructure, automation, and platform engineering.",
};

export const WORK: Metadata = {
  TITLE: "Work",
  DESCRIPTION: "Software engineering experience across DevOps, SRE platforms, Kubernetes, OpenStack, OpenShift, GitOps, and observability.",
};

export const PROJECTS: Metadata = {
  TITLE: "Projects",
  DESCRIPTION: "Selected infrastructure, platform engineering, Kubernetes, storage, and MLOps projects.",
};

export const CERTIFICATIONS: Metadata = {
  TITLE: "Certifications",
  DESCRIPTION: "CNCF Kubestronaut — all five Kubernetes certifications (CKA, CKAD, CKS, KCNA, KCSA), verifiable on Credly.",
};

export const CERTS = {
  KUBESTRONAUT: {
    NAME: "CNCF Kubestronaut",
    ISSUER: "Cloud Native Computing Foundation",
    DESCRIPTION:
      "Awarded for earning all five active CNCF Kubernetes certifications. A single credential that represents the full set below.",
    HREF: "https://www.credly.com/badges/7d557f73-f029-4d2c-9aef-f8a47a3b97fc/public_url",
  },
  ITEMS: [
    {
      NAME: "Certified Kubernetes Administrator (CKA)",
      ISSUER: "The Linux Foundation · CNCF",
      HREF: "https://www.credly.com/badges/4e11eda4-d4eb-496e-b7e8-a4c2cd6b734d/public_url",
    },
    {
      NAME: "Certified Kubernetes Application Developer (CKAD)",
      ISSUER: "The Linux Foundation · CNCF",
      HREF: "https://www.credly.com/badges/fed6c02a-998c-4187-a9b7-8bb62ea7b5e6/public_url",
    },
    {
      NAME: "Certified Kubernetes Security Specialist (CKS)",
      ISSUER: "The Linux Foundation · CNCF",
      HREF: "https://www.credly.com/badges/e88b73aa-f609-4134-82dd-8f1b1b5d1385/public_url",
    },
    {
      NAME: "Kubernetes and Cloud Native Associate (KCNA)",
      ISSUER: "The Linux Foundation · CNCF",
      HREF: "https://www.credly.com/badges/e573accf-50e9-45c9-958c-6f18ef16ff34/public_url",
    },
    {
      NAME: "Kubernetes and Cloud Native Security Associate (KCSA)",
      ISSUER: "The Linux Foundation · CNCF",
      HREF: "https://www.credly.com/badges/be705bc6-96b7-4e77-aabb-f07fb7f1b727/public_url",
    },
  ],
};

export const SOCIALS: Socials = [
  { 
    NAME: "github",
    HREF: "https://github.com/Vamsi-344"
  },
  { 
    NAME: "linkedin",
    HREF: "https://www.linkedin.com/in/vamsi344/",
  },
  {
    NAME: "kubestronaut",
    HREF: "https://www.credly.com/badges/7d557f73-f029-4d2c-9aef-f8a47a3b97fc/public_url",
  },
  {
    NAME: "resume",
    HREF: "/Vamsi_Krishna_Sethu_Resume.pdf",
  },
  {
    NAME: "rss",
    HREF: "/rss.xml",
  }
];
