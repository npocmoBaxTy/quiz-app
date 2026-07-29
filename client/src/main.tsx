import { createRoot } from "react-dom/client";
import "./index.css";
import App from "@/App";
import "@/shared/config/i18n/i18n";
import { StrictMode } from "react";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
