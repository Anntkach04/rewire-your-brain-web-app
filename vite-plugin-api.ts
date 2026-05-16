import type { IncomingMessage } from "node:http";
import type { Plugin } from "vite";
import { generateWithOpenAI, type GenerateRequest } from "./server/ai/generate";

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

export function apiPlugin(env: Record<string, string>): Plugin {
  return {
    name: "rewire-api-dev",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith("/api/generate")) return next();

        if (req.method === "GET") {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              ok: true,
              message: "Rewire API (dev). POST { mode, goals }.",
            }),
          );
          return;
        }

        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end("Method not allowed");
          return;
        }

        if (!env.OPENAI_API_KEY) {
          res.statusCode = 503;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              error: "OPENAI_API_KEY missing — add it to .env in the project folder",
            }),
          );
          return;
        }

        for (const [key, value] of Object.entries(env)) {
          if (value) process.env[key] = value;
        }

        try {
          const raw = await readBody(req);
          const body = JSON.parse(raw) as GenerateRequest;
          const result = await generateWithOpenAI(body);
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(result));
        } catch (error) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              error: error instanceof Error ? error.message : "Generation failed",
            })
          );
        }
      });
    },
  };
}
