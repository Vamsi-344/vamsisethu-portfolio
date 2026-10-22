export const ACCENT = "#1D88B5";
export const ENCODED_ACCENT = "%231D88B5";

export const iconify = (name: string) =>
  `https://api.iconify.design/${name.replace(":", "/")}.svg?color=${ENCODED_ACCENT}`;

export type Space = {
  slug: string;
  name: string;
  description: string;
  logo: string;
};

export const SPACES: Space[] = [
  {
    slug: "kubernetes",
    name: "Kubernetes",
    description: "Cluster operations, controllers, GitOps delivery, and production platform patterns.",
    logo: iconify("simple-icons:kubernetes"),
  },
  {
    slug: "gitops",
    name: "GitOps",
    description: "Argo CD, agent workflows, CI/CD boundaries, and declarative delivery systems.",
    logo: iconify("simple-icons:argo"),
  },
  {
    slug: "aws-cloud",
    name: "AWS / Cloud",
    description: "AWS identity, EKS, cloud integrations, and hybrid infrastructure design.",
    logo: iconify("simple-icons:amazonwebservices"),
  },
  {
    slug: "observability",
    name: "Observability",
    description: "Metrics, dashboards, telemetry APIs, validation, and operational feedback loops.",
    logo: iconify("lucide:chart-no-axes-combined"),
  },
  {
    slug: "security",
    name: "Security",
    description: "Identity, PKI, secrets delivery, hardening, and trust boundaries.",
    logo: iconify("lucide:shield-check"),
  },
  {
    slug: "homelab",
    name: "Homelab",
    description: "Bare metal, Linux, self-hosted systems, networking, and personal infrastructure.",
    logo: iconify("lucide:server"),
  },
];

export const getSpace = (slug: string) => SPACES.find((space) => space.slug === slug);

export const getSpaces = (slugs: string[] = []) =>
  slugs.map(getSpace).filter((space): space is Space => Boolean(space));
