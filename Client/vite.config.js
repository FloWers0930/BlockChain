import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  server: {
    host: "localhost",
    port: 5173,
    strictPort: true,
    hmr: {
      protocol: "ws",
      host: "localhost",
      port: 5173,
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

          // Maps
          if (id.includes("leaflet") || id.includes("react-leaflet")) {
            return "leaflet";
          }
          // Charts
          if (id.includes("recharts") || id.includes("d3-")) {
            return "charts";
          }
          // Socket
          if (id.includes("socket.io")) {
            return "socket";
          }
          // Axios
          if (id.includes("/axios/")) {
            return "axios";
          }
          // React core
          if (id.includes("react-dom")) return "react-dom";
          if (id.includes("react-router")) return "router";
          if (id.includes("/react/")) return "react";

          // Utilities
          if (id.includes("zxcvbn")) return "zxcvbn";
          if (id.includes("tesseract")) return "tesseract";
          if (id.includes("ethers")) return "ethers";
          if (id.includes("lodash")) return "lodash";
          if (
            id.includes("date-fns") ||
            id.includes("dayjs") ||
            id.includes("moment")
          )
            return "date";
          if (id.includes("framer-motion")) return "motion";

          // Everything else
          return "libs";
        },
      },
    },
  },

  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
});
