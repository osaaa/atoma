import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <div className="bg-radial from-violet-500 to-fuchsia-400">
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </div>
  </StrictMode>
);
