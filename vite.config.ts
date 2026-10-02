import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { seo } from "./seo";

export default defineConfig(({ mode }) => {
  // Title, description, social previews, structured data, robots.txt and sitemap follow VITE_BRAND (seo.ts).
  const env = { ...loadEnv(mode, process.cwd(), "VITE_"), ...process.env };
  return {
    base: "./",
    plugins: [react(), tailwindcss(), seo(env)],
  };
});
