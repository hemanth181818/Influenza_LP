import { defineConfig, loadEnv, type Plugin, type ViteDevServer } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";
import type { IncomingMessage, ServerResponse } from "http";

/**
 * Dev-only adapter that serves the Vercel edge functions in /api during
 * `vite dev`, so the CRM (and signup) work locally without `vercel dev` /
 * Vercel auth. It maps /api/<path> to ./api/<path>.ts, loads the handler via
 * Vite's SSR module loader (TS-aware), converts the Node request into a Web
 * Request, runs the handler, and writes the Web Response back.
 *
 * Production is unaffected — Vercel builds /api itself and this plugin only
 * applies when serving.
 */
function apiDevServer(): Plugin {
  return {
    name: "local-api-dev-server",
    apply: "serve",
    configResolved() {
      // Make .env values visible to the edge handlers (they read process.env).
      const env = loadEnv("development", process.cwd(), "");
      for (const [k, v] of Object.entries(env)) {
        if (process.env[k] === undefined) process.env[k] = v;
      }
    },
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next) => {
        const url = req.url || "";
        if (!url.startsWith("/api/")) return next();

        // Resolve /api/<path>[?query] -> ./api/<path>.ts
        const clean = url.split("?")[0].replace(/\/+$/, "");
        const rel = clean.slice("/api/".length);
        if (!rel || rel.startsWith("_")) return next();

        const file = path.resolve(__dirname, "api", `${rel}.ts`);
        if (!fs.existsSync(file)) {
          res.statusCode = 404;
          res.setHeader("content-type", "application/json");
          res.end(JSON.stringify({ ok: false, error: `No API route: /api/${rel}` }));
          return;
        }

        try {
          const mod = await server.ssrLoadModule(file);
          const handler = mod.default as (r: Request) => Promise<Response> | Response;
          if (typeof handler !== "function") {
            throw new Error(`API route /api/${rel} has no default export`);
          }

          // Buffer the request body for non-GET/HEAD methods.
          const method = req.method || "GET";
          let body: Buffer | undefined;
          if (method !== "GET" && method !== "HEAD") {
            const chunks: Buffer[] = [];
            for await (const chunk of req) {
              chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
            }
            body = Buffer.concat(chunks);
          }

          const headers = new Headers();
          for (const [k, v] of Object.entries(req.headers)) {
            if (v === undefined) continue;
            headers.set(k, Array.isArray(v) ? v.join(", ") : String(v));
          }

          const request = new Request(`http://localhost${url}`, {
            method,
            headers,
            body: body && body.length ? body : undefined,
          });

          const response = await handler(request);

          res.statusCode = response.status;
          response.headers.forEach((value, key) => {
            if (key.toLowerCase() === "set-cookie") return; // handled below
            res.setHeader(key, value);
          });
          // Preserve Set-Cookie (may be multiple).
          const getSetCookie = (response.headers as unknown as {
            getSetCookie?: () => string[];
          }).getSetCookie;
          const cookies = getSetCookie
            ? getSetCookie.call(response.headers)
            : response.headers.get("set-cookie")
            ? [response.headers.get("set-cookie") as string]
            : [];
          if (cookies.length) res.setHeader("set-cookie", cookies);

          const buf = Buffer.from(await response.arrayBuffer());
          res.end(buf);
        } catch (err) {
          console.error(`[local-api] /api/${rel} failed`, err);
          res.statusCode = 500;
          res.setHeader("content-type", "application/json");
          res.end(
            JSON.stringify({
              ok: false,
              error: err instanceof Error ? err.message : "API error",
            })
          );
        }
      });
    },
  };
}

export default defineConfig({
  server: {
    host: "::",
    port: 3010,
  },
  plugins: [react(), apiDevServer()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ["three"],
          motion: ["framer-motion"],
          react: ["react", "react-dom"],
          charts: ["chart.js", "react-chartjs-2"],
        },
      },
    },
  },
});
