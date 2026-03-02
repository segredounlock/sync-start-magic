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
          position="top-center"
          style={{ top: '55%' }}
          toastOptions={{
            className: "!rounded-2xl !shadow-2xl !border-0 !px-5 !py-4 !text-sm !font-semibold !backdrop-blur-xl !min-w-[320px]",
            style: {
              fontFamily: "var(--font-sans, Inter, system-ui, sans-serif)",
            },
            classNames: {
              success: "!bg-gradient-to-r !from-emerald-500/95 !to-green-600/95 !text-white [&>svg]:!text-white [&_[data-close-button]]:!text-white/70 [&_[data-content]_[data-description]]:!text-white/80",
              error: "!bg-gradient-to-r !from-red-500/95 !to-rose-600/95 !text-white [&>svg]:!text-white [&_[data-close-button]]:!text-white/70 [&_[data-content]_[data-description]]:!text-white/80",
              info: "!bg-gradient-to-r !from-blue-500/95 !to-indigo-600/95 !text-white [&>svg]:!text-white [&_[data-close-button]]:!text-white/70 [&_[data-content]_[data-description]]:!text-white/80",
              warning: "!bg-gradient-to-r !from-amber-500/95 !to-orange-500/95 !text-white [&>svg]:!text-white [&_[data-close-button]]:!text-white/70 [&_[data-content]_[data-description]]:!text-white/80",
              toast: "!bg-gradient-to-r !from-slate-800/95 !to-slate-900/95 !text-white [&>svg]:!text-white [&_[data-close-button]]:!text-white/70 [&_[data-content]_[data-description]]:!text-white/80",
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
