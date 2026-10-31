/** @type {import("next").NextConfig} */
const config = {
  images: { remotePatterns: [{ protocol: "https", hostname: "flagcdn.com" }] },
};

export default config;
