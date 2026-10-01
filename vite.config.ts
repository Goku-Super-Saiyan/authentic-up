import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  // The page title follows VITE_BRAND, like the rest of the site (src/brand/brand.ts).
  const env = { ...loadEnv(mode, process.cwd(), "VITE_"), ...process.env };
  const title = (env.VITE_BRAND || "").toLowerCase() === "authentic" ? "Authentic UP · From their hands to your home" : "Incredible UP";
  return {
    base: "./",
    plugins: [react(), tailwindcss(), { name: "brand-title", transformIndexHtml: (html: string) => html.replace("<title>Incredible UP</title>", `<title>${title}</title>`) }],
  };
});
