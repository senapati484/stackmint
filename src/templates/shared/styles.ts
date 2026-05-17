export function getFrontendGlobalStyles(): string {
  return `@import "tailwindcss";

:root {
  --sm-bg: #05070c;
  --sm-bg-soft: #0b1018;
  --sm-panel: rgba(14, 20, 31, 0.86);
  --sm-panel-strong: #111827;
  --sm-line: rgba(255, 255, 255, 0.12);
  --sm-line-strong: rgba(55, 255, 205, 0.36);
  --sm-text: #f8fafc;
  --sm-muted: #a3adbd;
  --sm-mint: #36f0bd;
  --sm-cyan: #55c7ff;
  --sm-amber: #ffd166;
  --sm-violet: #a78bfa;
}

* {
  box-sizing: border-box;
}

html {
  min-height: 100%;
  background: var(--sm-bg);
}

body {
  min-width: 320px;
  min-height: 100vh;
  margin: 0;
  background:
    linear-gradient(115deg, rgba(54, 240, 189, 0.11), transparent 36%),
    linear-gradient(245deg, rgba(85, 199, 255, 0.1), transparent 42%),
    var(--sm-bg);
  color: var(--sm-text);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  text-rendering: geometricPrecision;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

button,
a {
  font: inherit;
}

a {
  color: inherit;
  text-decoration: none;
}

code {
  border: 1px solid var(--sm-line);
  border-radius: 6px;
  padding: 0.15rem 0.42rem;
  background: rgba(255, 255, 255, 0.06);
  color: var(--sm-mint);
}
`;
}

export function getFrontendAppStyles(): string {
  return `.stackmint-shell {
  position: relative;
  min-height: 100vh;
  isolation: isolate;
}

.stackmint-shell::before {
  position: fixed;
  inset: 0;
  z-index: -2;
  content: "";
  background:
    linear-gradient(115deg, rgba(54, 240, 189, 0.11), transparent 36%),
    linear-gradient(245deg, rgba(85, 199, 255, 0.1), transparent 42%),
    var(--sm-bg);
  mask-image: linear-gradient(to bottom, black, transparent 82%);
}

.stackmint-shell::after {
  position: fixed;
  inset: auto 0 0;
  z-index: -1;
  height: 34vh;
  content: "";
  background: linear-gradient(to top, rgba(54, 240, 189, 0.12), transparent);
}

.stackmint-shell::after {
  pointer-events: none;
}

.logo-stage {
  position: relative;
  min-height: 330px;
  overflow: hidden;
  padding: 1.2rem;
  background:
    linear-gradient(160deg, rgba(255, 255, 255, 0.08), transparent 42%),
    rgba(6, 10, 18, 0.92);
}

.logo-stage::before,
.logo-stage::after {
  position: absolute;
  content: "";
  border: 1px solid rgba(54, 240, 189, 0.28);
  transform: rotate(-10deg);
}

.logo-stage::before {
  right: -60px;
  bottom: 42px;
  width: 220px;
  height: 70px;
}

.logo-stage::after {
  right: 36px;
  bottom: 22px;
  width: 190px;
  height: 56px;
  border-color: rgba(255, 209, 102, 0.24);
}

.logo-image {
  position: relative;
  z-index: 1;
  display: block;
  width: min(100%, 680px);
  margin: 38px auto 0;
  filter: drop-shadow(0 28px 58px rgba(54, 240, 189, 0.14));
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: min(1180px, calc(100% - 32px));
  min-height: 76px;
  margin: 0 auto;
  gap: 1rem;
}

.brand-mark {
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  min-width: 0;
}

.brand-glyph {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  border: 1px solid var(--sm-line-strong);
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(54, 240, 189, 0.2), rgba(85, 199, 255, 0.12));
  color: var(--sm-mint);
  font-weight: 900;
}

.brand-name {
  display: grid;
  gap: 0.1rem;
}

.brand-name strong {
  font-size: 1rem;
}

.brand-name span,
.topbar-link {
  color: var(--sm-muted);
  font-size: 0.86rem;
}

.topbar-link {
  border: 1px solid var(--sm-line);
  border-radius: 999px;
  padding: 0.55rem 0.9rem;
  background: rgba(255, 255, 255, 0.04);
}

.topbar-link:hover {
  border-color: var(--sm-line-strong);
  color: var(--sm-text);
}

.hero {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(360px, 0.95fr);
  width: min(1180px, calc(100% - 32px));
  min-height: calc(100vh - 76px);
  margin: 0 auto;
  padding: 48px 0 56px;
  gap: 3rem;
  align-items: center;
}

.hero-copy {
  display: grid;
  gap: 1.45rem;
}

.eyebrow {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  gap: 0.55rem;
  border: 1px solid var(--sm-line);
  border-radius: 999px;
  padding: 0.45rem 0.7rem;
  background: rgba(255, 255, 255, 0.05);
  color: var(--sm-muted);
  font-size: 0.82rem;
}

.pulse {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: var(--sm-mint);
  box-shadow: 0 0 22px var(--sm-mint);
}

.hero h1 {
  max-width: 760px;
  margin: 0;
  color: var(--sm-text);
  font-size: 4.5rem;
  line-height: 0.96;
  letter-spacing: 0;
}

.accent {
  color: var(--sm-mint);
}

.hero-lede {
  max-width: 640px;
  margin: 0;
  color: var(--sm-muted);
  font-size: 1.14rem;
  line-height: 1.75;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
}

.button {
  display: inline-flex;
  min-height: 46px;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 8px;
  padding: 0 1.05rem;
  cursor: pointer;
  font-weight: 800;
  transition: transform 180ms ease, border-color 180ms ease, background 180ms ease;
}

.button:hover {
  transform: translateY(-2px);
}

.button-primary {
  background: linear-gradient(135deg, var(--sm-mint), var(--sm-cyan));
  color: #03110d;
}

.button-secondary {
  border: 1px solid var(--sm-line);
  background: rgba(255, 255, 255, 0.06);
  color: var(--sm-text);
}

.button-secondary:hover {
  border-color: var(--sm-line-strong);
}

.signal-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.8rem;
}

.signal-card,
.framework-card,
.logo-stage,
.mini-panel {
  border: 1px solid var(--sm-line);
  border-radius: 8px;
  background: var(--sm-panel);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.28);
}

.signal-card {
  min-height: 126px;
  padding: 1rem;
}

.signal-card span {
  color: var(--sm-muted);
  font-size: 0.78rem;
  text-transform: uppercase;
}

.signal-card strong {
  display: block;
  margin-top: 0.9rem;
  font-size: 1.45rem;
}

.signal-card p {
  margin: 0.35rem 0 0;
  color: var(--sm-muted);
  font-size: 0.9rem;
  line-height: 1.5;
}

.hero-visual {
  display: grid;
  gap: 1rem;
}

.framework-card {
  position: relative;
  z-index: 2;
  display: grid;
  width: min(360px, calc(100% - 32px));
  margin: -82px 0 0 auto;
  padding: 1rem;
  gap: 0.7rem;
}

.framework-card span {
  color: var(--sm-muted);
  font-size: 0.78rem;
  text-transform: uppercase;
}

.framework-card strong {
  font-size: 1.75rem;
}

.status-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.mini-panel {
  padding: 1rem;
}

.mini-panel span {
  display: block;
  color: var(--sm-muted);
  font-size: 0.78rem;
  text-transform: uppercase;
}

.mini-panel strong {
  display: block;
  margin-top: 0.55rem;
}

.footer-note {
  width: min(1180px, calc(100% - 32px));
  margin: -34px auto 0;
  padding-bottom: 28px;
  color: var(--sm-muted);
  font-size: 0.9rem;
}

@media (max-width: 920px) {
  .hero {
    grid-template-columns: 1fr;
    min-height: auto;
    padding-top: 28px;
  }

  .hero h1 {
    font-size: 3rem;
    line-height: 1.03;
  }

  .signal-grid,
  .status-row {
    grid-template-columns: 1fr;
  }

  .logo-stage {
    min-height: 260px;
  }

  .framework-card {
    margin-top: -54px;
  }

  .footer-note {
    margin-top: 0;
  }
}

@media (max-width: 560px) {
  .topbar {
    align-items: flex-start;
    flex-direction: column;
    padding: 14px 0;
  }

  .hero h1 {
    font-size: 2.35rem;
  }

  .hero-lede {
    font-size: 1rem;
  }
}
`;
}
