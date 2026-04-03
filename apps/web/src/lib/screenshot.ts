import path from "path";
import fs from "fs/promises";

const SCREENSHOTS_DIR = path.join(process.cwd(), "public", "screenshots");

export async function captureScreenshot(projectId: string, siteUrl: string): Promise<void> {
  await fs.mkdir(SCREENSHOTS_DIR, { recursive: true });

  // Import puppeteer dynamically so it doesn't affect client bundles
  const puppeteer = (await import("puppeteer")).default;

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto(siteUrl, { waitUntil: "networkidle2", timeout: 30000 });
    // Allow 3s for lazy-loaded/animated content to settle
    await new Promise<void>((r) => setTimeout(r, 3000));

    const outputPath = path.join(SCREENSHOTS_DIR, `${projectId}.jpg`);
    await page.screenshot({
      path: outputPath as `${string}.jpg`,
      type: "jpeg",
      quality: 82,
      clip: { x: 0, y: 0, width: 1280, height: 800 },
    });
  } finally {
    await browser.close();
  }
}

export async function deleteScreenshot(projectId: string): Promise<void> {
  const filePath = path.join(SCREENSHOTS_DIR, `${projectId}.jpg`);
  try {
    await fs.unlink(filePath);
  } catch {
    // File may not exist yet — ignore
  }
}
