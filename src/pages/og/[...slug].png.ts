import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import satori from "satori";
import sharp from "sharp";
import { readFile } from "node:fs/promises";
import { SITE } from "@consts";

// Pre-load fonts once at module scope (woff is supported by satori; woff2 is not).
const interRegular = await readFile(
  "node_modules/@fontsource/inter/files/inter-latin-400-normal.woff"
);
const interSemiBold = await readFile(
  "node_modules/@fontsource/inter/files/inter-latin-600-normal.woff"
);

function formatDate(date: Date) {
  return Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);
}

// satori accepts a React-element-like object tree; build it without JSX.
function h(type: string, props: Record<string, unknown>): object {
  return { type, props };
}

async function renderOG(title: string, subtitle: string): Promise<Buffer> {
  const svg = await satori(
    h("div", {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: "#0a0a0a",
        color: "#ffffff",
        padding: "80px",
        fontFamily: "Inter",
      },
      children: [
        h("div", {
          style: { display: "flex", fontSize: 28, color: "#a1a1aa" },
          children: subtitle,
        }),
        h("div", {
          style: {
            display: "flex",
            fontSize: 64,
            fontWeight: 600,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
          },
          children: title,
        }),
        h("div", {
          style: {
            display: "flex",
            fontSize: 30,
            color: "#a1a1aa",
          },
          children: SITE.NAME + "  ·  vamsisethu.com",
        }),
      ],
    }),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Inter", data: interRegular, weight: 400, style: "normal" },
        { name: "Inter", data: interSemiBold, weight: 600, style: "normal" },
      ],
    }
  );

  return sharp(Buffer.from(svg)).png().toBuffer();
}

export async function getStaticPaths() {
  const posts = (await getCollection("blog")).filter((p) => !p.data.draft);
  return posts.map((post) => ({
    params: { slug: post.slug },
    props: {
      title: post.data.title,
      subtitle: formatDate(post.data.date),
    },
  }));
}

type Props = { title: string; subtitle: string };

export const GET: APIRoute = async ({ props }) => {
  const { title, subtitle } = props as Props;
  const png = await renderOG(title, subtitle);
  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
