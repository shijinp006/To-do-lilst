import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Serves /api/read-todo during `npm run dev`, using the same handler Vercel runs in production.
function localApi() {
  return {
    name: "local-api",
    configureServer(server) {
      server.middlewares.use("/api/read-todo", async (req, res) => {
        let raw = "";
        for await (const chunk of req) raw += chunk;
        try {
          req.body = raw ? JSON.parse(raw) : {};
        } catch {
          req.body = {};
        }
        res.status = (code) => {
          res.statusCode = code;
          return res;
        };
        res.json = (data) => {
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(data));
        };
        const { default: handler } = await server.ssrLoadModule("/api/read-todo.js");
        await handler(req, res);
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  // Make ANTHROPIC_API_KEY from .env available to the local API handler.
  Object.assign(process.env, loadEnv(mode, process.cwd(), ""));
  return {
    plugins: [react(), tailwindcss(), localApi()],
  };
});
