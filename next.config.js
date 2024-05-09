/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, options) => {
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      exclude: /node_modules/,
      use: ["raw-loader", "glslify-loader"],
    });

    config.module.rules.push({
      test: /\.(wgsl)$/,
      loader: "ts-shader-loader",
    });

    return config;
  },
};

module.exports = nextConfig;
