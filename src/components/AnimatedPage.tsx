import { createHotContext as __vite__createHotContext } from "/@vite/client";import.meta.hot = __vite__createHotContext("/src/components/AnimatedPage.tsx");import * as RefreshRuntime from "/@react-refresh";
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
  window.$RefreshReg$ = RefreshRuntime.getRefreshReg("/dev-server/src/components/AnimatedPage.tsx");
  window.$RefreshSig$ = RefreshRuntime.createSignatureFunctionForTransform;
}

import __vite__cjsImport2_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=fb1d4910"; const _jsxDEV = __vite__cjsImport2_react_jsxDevRuntime["jsxDEV"];
import { motion } from "/node_modules/.vite/deps/framer-motion.js?v=0eb59201";
export function AnimatedPage({ children, className = "" }) {
    return /*#__PURE__*/ _jsxDEV(motion.div, {
        initial: {
            opacity: 0,
            y: 12
        },
        animate: {
            opacity: 1,
            y: 0
        },
        exit: {
            opacity: 0,
            y: -12
        },
        transition: {
            duration: 0.35,
            ease: [
                0.4,
                0,
                0.2,
                1
            ]
        },
        className: className,
        children: children
    }, void 0, false, {
        fileName: "/dev-server/src/components/AnimatedPage.tsx",
        lineNumber: 11,
        columnNumber: 5
    }, this);
}
_c = AnimatedPage;
export function AnimatedCard({ children, className = "", delay = 0 }) {
    return /*#__PURE__*/ _jsxDEV(motion.div, {
        initial: {
            opacity: 0,
            scale: 0.96,
            y: 16
        },
        animate: {
            opacity: 1,
            scale: 1,
            y: 0
        },
        transition: {
            duration: 0.4,
            delay,
            ease: [
                0.4,
                0,
                0.2,
                1
            ]
        },
        className: className,
        children: children
    }, void 0, false, {
        fileName: "/dev-server/src/components/AnimatedPage.tsx",
        lineNumber: 25,
        columnNumber: 5
    }, this);
}
_c1 = AnimatedCard;
export function AnimatedList({ children, className = "", index = 0 }) {
    return /*#__PURE__*/ _jsxDEV(motion.div, {
        initial: {
            opacity: 0,
            x: -20
        },
        animate: {
            opacity: 1,
            x: 0
        },
        transition: {
            duration: 0.3,
            delay: index * 0.05,
            ease: "easeOut"
        },
        className: className,
        children: children
    }, void 0, false, {
        fileName: "/dev-server/src/components/AnimatedPage.tsx",
        lineNumber: 38,
        columnNumber: 5
    }, this);
}
_c2 = AnimatedList;
var _c, _c1, _c2;
$RefreshReg$(_c, "AnimatedPage");
$RefreshReg$(_c1, "AnimatedCard");
$RefreshReg$(_c2, "AnimatedList");


if (import.meta.hot && !inWebWorker) {
  window.$RefreshReg$ = prevRefreshReg;
  window.$RefreshSig$ = prevRefreshSig;
}


if (import.meta.hot && !inWebWorker) {
  RefreshRuntime.__hmr_import(import.meta.url).then((currentExports) => {
    RefreshRuntime.registerExportsForReactRefresh("/dev-server/src/components/AnimatedPage.tsx", currentExports);
    import.meta.hot.accept((nextExports) => {
      if (!nextExports) return;
      const invalidateMessage = RefreshRuntime.validateRefreshBoundaryAndEnqueueUpdate("/dev-server/src/components/AnimatedPage.tsx", currentExports, nextExports);
      if (invalidateMessage) import.meta.hot.invalidate(invalidateMessage);
    });
  });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkFuaW1hdGVkUGFnZS50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgbW90aW9uIH0gZnJvbSBcImZyYW1lci1tb3Rpb25cIjtcbmltcG9ydCB7IFJlYWN0Tm9kZSB9IGZyb20gXCJyZWFjdFwiO1xuXG5pbnRlcmZhY2UgQW5pbWF0ZWRQYWdlUHJvcHMge1xuICBjaGlsZHJlbjogUmVhY3ROb2RlO1xuICBjbGFzc05hbWU/OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBBbmltYXRlZFBhZ2UoeyBjaGlsZHJlbiwgY2xhc3NOYW1lID0gXCJcIiB9OiBBbmltYXRlZFBhZ2VQcm9wcykge1xuICByZXR1cm4gKFxuICAgIDxtb3Rpb24uZGl2XG4gICAgICBpbml0aWFsPXt7IG9wYWNpdHk6IDAsIHk6IDEyIH19XG4gICAgICBhbmltYXRlPXt7IG9wYWNpdHk6IDEsIHk6IDAgfX1cbiAgICAgIGV4aXQ9e3sgb3BhY2l0eTogMCwgeTogLTEyIH19XG4gICAgICB0cmFuc2l0aW9uPXt7IGR1cmF0aW9uOiAwLjM1LCBlYXNlOiBbMC40LCAwLCAwLjIsIDFdIH19XG4gICAgICBjbGFzc05hbWU9e2NsYXNzTmFtZX1cbiAgICA+XG4gICAgICB7Y2hpbGRyZW59XG4gICAgPC9tb3Rpb24uZGl2PlxuICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gQW5pbWF0ZWRDYXJkKHsgY2hpbGRyZW4sIGNsYXNzTmFtZSA9IFwiXCIsIGRlbGF5ID0gMCB9OiBBbmltYXRlZFBhZ2VQcm9wcyAmIHsgZGVsYXk/OiBudW1iZXIgfSkge1xuICByZXR1cm4gKFxuICAgIDxtb3Rpb24uZGl2XG4gICAgICBpbml0aWFsPXt7IG9wYWNpdHk6IDAsIHNjYWxlOiAwLjk2LCB5OiAxNiB9fVxuICAgICAgYW5pbWF0ZT17eyBvcGFjaXR5OiAxLCBzY2FsZTogMSwgeTogMCB9fVxuICAgICAgdHJhbnNpdGlvbj17eyBkdXJhdGlvbjogMC40LCBkZWxheSwgZWFzZTogWzAuNCwgMCwgMC4yLCAxXSB9fVxuICAgICAgY2xhc3NOYW1lPXtjbGFzc05hbWV9XG4gICAgPlxuICAgICAge2NoaWxkcmVufVxuICAgIDwvbW90aW9uLmRpdj5cbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEFuaW1hdGVkTGlzdCh7IGNoaWxkcmVuLCBjbGFzc05hbWUgPSBcIlwiLCBpbmRleCA9IDAgfTogQW5pbWF0ZWRQYWdlUHJvcHMgJiB7IGluZGV4PzogbnVtYmVyIH0pIHtcbiAgcmV0dXJuIChcbiAgICA8bW90aW9uLmRpdlxuICAgICAgaW5pdGlhbD17eyBvcGFjaXR5OiAwLCB4OiAtMjAgfX1cbiAgICAgIGFuaW1hdGU9e3sgb3BhY2l0eTogMSwgeDogMCB9fVxuICAgICAgdHJhbnNpdGlvbj17eyBkdXJhdGlvbjogMC4zLCBkZWxheTogaW5kZXggKiAwLjA1LCBlYXNlOiBcImVhc2VPdXRcIiB9fVxuICAgICAgY2xhc3NOYW1lPXtjbGFzc05hbWV9XG4gICAgPlxuICAgICAge2NoaWxkcmVufVxuICAgIDwvbW90aW9uLmRpdj5cbiAgKTtcbn1cbiJdLCJuYW1lcyI6WyJtb3Rpb24iLCJBbmltYXRlZFBhZ2UiLCJjaGlsZHJlbiIsImNsYXNzTmFtZSIsImRpdiIsImluaXRpYWwiLCJvcGFjaXR5IiwieSIsImFuaW1hdGUiLCJleGl0IiwidHJhbnNpdGlvbiIsImR1cmF0aW9uIiwiZWFzZSIsIkFuaW1hdGVkQ2FyZCIsImRlbGF5Iiwic2NhbGUiLCJBbmltYXRlZExpc3QiLCJpbmRleCIsIngiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsU0FBU0EsTUFBTSxRQUFRLGdCQUFnQjtBQVF2QyxPQUFPLFNBQVNDLGFBQWEsRUFBRUMsUUFBUSxFQUFFQyxZQUFZLEVBQUUsRUFBcUI7SUFDMUUscUJBQ0UsUUFBQ0gsT0FBT0ksR0FBRztRQUNUQyxTQUFTO1lBQUVDLFNBQVM7WUFBR0MsR0FBRztRQUFHO1FBQzdCQyxTQUFTO1lBQUVGLFNBQVM7WUFBR0MsR0FBRztRQUFFO1FBQzVCRSxNQUFNO1lBQUVILFNBQVM7WUFBR0MsR0FBRyxDQUFDO1FBQUc7UUFDM0JHLFlBQVk7WUFBRUMsVUFBVTtZQUFNQyxNQUFNO2dCQUFDO2dCQUFLO2dCQUFHO2dCQUFLO2FBQUU7UUFBQztRQUNyRFQsV0FBV0E7a0JBRVZEOzs7Ozs7QUFHUDtLQVpnQkQ7QUFjaEIsT0FBTyxTQUFTWSxhQUFhLEVBQUVYLFFBQVEsRUFBRUMsWUFBWSxFQUFFLEVBQUVXLFFBQVEsQ0FBQyxFQUEwQztJQUMxRyxxQkFDRSxRQUFDZCxPQUFPSSxHQUFHO1FBQ1RDLFNBQVM7WUFBRUMsU0FBUztZQUFHUyxPQUFPO1lBQU1SLEdBQUc7UUFBRztRQUMxQ0MsU0FBUztZQUFFRixTQUFTO1lBQUdTLE9BQU87WUFBR1IsR0FBRztRQUFFO1FBQ3RDRyxZQUFZO1lBQUVDLFVBQVU7WUFBS0c7WUFBT0YsTUFBTTtnQkFBQztnQkFBSztnQkFBRztnQkFBSzthQUFFO1FBQUM7UUFDM0RULFdBQVdBO2tCQUVWRDs7Ozs7O0FBR1A7TUFYZ0JXO0FBYWhCLE9BQU8sU0FBU0csYUFBYSxFQUFFZCxRQUFRLEVBQUVDLFlBQVksRUFBRSxFQUFFYyxRQUFRLENBQUMsRUFBMEM7SUFDMUcscUJBQ0UsUUFBQ2pCLE9BQU9JLEdBQUc7UUFDVEMsU0FBUztZQUFFQyxTQUFTO1lBQUdZLEdBQUcsQ0FBQztRQUFHO1FBQzlCVixTQUFTO1lBQUVGLFNBQVM7WUFBR1ksR0FBRztRQUFFO1FBQzVCUixZQUFZO1lBQUVDLFVBQVU7WUFBS0csT0FBT0csUUFBUTtZQUFNTCxNQUFNO1FBQVU7UUFDbEVULFdBQVdBO2tCQUVWRDs7Ozs7O0FBR1A7TUFYZ0JjIn0=