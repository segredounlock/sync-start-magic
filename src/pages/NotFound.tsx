import { createHotContext as __vite__createHotContext } from "/@vite/client";import.meta.hot = __vite__createHotContext("/src/pages/NotFound.tsx");import * as RefreshRuntime from "/@react-refresh";
const inWebWorker = typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope;

let prevRefreshReg;
let prevRefreshSig;

if (import.meta.hot && !inWebWorker) {
  if (!window.$RefreshReg$) {
    throw new Error(
      "@vitejs/plugin-react-swc can't detect preamble. Something is wrong."
    );
  }

  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = RefreshRuntime.getRefreshReg("/dev-server/src/pages/NotFound.tsx");
  window.$RefreshSig$ = RefreshRuntime.createSignatureFunctionForTransform;
}

import __vite__cjsImport2_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=fb1d4910"; const _jsxDEV = __vite__cjsImport2_react_jsxDevRuntime["jsxDEV"];
import { Link } from "/node_modules/.vite/deps/react-router-dom.js?v=9abf96c4";
import { motion } from "/node_modules/.vite/deps/framer-motion.js?v=0eb59201";
import { ThemeToggle } from "/src/components/ThemeToggle.tsx";
import { Ghost } from "/node_modules/.vite/deps/lucide-react.js?v=1627e724";
export default function NotFound() {
    return /*#__PURE__*/ _jsxDEV("div", {
        className: "min-h-screen flex items-center justify-center px-4 relative",
        children: [
            /*#__PURE__*/ _jsxDEV("div", {
                className: "absolute top-4 right-4",
                children: /*#__PURE__*/ _jsxDEV(ThemeToggle, {}, void 0, false, {
                    fileName: "/dev-server/src/pages/NotFound.tsx",
                    lineNumber: 10,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "/dev-server/src/pages/NotFound.tsx",
                lineNumber: 9,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ _jsxDEV("div", {
                className: "text-center glass-modal rounded-xl p-10",
                children: [
                    /*#__PURE__*/ _jsxDEV(motion.div, {
                        initial: {
                            scale: 0,
                            rotate: -20
                        },
                        animate: {
                            scale: 1,
                            rotate: 0
                        },
                        transition: {
                            type: "spring",
                            stiffness: 200,
                            damping: 12
                        },
                        className: "inline-block mb-4",
                        children: /*#__PURE__*/ _jsxDEV(motion.div, {
                            animate: {
                                y: [
                                    0,
                                    -8,
                                    0
                                ]
                            },
                            transition: {
                                repeat: Infinity,
                                duration: 2.5,
                                ease: "easeInOut"
                            },
                            children: /*#__PURE__*/ _jsxDEV(Ghost, {
                                className: "h-16 w-16 text-primary mx-auto"
                            }, void 0, false, {
                                fileName: "/dev-server/src/pages/NotFound.tsx",
                                lineNumber: 23,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "/dev-server/src/pages/NotFound.tsx",
                            lineNumber: 19,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "/dev-server/src/pages/NotFound.tsx",
                        lineNumber: 13,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ _jsxDEV(motion.h1, {
                        initial: {
                            opacity: 0,
                            y: 20
                        },
                        animate: {
                            opacity: 1,
                            y: 0
                        },
                        transition: {
                            delay: 0.2
                        },
                        className: "font-display text-6xl font-bold text-primary glow-text",
                        children: "404"
                    }, void 0, false, {
                        fileName: "/dev-server/src/pages/NotFound.tsx",
                        lineNumber: 26,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ _jsxDEV(motion.p, {
                        initial: {
                            opacity: 0
                        },
                        animate: {
                            opacity: 1
                        },
                        transition: {
                            delay: 0.4
                        },
                        className: "text-muted-foreground mt-2 mb-6",
                        children: "Página não encontrada"
                    }, void 0, false, {
                        fileName: "/dev-server/src/pages/NotFound.tsx",
                        lineNumber: 34,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ _jsxDEV(motion.div, {
                        initial: {
                            opacity: 0,
                            y: 10
                        },
                        animate: {
                            opacity: 1,
                            y: 0
                        },
                        transition: {
                            delay: 0.6
                        },
                        children: /*#__PURE__*/ _jsxDEV(Link, {
                            to: "/",
                            className: "px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity glow-primary",
                            children: "Voltar ao início"
                        }, void 0, false, {
                            fileName: "/dev-server/src/pages/NotFound.tsx",
                            lineNumber: 47,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "/dev-server/src/pages/NotFound.tsx",
                        lineNumber: 42,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "/dev-server/src/pages/NotFound.tsx",
                lineNumber: 12,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "/dev-server/src/pages/NotFound.tsx",
        lineNumber: 8,
        columnNumber: 5
    }, this);
}
_c = NotFound;
var _c;
$RefreshReg$(_c, "NotFound");


if (import.meta.hot && !inWebWorker) {
  window.$RefreshReg$ = prevRefreshReg;
  window.$RefreshSig$ = prevRefreshSig;
}


if (import.meta.hot && !inWebWorker) {
  RefreshRuntime.__hmr_import(import.meta.url).then((currentExports) => {
    RefreshRuntime.registerExportsForReactRefresh("/dev-server/src/pages/NotFound.tsx", currentExports);
    import.meta.hot.accept((nextExports) => {
      if (!nextExports) return;
      const invalidateMessage = RefreshRuntime.validateRefreshBoundaryAndEnqueueUpdate("/dev-server/src/pages/NotFound.tsx", currentExports, nextExports);
      if (invalidateMessage) import.meta.hot.invalidate(invalidateMessage);
    });
  });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk5vdEZvdW5kLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBMaW5rIH0gZnJvbSBcInJlYWN0LXJvdXRlci1kb21cIjtcbmltcG9ydCB7IG1vdGlvbiB9IGZyb20gXCJmcmFtZXItbW90aW9uXCI7XG5pbXBvcnQgeyBUaGVtZVRvZ2dsZSB9IGZyb20gXCJAL2NvbXBvbmVudHMvVGhlbWVUb2dnbGVcIjtcbmltcG9ydCB7IEdob3N0IH0gZnJvbSBcImx1Y2lkZS1yZWFjdFwiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBOb3RGb3VuZCgpIHtcbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cIm1pbi1oLXNjcmVlbiBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBweC00IHJlbGF0aXZlXCI+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImFic29sdXRlIHRvcC00IHJpZ2h0LTRcIj5cbiAgICAgICAgPFRoZW1lVG9nZ2xlIC8+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwidGV4dC1jZW50ZXIgZ2xhc3MtbW9kYWwgcm91bmRlZC14bCBwLTEwXCI+XG4gICAgICAgIDxtb3Rpb24uZGl2XG4gICAgICAgICAgaW5pdGlhbD17eyBzY2FsZTogMCwgcm90YXRlOiAtMjAgfX1cbiAgICAgICAgICBhbmltYXRlPXt7IHNjYWxlOiAxLCByb3RhdGU6IDAgfX1cbiAgICAgICAgICB0cmFuc2l0aW9uPXt7IHR5cGU6IFwic3ByaW5nXCIsIHN0aWZmbmVzczogMjAwLCBkYW1waW5nOiAxMiB9fVxuICAgICAgICAgIGNsYXNzTmFtZT1cImlubGluZS1ibG9jayBtYi00XCJcbiAgICAgICAgPlxuICAgICAgICAgIDxtb3Rpb24uZGl2XG4gICAgICAgICAgICBhbmltYXRlPXt7IHk6IFswLCAtOCwgMF0gfX1cbiAgICAgICAgICAgIHRyYW5zaXRpb249e3sgcmVwZWF0OiBJbmZpbml0eSwgZHVyYXRpb246IDIuNSwgZWFzZTogXCJlYXNlSW5PdXRcIiB9fVxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxHaG9zdCBjbGFzc05hbWU9XCJoLTE2IHctMTYgdGV4dC1wcmltYXJ5IG14LWF1dG9cIiAvPlxuICAgICAgICAgIDwvbW90aW9uLmRpdj5cbiAgICAgICAgPC9tb3Rpb24uZGl2PlxuICAgICAgICA8bW90aW9uLmgxXG4gICAgICAgICAgaW5pdGlhbD17eyBvcGFjaXR5OiAwLCB5OiAyMCB9fVxuICAgICAgICAgIGFuaW1hdGU9e3sgb3BhY2l0eTogMSwgeTogMCB9fVxuICAgICAgICAgIHRyYW5zaXRpb249e3sgZGVsYXk6IDAuMiB9fVxuICAgICAgICAgIGNsYXNzTmFtZT1cImZvbnQtZGlzcGxheSB0ZXh0LTZ4bCBmb250LWJvbGQgdGV4dC1wcmltYXJ5IGdsb3ctdGV4dFwiXG4gICAgICAgID5cbiAgICAgICAgICA0MDRcbiAgICAgICAgPC9tb3Rpb24uaDE+XG4gICAgICAgIDxtb3Rpb24ucFxuICAgICAgICAgIGluaXRpYWw9e3sgb3BhY2l0eTogMCB9fVxuICAgICAgICAgIGFuaW1hdGU9e3sgb3BhY2l0eTogMSB9fVxuICAgICAgICAgIHRyYW5zaXRpb249e3sgZGVsYXk6IDAuNCB9fVxuICAgICAgICAgIGNsYXNzTmFtZT1cInRleHQtbXV0ZWQtZm9yZWdyb3VuZCBtdC0yIG1iLTZcIlxuICAgICAgICA+XG4gICAgICAgICAgUMOhZ2luYSBuw6NvIGVuY29udHJhZGFcbiAgICAgICAgPC9tb3Rpb24ucD5cbiAgICAgICAgPG1vdGlvbi5kaXZcbiAgICAgICAgICBpbml0aWFsPXt7IG9wYWNpdHk6IDAsIHk6IDEwIH19XG4gICAgICAgICAgYW5pbWF0ZT17eyBvcGFjaXR5OiAxLCB5OiAwIH19XG4gICAgICAgICAgdHJhbnNpdGlvbj17eyBkZWxheTogMC42IH19XG4gICAgICAgID5cbiAgICAgICAgICA8TGluayB0bz1cIi9cIiBjbGFzc05hbWU9XCJweC02IHB5LTIuNSByb3VuZGVkLWxnIGJnLXByaW1hcnkgdGV4dC1wcmltYXJ5LWZvcmVncm91bmQgZm9udC1tZWRpdW0gaG92ZXI6b3BhY2l0eS05MCB0cmFuc2l0aW9uLW9wYWNpdHkgZ2xvdy1wcmltYXJ5XCI+XG4gICAgICAgICAgICBWb2x0YXIgYW8gaW7DrWNpb1xuICAgICAgICAgIDwvTGluaz5cbiAgICAgICAgPC9tb3Rpb24uZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gICk7XG59XG4iXSwibmFtZXMiOlsiTGluayIsIm1vdGlvbiIsIlRoZW1lVG9nZ2xlIiwiR2hvc3QiLCJOb3RGb3VuZCIsImRpdiIsImNsYXNzTmFtZSIsImluaXRpYWwiLCJzY2FsZSIsInJvdGF0ZSIsImFuaW1hdGUiLCJ0cmFuc2l0aW9uIiwidHlwZSIsInN0aWZmbmVzcyIsImRhbXBpbmciLCJ5IiwicmVwZWF0IiwiSW5maW5pdHkiLCJkdXJhdGlvbiIsImVhc2UiLCJoMSIsIm9wYWNpdHkiLCJkZWxheSIsInAiLCJ0byJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxTQUFTQSxJQUFJLFFBQVEsbUJBQW1CO0FBQ3hDLFNBQVNDLE1BQU0sUUFBUSxnQkFBZ0I7QUFDdkMsU0FBU0MsV0FBVyxRQUFRLDJCQUEyQjtBQUN2RCxTQUFTQyxLQUFLLFFBQVEsZUFBZTtBQUVyQyxlQUFlLFNBQVNDO0lBQ3RCLHFCQUNFLFFBQUNDO1FBQUlDLFdBQVU7OzBCQUNiLFFBQUNEO2dCQUFJQyxXQUFVOzBCQUNiLGNBQUEsUUFBQ0o7Ozs7Ozs7Ozs7MEJBRUgsUUFBQ0c7Z0JBQUlDLFdBQVU7O2tDQUNiLFFBQUNMLE9BQU9JLEdBQUc7d0JBQ1RFLFNBQVM7NEJBQUVDLE9BQU87NEJBQUdDLFFBQVEsQ0FBQzt3QkFBRzt3QkFDakNDLFNBQVM7NEJBQUVGLE9BQU87NEJBQUdDLFFBQVE7d0JBQUU7d0JBQy9CRSxZQUFZOzRCQUFFQyxNQUFNOzRCQUFVQyxXQUFXOzRCQUFLQyxTQUFTO3dCQUFHO3dCQUMxRFIsV0FBVTtrQ0FFVixjQUFBLFFBQUNMLE9BQU9JLEdBQUc7NEJBQ1RLLFNBQVM7Z0NBQUVLLEdBQUc7b0NBQUM7b0NBQUcsQ0FBQztvQ0FBRztpQ0FBRTs0QkFBQzs0QkFDekJKLFlBQVk7Z0NBQUVLLFFBQVFDO2dDQUFVQyxVQUFVO2dDQUFLQyxNQUFNOzRCQUFZO3NDQUVqRSxjQUFBLFFBQUNoQjtnQ0FBTUcsV0FBVTs7Ozs7Ozs7Ozs7Ozs7OztrQ0FHckIsUUFBQ0wsT0FBT21CLEVBQUU7d0JBQ1JiLFNBQVM7NEJBQUVjLFNBQVM7NEJBQUdOLEdBQUc7d0JBQUc7d0JBQzdCTCxTQUFTOzRCQUFFVyxTQUFTOzRCQUFHTixHQUFHO3dCQUFFO3dCQUM1QkosWUFBWTs0QkFBRVcsT0FBTzt3QkFBSTt3QkFDekJoQixXQUFVO2tDQUNYOzs7Ozs7a0NBR0QsUUFBQ0wsT0FBT3NCLENBQUM7d0JBQ1BoQixTQUFTOzRCQUFFYyxTQUFTO3dCQUFFO3dCQUN0QlgsU0FBUzs0QkFBRVcsU0FBUzt3QkFBRTt3QkFDdEJWLFlBQVk7NEJBQUVXLE9BQU87d0JBQUk7d0JBQ3pCaEIsV0FBVTtrQ0FDWDs7Ozs7O2tDQUdELFFBQUNMLE9BQU9JLEdBQUc7d0JBQ1RFLFNBQVM7NEJBQUVjLFNBQVM7NEJBQUdOLEdBQUc7d0JBQUc7d0JBQzdCTCxTQUFTOzRCQUFFVyxTQUFTOzRCQUFHTixHQUFHO3dCQUFFO3dCQUM1QkosWUFBWTs0QkFBRVcsT0FBTzt3QkFBSTtrQ0FFekIsY0FBQSxRQUFDdEI7NEJBQUt3QixJQUFHOzRCQUFJbEIsV0FBVTtzQ0FBeUg7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBTzFKO0tBaER3QkYifQ==