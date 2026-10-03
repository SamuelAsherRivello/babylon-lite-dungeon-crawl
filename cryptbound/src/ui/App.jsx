import { useMemo, useState } from "react";
import { BrowserSurface } from "./BrowserSurface.jsx";
import { classifyPlatform, layoutForPlatform } from "./layout.js";
import { LayoutContext } from "./layout-context.js";

export function App({ content = null, gutters = {} }) {
  const platform = classifyPlatform({ userAgentDataMobile: navigator.userAgentData?.mobile, userAgent: navigator.userAgent });
  const canOverride = platform === "pc" && import.meta.env.DEV;
  const [developerAspect, setDeveloperAspect] = useState(null);
  const layout = layoutForPlatform(platform, canOverride ? developerAspect : null);
  const context = useMemo(() => ({ platform, orientation: layout.orientation, canOverride, setDeveloperAspect }), [platform, layout.orientation, canOverride]);
  return <LayoutContext.Provider value={context}><BrowserSurface layout={layout} gutters={gutters}>{content}</BrowserSurface></LayoutContext.Provider>;
}
