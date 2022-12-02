/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  plugins: [["@mui/material" , { "ssr" : true }]],
}

module.exports = nextConfig
