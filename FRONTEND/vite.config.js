import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Set your desired port here (e.g., 5173 or 5174)
    strictPort: true, // Ensures Vite fails if the port is already in use
  },
});
