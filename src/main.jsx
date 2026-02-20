import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { Toaster } from "sonner";

import AuthProvider from "./context/AuthProvider";
import ThemeProvider from "./context/ThemeProvider";


ReactDOM.createRoot(document.getElementById("root")).render(
  <ThemeProvider>
    <AuthProvider>
    <Toaster richColors position="top-right" />
      <App />
    </AuthProvider>
  </ThemeProvider>
);
