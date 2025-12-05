/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@coupon-management/ui', '@coupon-management/core', '@coupon-management/supabase'],
};

module.exports = nextConfig;
