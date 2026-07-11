/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["@sparticuz/chromium"],
  allowedDevOrigins: ["192.168.1.6"],
  devIndicators: false,
};

export default nextConfig;