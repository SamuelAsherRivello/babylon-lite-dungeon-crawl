import { createContext } from "react";

export const LayoutContext = createContext({ platform: "pc", orientation: "landscape", canOverride: false, setDeveloperAspect() {} });
