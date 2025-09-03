/** @type {import('next').NextConfig} */
const nextConfig = {
typescript: {
  ignoreBuildErrors: true,
},
eslint: {
  ignoreDuringBuilds: true,
},


  reactStrictMode: true,
  images: {
    domains: ["localhost", "res.cloudinary.com"],
  },
};

module.exports = nextConfig;
