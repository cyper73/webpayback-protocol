import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HumanityProvider } from "@humanity-org/react-sdk";
import "@humanity-org/react-sdk/styles.css";
import App from "./App";
import "./index.css";

const rawHumanityEnvironment =
  (import.meta.env.VITE_HUMANITY_ENVIRONMENT as "production" | "sandbox" | "staging" | "testnet" | undefined) || "sandbox";
const humanityEnvironment: "production" | "sandbox" =
  rawHumanityEnvironment === "production" ? "production" : "sandbox";
if (rawHumanityEnvironment !== humanityEnvironment) {
  console.warn(
    `[Humanity SDK] Mapped unsupported environment "${rawHumanityEnvironment}" to "${humanityEnvironment}" for current SDK version.`,
  );
}
const humanityRedirectUri =
  import.meta.env.VITE_HUMANITY_REDIRECT_URI ||
  import.meta.env.VITE_REDIRECT_URI ||
  `${window.location.origin}/callback`;

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <HumanityProvider
      clientId={import.meta.env.VITE_HUMANITY_CLIENT_ID}
      redirectUri={humanityRedirectUri}
      environment={humanityEnvironment}
      storage="memory"
      theme="system"
      onError={(error) => {
        console.error("[Humanity SDK]", {
          message: error.message,
          code: error.code,
          statusCode: error.statusCode,
        });
      }}
    >
      <App />
    </HumanityProvider>
  </BrowserRouter>,
);
