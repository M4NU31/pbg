const { createServer } = require("http");
const { parse } = require("url");
const { execSync } = require("child_process");
const next = require("next");

// Run DB migrations at startup (env vars are available here, not during build)
try {
  console.log("> Running database migrations...");
  execSync("npx prisma migrate deploy", {
    stdio: "inherit",
    cwd: __dirname + "/apps/web",
  });
  console.log("> Migrations complete.");
} catch (err) {
  console.error("> Migration failed:", err.message);
  process.exit(1);
}

const app = next({
  dev: false,
  dir: "./apps/web",
});
const handle = app.getRequestHandler();
const port = parseInt(process.env.PORT || "3000", 10);

app.prepare().then(() => {
  createServer((req, res) => {
    handle(req, res, parse(req.url, true));
  }).listen(port, "0.0.0.0", () => {
    console.log("> Ready on port " + port);
  });
});
