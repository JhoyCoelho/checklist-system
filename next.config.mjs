/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["@sparticuz/chromium"],

  turbopack: {} // necessário pra evitar conflito com webpack
};

export default nextConfig;