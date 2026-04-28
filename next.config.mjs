/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@sparticuz/chromium"]
  },
  webpack: (config) => {
    config.externals.push("@sparticuz/chromium");
    return config;
  }
};

export default nextConfig;