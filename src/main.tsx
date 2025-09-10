import {HeroUIProvider, ToastProvider} from "@heroui/react";
import React from "react";
import ReactDOM from "react-dom/client";
import { I18nextProvider } from "react-i18next";
import App from "./App.tsx";
import { GoogleOAuthProvider } from "@react-oauth/google";

import i18n from "./i18n.ts";
import "./index.css";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <I18nextProvider i18n={i18n}>
        <HeroUIProvider>
          <ToastProvider />
          <main className="text-foreground bg-background">
            <App />
          </main>
        </HeroUIProvider>
      </I18nextProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>,
);
