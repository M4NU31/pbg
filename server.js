const path = require("path");
const { createServer } = require("http");
const { parse } = require("url");
const { execSync } = require("child_process");
const next = require("next");

const ROOT = __dirname;
const WEB_DIR = path.join(ROOT, "apps/web");

// Push schema to DB on startup (creates tables if they don't exist)
try {
  console.log("> Syncing database schema...");
  execSync("npx prisma db push --accept-data-loss", {
    stdio: "inherit",
    cwd: WEB_DIR,
    env: process.env,
  });
  console.log("> Database ready.");
} catch (err) {
  console.error("> DB sync failed:", err.message);
}

const app = next({
  dev: false,
  dir: WEB_DIR,
});
const handle = app.getRequestHandler();
const port = parseInt(process.env.PORT || "3000", 10);

app.prepare().then(() => {
  createServer((req, res) => {
    handle(req, res, parse(req.url, true));
  }).listen(port, "0.0.0.0", () => {
    console.log("> Ready on port " + port);
  });
}).catch((err) => {
  console.error("> Failed to start:", err);
  process.exit(1);
});
