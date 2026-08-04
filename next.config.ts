import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next.js 16: Turbopack is the default bundler for dev & build.
  experimental: {
    // Enables the `use cache` directive (Cache Components).
    useCache: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
  // pdfkit loads its built-in standard fonts (Helvetica, Times, Courier, ...) at runtime via
  // `fs.readFileSync(__dirname + "/data/*.afm")` rather than a static import. Next.js's automatic
  // file tracing can't detect that dynamically-constructed path, so without this the .afm files
  // are silently missing from the deployed function bundle and PDF export fails at runtime with
  // an ENOENT error (works fine locally with node_modules present, breaks once built/deployed).
  outputFileTracingIncludes: {
    "/api/exports/**/*": ["./node_modules/pdfkit/js/data/**/*"],
  },
};

export default nextConfig;
