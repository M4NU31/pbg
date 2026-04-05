/**
 * Single source of truth for the embed script snippet.
 * Used in both EmbedSnippet (project settings) and CreateProjectDialog (step 2).
 */
export function buildEmbedSnippet(embedKey: string, embedUrl: string): string {
  const screenshotServer = process.env.NEXT_PUBLIC_SCREENSHOT_SERVER_URL;
  const screenshotLine = screenshotServer
    ? `\n  data-screenshot-server="${screenshotServer}"`
    : "";
  return `<script\n  src="${embedUrl}"\n  data-key="${embedKey}"${screenshotLine}\n  async\n></script>`;
}
