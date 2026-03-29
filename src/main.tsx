// App entry point
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import App from "./AppRoot";
import UpdatePrompt from "./components/UpdatePrompt";
import ReinstallBanner from "./components/ReinstallBanner";
import { installSessionGuard } from "./lib/sessionGuard";
import "./styles/app.css";


// Install global session expiry detection
installSessionGuard();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <UpdatePrompt />
        <Toaster
          position="top-center"
          toastOptions={{
            className: "!rounded-2xl !shadow-2xl !border !border-border/30 !px-5 !py-4 !text-sm !font-semibold !backdrop-blur-xl !min-w-[320px]",
            style: {
              fontFamily: "var(--font-sans, Inter, system-ui, sans-serif)",
              background: "hsl(var(--card))",
              color: "hsl(var(--foreground))",
            },
            classNames: {
              success: "!bg-primary/95 !text-primary-foreground !border-primary/30 [&>svg]:!text-primary-foreground [&_[data-close-button]]:!text-primary-foreground/70",
              error: "!bg-destructive/95 !text-destructive-foreground !border-destructive/30 [&>svg]:!text-destructive-foreground [&_[data-close-button]]:!text-destructive-foreground/70",
              info: "!bg-card !text-foreground !border-primary/30 [&>svg]:!text-primary [&_[data-close-button]]:!text-muted-foreground",
              warning: "!bg-warning/95 !text-warning-foreground !border-warning/30 [&>svg]:!text-warning-foreground/70",
              toast: "!bg-card !text-foreground !border-border/30 [&>svg]:!text-primary [&_[data-close-button]]:!text-muted-foreground",
            },
          }}
          gap={10}
          visibleToasts={3}
          closeButton
          richColors={false}
          expand={false}
          duration={4000}
        />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
