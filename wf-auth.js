/**
 * wf-auth.js — n-able Wireframe Access Protection
 * Hosted at: https://xDiehard13x.github.io/wireframes/wf-auth.js
 *
 * Include in any wireframe's <head>:
 *   <script src="https://xDiehard13x.github.io/wireframes/wf-auth.js"></script>
 *
 * To change the password:
 *   1. Run in browser console:
 *      crypto.subtle.digest('SHA-256', new TextEncoder().encode('new-password'))
 *        .then(b => console.log([...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')))
 *   2. Replace PASSWORD_HASH below and re-push this file.
 *      All wireframes update automatically — no other changes needed.
 */

(function () {
  const PASSWORD_HASH = "62670334880e11495d987a1a6d3a96b73eb7fc2ac4143bf631d522d439e0dfe8";
  const SESSION_KEY   = "wf_gate_session";
  const SESSION_DAYS  = 7;

  // ── Immediately hide the page to prevent content flash ──────────────────
  const style = document.createElement("style");
  style.id = "__wf_hide";
  style.textContent = "body { visibility: hidden !important; }";
  document.head.appendChild(style);

  // ── Overlay markup ────────────────────────────────────────────────────────
  const OVERLAY_HTML = `
<div id="__wf_overlay" style="
  position:fixed;inset:0;z-index:2147483647;
  background:#f4f4f6;
  display:flex;align-items:center;justify-content:center;
  font-family:'Segoe UI',system-ui,sans-serif;
">
  <div style="
    background:white;border-radius:8px;
    box-shadow:0 2px 16px rgba(0,0,0,0.10);
    padding:40px;width:100%;max-width:360px;
  ">
    <div style="font-size:12px;font-weight:700;color:#8500cc;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:24px">n-able Design</div>
    <h1 style="font-size:21px;font-weight:700;color:#111;margin:0 0 8px">Design preview</h1>
    <p style="font-size:14px;color:#666;margin:0 0 28px">Enter the access password to view this wireframe.</p>
    <div id="__wf_err" style="
      background:#fce8e8;color:#c62828;border-radius:4px;
      padding:10px 14px;font-size:13px;margin-bottom:16px;display:none;
    ">Incorrect password. Please try again.</div>
    <label style="display:block;font-size:12px;font-weight:600;color:#444;margin-bottom:6px">Password</label>
    <input id="__wf_pw" type="password" placeholder="Enter access password"
      autocomplete="current-password"
      style="width:100%;height:40px;padding:0 12px;border:1px solid #d5d5d5;border-radius:4px;font-size:14px;outline:none;box-sizing:border-box;"
    >
    <button id="__wf_btn"
      style="width:100%;height:40px;background:#0079aa;color:white;border:none;border-radius:4px;font-size:14px;font-weight:600;cursor:pointer;margin-top:16px;"
    >View wireframe</button>
    <div style="margin-top:16px;font-size:12px;color:#aaa;text-align:center">
      Need access? Contact <a href="mailto:aaron.hard@n-able.com" style="color:#0079aa">Aaron Hard</a>
    </div>
  </div>
</div>`;

  // ── Helpers ───────────────────────────────────────────────────────────────
  async function sha256(str) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
    return [...new Uint8Array(buf)].map(x => x.toString(16).padStart(2, "0")).join("");
  }

  function isSessionValid() {
    try {
      const s = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
      return s && s.hash === PASSWORD_HASH && Date.now() < s.exp;
    } catch { return false; }
  }

  function storeSession(hash) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({
      hash, exp: Date.now() + SESSION_DAYS * 86400 * 1000
    }));
  }

  function unlock() {
    const overlay = document.getElementById("__wf_overlay");
    if (overlay) overlay.remove();
    const hide = document.getElementById("__wf_hide");
    if (hide) hide.remove();
  }

  function showOverlay() {
    // Restore body visibility — overlay covers it instead
    const hide = document.getElementById("__wf_hide");
    if (hide) hide.remove();

    document.body.insertAdjacentHTML("afterbegin", OVERLAY_HTML);

    const pw  = document.getElementById("__wf_pw");
    const btn = document.getElementById("__wf_btn");
    const err = document.getElementById("__wf_err");

    async function attempt() {
      err.style.display = "none";
      const hash = await sha256(pw.value);
      if (hash === PASSWORD_HASH) {
        storeSession(hash);
        unlock();
      } else {
        err.style.display = "block";
        pw.value = "";
        pw.focus();
      }
    }

    btn.addEventListener("click", attempt);
    pw.addEventListener("keydown", e => { if (e.key === "Enter") attempt(); });
    pw.focus();
  }

  // ── Main: check session, then either unlock or show gate ─────────────────
  if (isSessionValid()) {
    // Already authenticated — just remove the hide style
    document.addEventListener("DOMContentLoaded", unlock);
  } else {
    document.addEventListener("DOMContentLoaded", showOverlay);
  }
})();
