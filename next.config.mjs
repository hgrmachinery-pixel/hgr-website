import { withPayload } from "@payloadcms/next/withPayload";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    localPatterns: [{ pathname: "/api/machine-media/file/**" }],
  },
};

export default withPayload(nextConfig);
