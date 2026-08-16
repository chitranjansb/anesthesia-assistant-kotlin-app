/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Service worker + manifest are served from /public as static files.
  // Custom SW registration happens in src/components/layout/pwa-register.tsx
};

export default nextConfig;
