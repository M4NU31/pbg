export const EMBED_STYLES = `
  /* ── Theme tokens ── light by default, dark via prefers-color-scheme ─────── */
  :host {
    all: initial;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

    --pb-bg:           #ffffff;
    --pb-surface:      #f8fafc;
    --pb-muted:        #f1f5f9;
    --pb-border:       #e2e8f0;
    --pb-text:         #0f172a;
    --pb-text-muted:   #64748b;
    --pb-text-subtle:  #94a3b8;
    --pb-code-bg:      #f1f5f9;
    --pb-comment-bg:   #f8fafc;
    --pb-input-bg:     #ffffff;
    --pb-overlay-bg:   rgba(0,0,0,0.45);
    --pb-skeleton-a:   #e2e8f0;
    --pb-skeleton-b:   #f1f5f9;
    --pb-badge-bg:     #f1f5f9;
    --pb-badge-border: #e2e8f0;
  }

  @media (prefers-color-scheme: dark) {
    :host {
      --pb-bg:           #0f172a;
      --pb-surface:      #0f172a;
      --pb-muted:        #1e293b;
      --pb-border:       #1e293b;
      --pb-text:         #f1f5f9;
      --pb-text-muted:   #64748b;
      --pb-text-subtle:  #94a3b8;
      --pb-code-bg:      #1e293b;
      --pb-comment-bg:   #1e293b;
      --pb-input-bg:     #1e293b;
      --pb-overlay-bg:   rgba(0,0,0,0.6);
      --pb-skeleton-a:   #1e293b;
      --pb-skeleton-b:   #334155;
      --pb-badge-bg:     #1e293b;
      --pb-badge-border: #334155;
    }
  }

  * { box-sizing: border-box; }

  /* ── Trigger button ─────────────────────────────────────────────────────── */
  .pb-trigger {
    position: fixed;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    background: hsl(348,100%,52%);
    color: white;
    border: none;
    border-radius: 8px 0 0 8px;
    padding: 12px 10px;
    cursor: pointer;
    z-index: 2147483646;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.5px;
    box-shadow: -2px 0 12px rgba(0,0,0,0.2);
    transition: background 0.2s;
    writing-mode: vertical-rl;
    text-orientation: mixed;
  }
  .pb-trigger:hover  { background: hsl(348,100%,42%); }
  .pb-trigger.pb-active { background: hsl(348,100%,30%); }
  .pb-trigger svg { width: 18px; height: 18px; writing-mode: horizontal-tb; }

  /* ── Overlay backdrop ───────────────────────────────────────────────────── */
  .pb-overlay {
    position: fixed;
    inset: 0;
    background: var(--pb-overlay-bg);
    z-index: 2147483647;
    display: flex;
    align-items: stretch;
    justify-content: flex-end;
  }

  /* ── Slide-in panel ─────────────────────────────────────────────────────── */
  .pb-panel {
    background: var(--pb-bg);
    width: 520px;
    max-width: 100vw;
    height: 100%;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    border-left: 1px solid var(--pb-border);
    animation: pb-slide-in 0.22s cubic-bezier(0.4,0,0.2,1);
    color: var(--pb-text);
  }

  @keyframes pb-slide-in {
    from { transform: translateX(100%); }
    to   { transform: translateX(0); }
  }

  .pb-panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid var(--pb-border);
    position: sticky;
    top: 0;
    background: var(--pb-bg);
    z-index: 1;
    flex-shrink: 0;
  }

  .pb-panel-body {
    flex: 1;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    overflow-y: auto;
  }

  /* ── Close button ───────────────────────────────────────────────────────── */
  .pb-close-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--pb-text-muted);
    padding: 4px 6px;
    border-radius: 4px;
    font-size: 18px;
    line-height: 1;
    transition: color 0.15s, background 0.15s;
  }
  .pb-close-btn:hover { color: var(--pb-text); background: var(--pb-muted); }

  /* ── Section label ──────────────────────────────────────────────────────── */
  .pb-section-label {
    font-size: 11px;
    font-weight: 500;
    color: var(--pb-text-muted);
    margin-bottom: 6px;
  }

  /* ── Fields (report form) ───────────────────────────────────────────────── */
  .pb-field { margin-bottom: 14px; }

  .pb-label {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: var(--pb-text-subtle);
    margin-bottom: 5px;
  }

  .pb-input, .pb-textarea, select.pb-input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid var(--pb-border);
    border-radius: 6px;
    font-size: 14px;
    font-family: inherit;
    outline: none;
    background: var(--pb-input-bg);
    color: var(--pb-text);
    transition: border-color 0.15s;
  }
  .pb-input::placeholder, .pb-textarea::placeholder { color: var(--pb-text-muted); }
  .pb-input:focus, .pb-textarea:focus, select.pb-input:focus {
    border-color: hsl(348,100%,52%);
    box-shadow: 0 0 0 3px hsla(348,100%,52%,0.15);
  }
  select.pb-input option { background: var(--pb-input-bg); color: var(--pb-text); }
  .pb-textarea { resize: vertical; min-height: 80px; }
  .pb-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

  /* ── Badges ─────────────────────────────────────────────────────────────── */
  .pb-badge {
    display: inline-flex;
    align-items: center;
    padding: 2px 10px;
    border-radius: 9999px;
    font-size: 11px;
    font-weight: 600;
    border: 1px solid transparent;
  }
  .pb-badge-outline {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 10px;
    border-radius: 9999px;
    font-size: 11px;
    font-weight: 500;
    border: 1px solid var(--pb-badge-border);
    background: var(--pb-badge-bg);
    color: var(--pb-text-muted);
    max-width: 220px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .pb-badge-outline a { color: inherit; text-decoration: none; }

  /* ── Environment badges ─────────────────────────────────────────────────── */
  .pb-env-row { display: flex; flex-wrap: wrap; gap: 6px; }

  /* ── Screenshot ─────────────────────────────────────────────────────────── */
  .pb-sc-loader {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border: 1px dashed var(--pb-border);
    border-radius: 8px;
    background: var(--pb-muted);
    color: var(--pb-text-muted);
    font-size: 12px;
  }
  .pb-sc-spinner {
    width: 16px; height: 16px;
    border: 2px solid var(--pb-border);
    border-top-color: hsl(348,100%,52%);
    border-radius: 50%;
    animation: pb-spin 0.7s linear infinite;
    flex-shrink: 0;
  }
  @keyframes pb-spin { to { transform: rotate(360deg); } }

  .pb-screenshot-wrap {
    position: relative;
    border-radius: 6px;
    overflow: hidden;
    border: 1px solid var(--pb-border);
    cursor: zoom-in;
    background: var(--pb-muted);
  }
  .pb-screenshot-preview {
    width: 100%;
    max-height: 192px;
    object-fit: cover;
    object-position: top;
    display: block;
  }
  .pb-screenshot-expand {
    position: absolute;
    top: 6px; right: 6px;
    background: rgba(0,0,0,0.5);
    color: white;
    border: none;
    border-radius: 4px;
    padding: 4px 5px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.15s;
    font-size: 11px;
    font-weight: 500;
    font-family: inherit;
    gap: 3px;
  }
  .pb-screenshot-wrap:hover .pb-screenshot-expand { opacity: 1; }

  /* ── Element / code block ───────────────────────────────────────────────── */
  .pb-code {
    font-size: 12px;
    background: var(--pb-code-bg);
    border: 1px solid var(--pb-border);
    border-radius: 6px;
    padding: 6px 10px;
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
    color: var(--pb-text);
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* ── Comments ───────────────────────────────────────────────────────────── */
  .pb-comments-list { display: flex; flex-direction: column; gap: 16px; }
  .pb-comment { display: flex; flex-direction: column; gap: 3px; }
  .pb-comment-meta {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .pb-comment-author {
    font-size: 13px;
    font-weight: 600;
    color: var(--pb-text);
  }
  .pb-comment-date {
    font-size: 11px;
    color: var(--pb-text-muted);
  }
  .pb-comment-body {
    font-size: 13px;
    color: var(--pb-text);
    line-height: 1.55;
    white-space: pre-wrap;
    word-break: break-word;
  }
  .pb-no-comments {
    font-size: 13px;
    color: var(--pb-text-muted);
    text-align: center;
    padding: 8px 0;
  }

  /* ── Lightbox ───────────────────────────────────────────────────────────── */
  .pb-lightbox {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.88);
    z-index: 2147483647;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: zoom-out;
  }
  .pb-lightbox-img {
    max-width: calc(100vw - 48px);
    max-height: calc(100vh - 48px);
    border-radius: 8px;
    box-shadow: 0 8px 40px rgba(0,0,0,0.6);
    cursor: default;
  }
  .pb-lightbox-close {
    position: absolute;
    top: 16px; right: 16px;
    background: rgba(255,255,255,0.15);
    color: white;
    border: none;
    border-radius: 50%;
    width: 36px; height: 36px;
    font-size: 18px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s;
  }
  .pb-lightbox-close:hover { background: rgba(255,255,255,0.25); }

  /* ── Submit / primary button ────────────────────────────────────────────── */
  .pb-submit-btn {
    width: 100%;
    padding: 10px;
    background: hsl(348,100%,52%);
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s;
    font-family: inherit;
  }
  .pb-submit-btn:hover:not(:disabled) { background: hsl(348,100%,42%); }
  .pb-submit-btn:disabled { opacity: 0.6; cursor: default; }

  /* ── View in board button ───────────────────────────────────────────────── */
  .pb-view-board-btn {
    display: block;
    text-align: center;
    background: hsl(348,100%,52%);
    color: white;
    border-radius: 6px;
    padding: 10px;
    font-size: 14px;
    font-weight: 600;
    text-decoration: none;
    transition: background 0.15s;
    border: none;
    cursor: pointer;
    font-family: inherit;
    width: 100%;
  }
  .pb-view-board-btn:hover { background: hsl(348,100%,42%); }

  /* ── Tags ───────────────────────────────────────────────────────────────── */
  .pb-tags-grid { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px; }
  .pb-tag-option { cursor: pointer; }
  .pb-tag-pill {
    display: inline-block;
    padding: 3px 8px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 400;
    cursor: pointer;
    transition: opacity 0.15s, font-weight 0.1s;
    user-select: none;
  }

  /* ── Success state ──────────────────────────────────────────────────────── */
  .pb-success {
    text-align: center;
    padding: 40px 20px;
  }
  .pb-success-icon { font-size: 48px; margin-bottom: 12px; }
  .pb-success-title { font-size: 18px; font-weight: 700; color: var(--pb-text); margin-bottom: 8px; }
  .pb-success-text { font-size: 14px; color: var(--pb-text-muted); }

  /* ── Loading skeleton ───────────────────────────────────────────────────── */
  .pb-skeleton {
    background: linear-gradient(90deg, var(--pb-skeleton-a) 25%, var(--pb-skeleton-b) 50%, var(--pb-skeleton-a) 75%);
    background-size: 200% 100%;
    animation: pb-shimmer 1.4s infinite;
    border-radius: 6px;
  }
  @keyframes pb-shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
  /* ── Info box (kept for report form env display) ────────────────────────── */
  .pb-info-box {
    background: var(--pb-muted);
    border: 1px solid var(--pb-border);
    border-radius: 8px;
    padding: 10px 12px;
    font-size: 12px;
    color: var(--pb-text-subtle);
  }
  .pb-info-row {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 3px 0;
  }
  .pb-info-row:not(:last-child) { border-bottom: 1px solid var(--pb-border); }
  .pb-info-icon { flex-shrink: 0; margin-top: 1px; }
  .pb-info-val { color: var(--pb-text); word-break: break-all; }
`;
