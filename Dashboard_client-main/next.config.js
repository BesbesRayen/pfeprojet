/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',  // required for Docker multi-stage build
  images: {
    domains: ['lh3.googleusercontent.com', 'ui-avatars.com'],
  },
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8082'}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
