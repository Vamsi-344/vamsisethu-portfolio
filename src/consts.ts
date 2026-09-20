import type { Site, Metadata, Socials } from "@types";

export const SITE: Site = {
  NAME: "Vamsi Krishna Sethu",
  EMAIL: "hello@vamsisethu.com",
  NUM_POSTS_ON_HOMEPAGE: 3,
  NUM_WORKS_ON_HOMEPAGE: 2,
  NUM_PROJECTS_ON_HOMEPAGE: 3,
};

export const HOME: Metadata = {
  TITLE: "Home",
  DESCRIPTION: "Portfolio and technical writing by Vamsi Krishna Sethu, a DevOps and Site Reliability Engineer focused on Kubernetes, cloud infrastructure, GitOps, and observability.",
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
    NAME: "resume",
    HREF: "/Vamsi_Krishna_Sethu_Resume.pdf",
  }
];
