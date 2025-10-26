import type { NextConfig } from "next";

module.exports = {
  async rewrites() {
    return [
      {
        source: "/api/python/:video_id",
        destination: "http://127.0.0.1:5328/api/python/:video_id", // Proxy to FastAPI
      },
    ];
  },
};

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
