const path = require("path");
const { createServer } = require("http");
const { parse } = require("url");
const { exec } = require("child_process");
const next = require("next");

const ROOT = __dirname;
const WEB_DIR = path.join(ROOT, "apps/web");

const app = next({
  dev: false,
  dir: WEB_DIR,
});
const handle = app.getRequestHandler();
const port = parseInt(process.env.PORT || "3000", 10);

// Start the server first so static files respond immediately
app.prepare().then(() => {
  createServer((req, res) => {
    handle(req, res, parse(req.url, true));
  }).listen(port, "0.0.0.0", () => {
    console.log("> Ready on port " + port);

    // Run DB sync in background AFTER server is already accepting requests
    exec(
      "npx prisma db push --accept-data-loss",
      { cwd: WEB_DIR, env: process.env },
      (err, stdout, stderr) => {
        if (err) {
          console.error("> DB sync failed:", stderr || err.message);
        } else {
          console.log("> Database schema synced.");
        }
      }
    );
  });
}).catch((err) => {
  console.error("> Failed to start:", err);
  process.exit(1);
});
