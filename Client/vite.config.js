import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@api": path.resolve(__dirname, "./src/api"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@pages": path.resolve(__dirname, "./src/pages"),
      "@providers": path.resolve(__dirname, "./src/providers"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@router": path.resolve(__dirname, "./src/router"),
      "@styles": path.resolve(__dirname, "./src/styles"),
    },
  },

  server: {
    host: "localhost",
    port: 5173,
    strictPort: true,
    hmr: { protocol: "ws", host: "localhost", port: 5173 },

    // ✅ FIX: Allow Vite to serve files from the parent directory (root node_modules)
    fs: {
      allow: [".."],
    },

    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, "/api"),
      },
    },
  },

  build: {
    outDir: "dist",
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("leaflet") || id.includes("react-leaflet"))
            return "leaflet";
          if (id.includes("recharts") || id.includes("d3-")) return "charts";
          if (id.includes("socket.io")) return "socket";
          if (id.includes("/axios/")) return "axios";
          if (id.includes("react-dom")) return "react-dom";
          if (id.includes("react-router")) return "router";
          if (id.includes("/react/")) return "react";
          if (id.includes("zxcvbn")) return "zxcvbn";
          if (id.includes("ethers")) return "ethers";
          if (id.includes("lodash")) return "lodash";
          if (id.includes("framer-motion")) return "motion";
          return "libs";
        },
      },
    },
  },

  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
});

