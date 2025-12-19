/*import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
*/
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"), // alias @ -> src/
    },
  },
  server: {
    port: 5173,
    proxy: {
      // 👇 THÊM ĐOẠN NÀY ĐỂ API "/admin/..." CHẠY ĐƯỢC
      "/admin": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
      "/admin-auth": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
      "/recruiter": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
      "/candidate": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
      "/center": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
      "/requests": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
