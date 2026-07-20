import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./styles/tokens.css";
import "./styles/app.css";
import "./styles/focus-reference.css";
import "./styles/studio-refine.css";
import "./styles/transitions.css";
import "./styles/fluidity.css";
import "./styles/light-theme.css";
import "./styles/alignment.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
