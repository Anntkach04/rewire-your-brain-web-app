import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { apiPlugin } from "./vite-plugin-api";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), apiPlugin(env)],
    server: {
      host: "localhost",
      port: 5173,
      strictPort: false,
    },
  };
});
