import type { NextConfig } from "next";

const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: [
    "http://localhost:3000",       // localhost
    "http://127.0.0.1:3000",       // loopback
    "http://192.168.1.24:3000",    // IP dev dari PC / HP
  ],
};

module.exports = nextConfig;