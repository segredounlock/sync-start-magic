import __vite__cjsImport0_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=fb1d4910"; const _jsxDEV = __vite__cjsImport0_react_jsxDevRuntime["jsxDEV"];
import __vite__cjsImport1_react from "/node_modules/.vite/deps/react.js?v=b874473c"; const React = __vite__cjsImport1_react.__esModule ? __vite__cjsImport1_react.default : __vite__cjsImport1_react;
import __vite__cjsImport2_reactDom_client from "/node_modules/.vite/deps/react-dom_client.js?v=aea6d6e7"; const ReactDOM = __vite__cjsImport2_reactDom_client.__esModule ? __vite__cjsImport2_reactDom_client.default : __vite__cjsImport2_reactDom_client;
import { BrowserRouter } from "/node_modules/.vite/deps/react-router-dom.js?v=9abf96c4";
import { QueryClient, QueryClientProvider } from "/node_modules/.vite/deps/@tanstack_react-query.js?v=76cd27e0";
import { Toaster } from "/node_modules/.vite/deps/sonner.js?v=79fa9fe9";
import App from "/src/App.tsx?t=1773286296660";
import "/src/index.css?t=1773286296660";
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 30000,
            gcTime: 5 * 60000,
            refetchOnWindowFocus: false,
            retry: 1
        }
    }
});
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/ _jsxDEV(React.StrictMode, {
    children: /*#__PURE__*/ _jsxDEV(QueryClientProvider, {
        client: queryClient,
        children: /*#__PURE__*/ _jsxDEV(BrowserRouter, {
            children: [
                /*#__PURE__*/ _jsxDEV(App, {}, void 0, false, {
                    fileName: "/dev-server/src/main.tsx",
                    lineNumber: 24,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ _jsxDEV(Toaster, {
                    position: "top-center",
                    toastOptions: {
                        className: "!rounded-2xl !shadow-2xl !border !border-border/30 !px-5 !py-4 !text-sm !font-semibold !backdrop-blur-xl !min-w-[320px]",
                        style: {
                            fontFamily: "var(--font-sans, Inter, system-ui, sans-serif)",
                            background: "hsl(var(--card))",
                            color: "hsl(var(--foreground))"
                        },
                        classNames: {
                            success: "!bg-primary/95 !text-primary-foreground !border-primary/30 [&>svg]:!text-primary-foreground [&_[data-close-button]]:!text-primary-foreground/70",
                            error: "!bg-destructive/95 !text-destructive-foreground !border-destructive/30 [&>svg]:!text-destructive-foreground [&_[data-close-button]]:!text-destructive-foreground/70",
                            info: "!bg-card !text-foreground !border-primary/30 [&>svg]:!text-primary [&_[data-close-button]]:!text-muted-foreground",
                            warning: "!bg-warning/95 !text-warning-foreground !border-warning/30 [&>svg]:!text-warning-foreground [&_[data-close-button]]:!text-warning-foreground/70",
                            toast: "!bg-card !text-foreground !border-border/30 [&>svg]:!text-primary [&_[data-close-button]]:!text-muted-foreground"
                        }
                    },
                    gap: 10,
                    visibleToasts: 3,
                    closeButton: true,
                    richColors: false,
                    expand: false,
                    duration: 4000
                }, void 0, false, {
                    fileName: "/dev-server/src/main.tsx",
                    lineNumber: 25,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "/dev-server/src/main.tsx",
            lineNumber: 23,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "/dev-server/src/main.tsx",
        lineNumber: 22,
        columnNumber: 5
    }, this)
}, void 0, false, {
    fileName: "/dev-server/src/main.tsx",
    lineNumber: 21,
    columnNumber: 3
}, this));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4udHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCBSZWFjdERPTSBmcm9tIFwicmVhY3QtZG9tL2NsaWVudFwiO1xuaW1wb3J0IHsgQnJvd3NlclJvdXRlciB9IGZyb20gXCJyZWFjdC1yb3V0ZXItZG9tXCI7XG5pbXBvcnQgeyBRdWVyeUNsaWVudCwgUXVlcnlDbGllbnRQcm92aWRlciB9IGZyb20gXCJAdGFuc3RhY2svcmVhY3QtcXVlcnlcIjtcbmltcG9ydCB7IFRvYXN0ZXIgfSBmcm9tIFwic29ubmVyXCI7XG5pbXBvcnQgQXBwIGZyb20gXCIuL0FwcFwiO1xuaW1wb3J0IFwiLi9pbmRleC5jc3NcIjtcblxuY29uc3QgcXVlcnlDbGllbnQgPSBuZXcgUXVlcnlDbGllbnQoe1xuICBkZWZhdWx0T3B0aW9uczoge1xuICAgIHF1ZXJpZXM6IHtcbiAgICAgIHN0YWxlVGltZTogMzBfMDAwLCAgICAgICAvLyAzMHMgYmVmb3JlIHJlZmV0Y2hcbiAgICAgIGdjVGltZTogNSAqIDYwXzAwMCwgICAgICAvLyA1bWluIGdhcmJhZ2UgY29sbGVjdGlvblxuICAgICAgcmVmZXRjaE9uV2luZG93Rm9jdXM6IGZhbHNlLFxuICAgICAgcmV0cnk6IDEsXG4gICAgfSxcbiAgfSxcbn0pO1xuXG5SZWFjdERPTS5jcmVhdGVSb290KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicm9vdFwiKSEpLnJlbmRlcihcbiAgPFJlYWN0LlN0cmljdE1vZGU+XG4gICAgPFF1ZXJ5Q2xpZW50UHJvdmlkZXIgY2xpZW50PXtxdWVyeUNsaWVudH0+XG4gICAgICA8QnJvd3NlclJvdXRlcj5cbiAgICAgICAgPEFwcCAvPlxuICAgICAgICA8VG9hc3RlclxuICAgICAgICAgIHBvc2l0aW9uPVwidG9wLWNlbnRlclwiXG4gICAgICAgICAgdG9hc3RPcHRpb25zPXt7XG4gICAgICAgICAgICBjbGFzc05hbWU6IFwiIXJvdW5kZWQtMnhsICFzaGFkb3ctMnhsICFib3JkZXIgIWJvcmRlci1ib3JkZXIvMzAgIXB4LTUgIXB5LTQgIXRleHQtc20gIWZvbnQtc2VtaWJvbGQgIWJhY2tkcm9wLWJsdXIteGwgIW1pbi13LVszMjBweF1cIixcbiAgICAgICAgICAgIHN0eWxlOiB7XG4gICAgICAgICAgICAgIGZvbnRGYW1pbHk6IFwidmFyKC0tZm9udC1zYW5zLCBJbnRlciwgc3lzdGVtLXVpLCBzYW5zLXNlcmlmKVwiLFxuICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiBcImhzbCh2YXIoLS1jYXJkKSlcIixcbiAgICAgICAgICAgICAgY29sb3I6IFwiaHNsKHZhcigtLWZvcmVncm91bmQpKVwiLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNsYXNzTmFtZXM6IHtcbiAgICAgICAgICAgICAgc3VjY2VzczogXCIhYmctcHJpbWFyeS85NSAhdGV4dC1wcmltYXJ5LWZvcmVncm91bmQgIWJvcmRlci1wcmltYXJ5LzMwIFsmPnN2Z106IXRleHQtcHJpbWFyeS1mb3JlZ3JvdW5kIFsmX1tkYXRhLWNsb3NlLWJ1dHRvbl1dOiF0ZXh0LXByaW1hcnktZm9yZWdyb3VuZC83MFwiLFxuICAgICAgICAgICAgICBlcnJvcjogXCIhYmctZGVzdHJ1Y3RpdmUvOTUgIXRleHQtZGVzdHJ1Y3RpdmUtZm9yZWdyb3VuZCAhYm9yZGVyLWRlc3RydWN0aXZlLzMwIFsmPnN2Z106IXRleHQtZGVzdHJ1Y3RpdmUtZm9yZWdyb3VuZCBbJl9bZGF0YS1jbG9zZS1idXR0b25dXTohdGV4dC1kZXN0cnVjdGl2ZS1mb3JlZ3JvdW5kLzcwXCIsXG4gICAgICAgICAgICAgIGluZm86IFwiIWJnLWNhcmQgIXRleHQtZm9yZWdyb3VuZCAhYm9yZGVyLXByaW1hcnkvMzAgWyY+c3ZnXTohdGV4dC1wcmltYXJ5IFsmX1tkYXRhLWNsb3NlLWJ1dHRvbl1dOiF0ZXh0LW11dGVkLWZvcmVncm91bmRcIixcbiAgICAgICAgICAgICAgd2FybmluZzogXCIhYmctd2FybmluZy85NSAhdGV4dC13YXJuaW5nLWZvcmVncm91bmQgIWJvcmRlci13YXJuaW5nLzMwIFsmPnN2Z106IXRleHQtd2FybmluZy1mb3JlZ3JvdW5kIFsmX1tkYXRhLWNsb3NlLWJ1dHRvbl1dOiF0ZXh0LXdhcm5pbmctZm9yZWdyb3VuZC83MFwiLFxuICAgICAgICAgICAgICB0b2FzdDogXCIhYmctY2FyZCAhdGV4dC1mb3JlZ3JvdW5kICFib3JkZXItYm9yZGVyLzMwIFsmPnN2Z106IXRleHQtcHJpbWFyeSBbJl9bZGF0YS1jbG9zZS1idXR0b25dXTohdGV4dC1tdXRlZC1mb3JlZ3JvdW5kXCIsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH19XG4gICAgICAgICAgZ2FwPXsxMH1cbiAgICAgICAgICB2aXNpYmxlVG9hc3RzPXszfVxuICAgICAgICAgIGNsb3NlQnV0dG9uXG4gICAgICAgICAgcmljaENvbG9ycz17ZmFsc2V9XG4gICAgICAgICAgZXhwYW5kPXtmYWxzZX1cbiAgICAgICAgICBkdXJhdGlvbj17NDAwMH1cbiAgICAgICAgLz5cbiAgICAgIDwvQnJvd3NlclJvdXRlcj5cbiAgICA8L1F1ZXJ5Q2xpZW50UHJvdmlkZXI+XG4gIDwvUmVhY3QuU3RyaWN0TW9kZT5cbik7XG4iXSwibmFtZXMiOlsiUmVhY3QiLCJSZWFjdERPTSIsIkJyb3dzZXJSb3V0ZXIiLCJRdWVyeUNsaWVudCIsIlF1ZXJ5Q2xpZW50UHJvdmlkZXIiLCJUb2FzdGVyIiwiQXBwIiwicXVlcnlDbGllbnQiLCJkZWZhdWx0T3B0aW9ucyIsInF1ZXJpZXMiLCJzdGFsZVRpbWUiLCJnY1RpbWUiLCJyZWZldGNoT25XaW5kb3dGb2N1cyIsInJldHJ5IiwiY3JlYXRlUm9vdCIsImRvY3VtZW50IiwiZ2V0RWxlbWVudEJ5SWQiLCJyZW5kZXIiLCJTdHJpY3RNb2RlIiwiY2xpZW50IiwicG9zaXRpb24iLCJ0b2FzdE9wdGlvbnMiLCJjbGFzc05hbWUiLCJzdHlsZSIsImZvbnRGYW1pbHkiLCJiYWNrZ3JvdW5kIiwiY29sb3IiLCJjbGFzc05hbWVzIiwic3VjY2VzcyIsImVycm9yIiwiaW5mbyIsIndhcm5pbmciLCJ0b2FzdCIsImdhcCIsInZpc2libGVUb2FzdHMiLCJjbG9zZUJ1dHRvbiIsInJpY2hDb2xvcnMiLCJleHBhbmQiLCJkdXJhdGlvbiJdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU9BLFdBQVcsUUFBUTtBQUMxQixPQUFPQyxjQUFjLG1CQUFtQjtBQUN4QyxTQUFTQyxhQUFhLFFBQVEsbUJBQW1CO0FBQ2pELFNBQVNDLFdBQVcsRUFBRUMsbUJBQW1CLFFBQVEsd0JBQXdCO0FBQ3pFLFNBQVNDLE9BQU8sUUFBUSxTQUFTO0FBQ2pDLE9BQU9DLFNBQVMsUUFBUTtBQUN4QixPQUFPLGNBQWM7QUFFckIsTUFBTUMsY0FBYyxJQUFJSixZQUFZO0lBQ2xDSyxnQkFBZ0I7UUFDZEMsU0FBUztZQUNQQyxXQUFXO1lBQ1hDLFFBQVEsSUFBSTtZQUNaQyxzQkFBc0I7WUFDdEJDLE9BQU87UUFDVDtJQUNGO0FBQ0Y7QUFFQVosU0FBU2EsVUFBVSxDQUFDQyxTQUFTQyxjQUFjLENBQUMsU0FBVUMsTUFBTSxlQUMxRCxRQUFDakIsTUFBTWtCLFVBQVU7Y0FDZixjQUFBLFFBQUNkO1FBQW9CZSxRQUFRWjtrQkFDM0IsY0FBQSxRQUFDTDs7OEJBQ0MsUUFBQ0k7Ozs7OzhCQUNELFFBQUNEO29CQUNDZSxVQUFTO29CQUNUQyxjQUFjO3dCQUNaQyxXQUFXO3dCQUNYQyxPQUFPOzRCQUNMQyxZQUFZOzRCQUNaQyxZQUFZOzRCQUNaQyxPQUFPO3dCQUNUO3dCQUNBQyxZQUFZOzRCQUNWQyxTQUFTOzRCQUNUQyxPQUFPOzRCQUNQQyxNQUFNOzRCQUNOQyxTQUFTOzRCQUNUQyxPQUFPO3dCQUNUO29CQUNGO29CQUNBQyxLQUFLO29CQUNMQyxlQUFlO29CQUNmQyxXQUFXO29CQUNYQyxZQUFZO29CQUNaQyxRQUFRO29CQUNSQyxVQUFVIn0=