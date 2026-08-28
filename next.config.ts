import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
  serverExternalPackages: [
    "lightningcss",
    "lightningcss-darwin-arm64",
    "@tailwindcss/postcss",
    "@tailwindcss/node",
    "@tailwindcss/oxide",
  ],
  transpilePackages: ["docx-preview", "html2canvas", "mammoth"],
};

export default nextConfig;
