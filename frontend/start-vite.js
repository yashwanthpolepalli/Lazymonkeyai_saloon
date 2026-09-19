import { createServer } from "vite";
import { fileURLToPath, URL } from "node:url";

async function start() {
  console.log("Starting Vite Salon OS Server...");
  const server = await createServer({
    configFile: fileURLToPath(new URL("./vite.config.ts", import.meta.url)),
    root: fileURLToPath(new URL(".", import.meta.url)),
    server: {
      port: 3000,
      host: "0.0.0.0",
    },
  });
  await server.listen();
  console.log("Vite Salon OS running on http://localhost:3000");
  server.printUrls();
}

start().catch((err) => {
  console.error("Vite startup error:", err);
});
