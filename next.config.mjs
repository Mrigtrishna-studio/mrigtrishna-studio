/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Prevents double-rendering issues
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-94383f540e2c4255ae6e6d419a7b2914.r2.dev', // Whitelist your Cloudflare R2
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb', // Allow large uploads
    },
  },
};

export default nextConfig;