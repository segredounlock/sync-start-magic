import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import App from "./App";
import "./index.css";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            className: "!bg-card !text-card-foreground !border !border-border !shadow-lg !rounded-xl !text-sm !font-sans",
            style: {
              fontFamily: "var(--font-sans, Inter, system-ui, sans-serif)",
            },
            classNames: {
              success: "!border-success/30 !text-success [&>svg]:!text-success",
              error: "!border-destructive/30 !text-destructive [&>svg]:!text-destructive",
              info: "!border-primary/30 !text-primary [&>svg]:!text-primary",
              warning: "!border-warning/30 !text-warning [&>svg]:!text-warning",
            },
          }}
          gap={8}
          visibleToasts={4}
          closeButton
          richColors={false}
          expand={false}
          duration={4000}
        />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
