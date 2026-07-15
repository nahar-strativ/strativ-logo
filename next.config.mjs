/** @type {import('next').NextConfig} */
const repo = 'strativ-logo' // GitHub repo name → served at /<repo>/ on Pages

const nextConfig = {
  output: 'export', // static HTML export into ./out (no server needed)
  basePath: `/${repo}`,
  assetPrefix: `/${repo}/`,
  trailingSlash: true, // Pages serves /path/ → /path/index.html
  images: { unoptimized: true },
}

export default nextConfig
