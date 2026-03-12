import { createHotContext as __vite__createHotContext } from "/@vite/client";import.meta.hot = __vite__createHotContext("/src/components/AnimatedCheck.tsx");import * as RefreshRuntime from "/@react-refresh";
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
  window.$RefreshReg$ = RefreshRuntime.getRefreshReg("/dev-server/src/components/AnimatedCheck.tsx");
  window.$RefreshSig$ = RefreshRuntime.createSignatureFunctionForTransform;
}

import __vite__cjsImport2_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=fb1d4910"; const _jsxDEV = __vite__cjsImport2_react_jsxDevRuntime["jsxDEV"];
import __vite__cjsImport3_react from "/node_modules/.vite/deps/react.js?v=b874473c"; const memo = __vite__cjsImport3_react["memo"];
const AnimatedCheck = /*#__PURE__*/ memo(_c = ({ size = 16, className = "" })=>/*#__PURE__*/ _jsxDEV("svg", {
        width: size,
        height: size,
        viewBox: "0 0 24 24",
        fill: "none",
        className: className,
        children: [
            /*#__PURE__*/ _jsxDEV("circle", {
                cx: "12",
                cy: "12",
                r: "10",
                stroke: "currentColor",
                strokeWidth: "2",
                fill: "none",
                strokeDasharray: "63",
                strokeDashoffset: "0",
                style: {
                    animation: "draw-circle 2s ease-in-out infinite"
                }
            }, void 0, false, {
                fileName: "/dev-server/src/components/AnimatedCheck.tsx",
                lineNumber: 17,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ _jsxDEV("path", {
                d: "M8 12.5L11 15.5L16 9",
                stroke: "currentColor",
                strokeWidth: "2",
                strokeLinecap: "round",
                strokeLinejoin: "round",
                fill: "none",
                strokeDasharray: "20",
                strokeDashoffset: "20",
                style: {
                    animation: "draw-tick 2s ease-in-out infinite"
                }
            }, void 0, false, {
                fileName: "/dev-server/src/components/AnimatedCheck.tsx",
                lineNumber: 31,
                columnNumber: 5
            }, this)
        ]
    }, void 0, true, {
        fileName: "/dev-server/src/components/AnimatedCheck.tsx",
        lineNumber: 9,
        columnNumber: 3
    }, this));
_c1 = AnimatedCheck;
AnimatedCheck.displayName = "AnimatedCheck";
export default AnimatedCheck;
var _c, _c1;
$RefreshReg$(_c, "AnimatedCheck$memo");
$RefreshReg$(_c1, "AnimatedCheck");


if (import.meta.hot && !inWebWorker) {
  window.$RefreshReg$ = prevRefreshReg;
  window.$RefreshSig$ = prevRefreshSig;
}


if (import.meta.hot && !inWebWorker) {
  RefreshRuntime.__hmr_import(import.meta.url).then((currentExports) => {
    RefreshRuntime.registerExportsForReactRefresh("/dev-server/src/components/AnimatedCheck.tsx", currentExports);
    import.meta.hot.accept((nextExports) => {
      if (!nextExports) return;
      const invalidateMessage = RefreshRuntime.validateRefreshBoundaryAndEnqueueUpdate("/dev-server/src/components/AnimatedCheck.tsx", currentExports, nextExports);
      if (invalidateMessage) import.meta.hot.invalidate(invalidateMessage);
    });
  });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkFuaW1hdGVkQ2hlY2sudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IG1lbW8gfSBmcm9tIFwicmVhY3RcIjtcblxuaW50ZXJmYWNlIEFuaW1hdGVkQ2hlY2tQcm9wcyB7XG4gIHNpemU/OiBudW1iZXI7XG4gIGNsYXNzTmFtZT86IHN0cmluZztcbn1cblxuY29uc3QgQW5pbWF0ZWRDaGVjayA9IG1lbW8oKHsgc2l6ZSA9IDE2LCBjbGFzc05hbWUgPSBcIlwiIH06IEFuaW1hdGVkQ2hlY2tQcm9wcykgPT4gKFxuICA8c3ZnXG4gICAgd2lkdGg9e3NpemV9XG4gICAgaGVpZ2h0PXtzaXplfVxuICAgIHZpZXdCb3g9XCIwIDAgMjQgMjRcIlxuICAgIGZpbGw9XCJub25lXCJcbiAgICBjbGFzc05hbWU9e2NsYXNzTmFtZX1cbiAgPlxuICAgIHsvKiBDaXJjbGUgKi99XG4gICAgPGNpcmNsZVxuICAgICAgY3g9XCIxMlwiXG4gICAgICBjeT1cIjEyXCJcbiAgICAgIHI9XCIxMFwiXG4gICAgICBzdHJva2U9XCJjdXJyZW50Q29sb3JcIlxuICAgICAgc3Ryb2tlV2lkdGg9XCIyXCJcbiAgICAgIGZpbGw9XCJub25lXCJcbiAgICAgIHN0cm9rZURhc2hhcnJheT1cIjYzXCJcbiAgICAgIHN0cm9rZURhc2hvZmZzZXQ9XCIwXCJcbiAgICAgIHN0eWxlPXt7XG4gICAgICAgIGFuaW1hdGlvbjogXCJkcmF3LWNpcmNsZSAycyBlYXNlLWluLW91dCBpbmZpbml0ZVwiLFxuICAgICAgfX1cbiAgICAvPlxuICAgIHsvKiBDaGVja21hcmsgKi99XG4gICAgPHBhdGhcbiAgICAgIGQ9XCJNOCAxMi41TDExIDE1LjVMMTYgOVwiXG4gICAgICBzdHJva2U9XCJjdXJyZW50Q29sb3JcIlxuICAgICAgc3Ryb2tlV2lkdGg9XCIyXCJcbiAgICAgIHN0cm9rZUxpbmVjYXA9XCJyb3VuZFwiXG4gICAgICBzdHJva2VMaW5lam9pbj1cInJvdW5kXCJcbiAgICAgIGZpbGw9XCJub25lXCJcbiAgICAgIHN0cm9rZURhc2hhcnJheT1cIjIwXCJcbiAgICAgIHN0cm9rZURhc2hvZmZzZXQ9XCIyMFwiXG4gICAgICBzdHlsZT17e1xuICAgICAgICBhbmltYXRpb246IFwiZHJhdy10aWNrIDJzIGVhc2UtaW4tb3V0IGluZmluaXRlXCIsXG4gICAgICB9fVxuICAgIC8+XG4gIDwvc3ZnPlxuKSk7XG5cbkFuaW1hdGVkQ2hlY2suZGlzcGxheU5hbWUgPSBcIkFuaW1hdGVkQ2hlY2tcIjtcblxuZXhwb3J0IGRlZmF1bHQgQW5pbWF0ZWRDaGVjaztcbiJdLCJuYW1lcyI6WyJtZW1vIiwiQW5pbWF0ZWRDaGVjayIsInNpemUiLCJjbGFzc05hbWUiLCJzdmciLCJ3aWR0aCIsImhlaWdodCIsInZpZXdCb3giLCJmaWxsIiwiY2lyY2xlIiwiY3giLCJjeSIsInIiLCJzdHJva2UiLCJzdHJva2VXaWR0aCIsInN0cm9rZURhc2hhcnJheSIsInN0cm9rZURhc2hvZmZzZXQiLCJzdHlsZSIsImFuaW1hdGlvbiIsInBhdGgiLCJkIiwic3Ryb2tlTGluZWNhcCIsInN0cm9rZUxpbmVqb2luIiwiZGlzcGxheU5hbWUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsU0FBU0EsSUFBSSxRQUFRLFFBQVE7QUFPN0IsTUFBTUMsOEJBQWdCRCxVQUFLLENBQUMsRUFBRUUsT0FBTyxFQUFFLEVBQUVDLFlBQVksRUFBRSxFQUFzQixpQkFDM0UsUUFBQ0M7UUFDQ0MsT0FBT0g7UUFDUEksUUFBUUo7UUFDUkssU0FBUTtRQUNSQyxNQUFLO1FBQ0xMLFdBQVdBOzswQkFHWCxRQUFDTTtnQkFDQ0MsSUFBRztnQkFDSEMsSUFBRztnQkFDSEMsR0FBRTtnQkFDRkMsUUFBTztnQkFDUEMsYUFBWTtnQkFDWk4sTUFBSztnQkFDTE8saUJBQWdCO2dCQUNoQkMsa0JBQWlCO2dCQUNqQkMsT0FBTztvQkFDTEMsV0FBVztnQkFDYjs7Ozs7OzBCQUdGLFFBQUNDO2dCQUNDQyxHQUFFO2dCQUNGUCxRQUFPO2dCQUNQQyxhQUFZO2dCQUNaTyxlQUFjO2dCQUNkQyxnQkFBZTtnQkFDZmQsTUFBSztnQkFDTE8saUJBQWdCO2dCQUNoQkMsa0JBQWlCO2dCQUNqQkMsT0FBTztvQkFDTEMsV0FBVztnQkFDYjs7Ozs7Ozs7Ozs7OztBQUtOakIsY0FBY3NCLFdBQVcsR0FBRztBQUU1QixlQUFldEIsY0FBYyJ9