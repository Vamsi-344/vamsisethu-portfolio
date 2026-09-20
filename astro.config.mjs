import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
  site: "https://www.vamsisethu.com",
  integrations: [
    mdx(),
    sitemap({
      changefreq: "weekly",
      priority: 0.7,
      lastmod: new Date(),
      filter: (page) => !page.includes("/og/"),
      serialize(item) {
        // Home page: highest priority, changes more often.
        if (item.url === "https://www.vamsisethu.com/") {
          item.changefreq = "weekly";
          item.priority = 1.0;
        } else if (item.url.includes("/blog/") && item.url !== "https://www.vamsisethu.com/blog/") {
          // Individual blog posts.
          item.changefreq = "monthly";
          item.priority = 0.8;
        } else if (item.url.endsWith("/blog/")) {
          item.changefreq = "weekly";
          item.priority = 0.9;
        }
        return item;
      },
    }),
    tailwind(),
  ],
});
