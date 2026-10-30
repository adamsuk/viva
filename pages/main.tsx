// Static GitHub Pages entry. Renders the single Viva page with no server.
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { VivaApp } from "@/components/viva/app";
import "./pages.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <VivaApp />
  </StrictMode>,
);
