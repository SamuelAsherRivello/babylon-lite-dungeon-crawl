import versionText from "../../../version.txt?raw";
import { BrowserSurface } from "./BrowserSurface.jsx";
import { defaultLayout } from "./layout.js";
function AppCorner({ position, children }) { return <div className={`corner corner_${position}`}>{children}</div>; }

export function App({ content = null, gutters = {} }) {
  const version = versionText.trim().replace(/^version=/, "").replace(/^v/, "");
  const toggleFullscreen = async () => {
    try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); } catch { /* Unsupported fullscreen does not affect play. */ }
  };
  return <BrowserSurface layout={defaultLayout} gutters={gutters} ui={<>
    <AppCorner position="top_left"><div id="project_title" className="corner-body">Cryptbound</div></AppCorner>
    <AppCorner position="top_right"><a className="corner-body" href="https://github.com/SamuelAsherRivello/babylon-lite-dungeon-crawl" target="_blank" rel="noopener noreferrer">Source ↗</a></AppCorner>
    <AppCorner position="bottom_left"><section id="config" aria-label="Game settings"><div className="corner-title">Settings</div><button className="corner-body" onClick={toggleFullscreen}>Fullscreen</button></section></AppCorner>
    <AppCorner position="bottom_right"><section id="stats" aria-label="Version"><div className="corner-title">Version</div><div id="version" className="corner-body">v{version}</div></section></AppCorner>
  </>}>{content}</BrowserSurface>;
}
