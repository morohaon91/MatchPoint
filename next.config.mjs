/** @type {import('next').NextConfig} */
import createMDX from "@next/mdx";

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: "arkena-coffee.s3.eu-central-1.amazonaws.com" },
    ],
  },
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
  optimizeFonts: false,
};

export default withMDX(nextConfig);
