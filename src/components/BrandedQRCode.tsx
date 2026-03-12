import { createHotContext as __vite__createHotContext } from "/@vite/client";import.meta.hot = __vite__createHotContext("/src/components/BrandedQRCode.tsx");import * as RefreshRuntime from "/@react-refresh";
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
  window.$RefreshReg$ = RefreshRuntime.getRefreshReg("/dev-server/src/components/BrandedQRCode.tsx");
  window.$RefreshSig$ = RefreshRuntime.createSignatureFunctionForTransform;
}

import __vite__cjsImport2_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=fb1d4910"; const _jsxDEV = __vite__cjsImport2_react_jsxDevRuntime["jsxDEV"]; const _Fragment = __vite__cjsImport2_react_jsxDevRuntime["Fragment"];
import { QRCodeSVG } from "/node_modules/.vite/deps/qrcode__react.js?v=9b410283";
const BrandedQRCode = ({ value, size = 176, brandName })=>{
    return /*#__PURE__*/ _jsxDEV("div", {
        className: "bg-[#0a0a0a] rounded-2xl shadow-lg p-5 flex flex-col items-center gap-3 border border-border/30",
        children: [
            /*#__PURE__*/ _jsxDEV("div", {
                className: "bg-white p-3 rounded-xl",
                children: /*#__PURE__*/ _jsxDEV(QRCodeSVG, {
                    value: value,
                    size: size,
                    level: "M",
                    bgColor: "#ffffff",
                    fgColor: "#000000",
                    includeMargin: false
                }, void 0, false, {
                    fileName: "/dev-server/src/components/BrandedQRCode.tsx",
                    lineNumber: 13,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "/dev-server/src/components/BrandedQRCode.tsx",
                lineNumber: 12,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ _jsxDEV("div", {
                className: "flex items-center gap-1.5",
                children: brandName ? /*#__PURE__*/ _jsxDEV("span", {
                    className: "text-white font-display text-sm font-bold tracking-wide",
                    children: brandName
                }, void 0, false, {
                    fileName: "/dev-server/src/components/BrandedQRCode.tsx",
                    lineNumber: 24,
                    columnNumber: 11
                }, this) : /*#__PURE__*/ _jsxDEV(_Fragment, {
                    children: [
                        /*#__PURE__*/ _jsxDEV("span", {
                            className: "text-white font-display text-sm font-bold tracking-wide",
                            children: "Recargas"
                        }, void 0, false, {
                            fileName: "/dev-server/src/components/BrandedQRCode.tsx",
                            lineNumber: 27,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ _jsxDEV("span", {
                            className: "text-success font-display text-sm font-bold tracking-wide",
                            children: "Brasil"
                        }, void 0, false, {
                            fileName: "/dev-server/src/components/BrandedQRCode.tsx",
                            lineNumber: 28,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true)
            }, void 0, false, {
                fileName: "/dev-server/src/components/BrandedQRCode.tsx",
                lineNumber: 22,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "/dev-server/src/components/BrandedQRCode.tsx",
        lineNumber: 11,
        columnNumber: 5
    }, this);
};
_c = BrandedQRCode;
export default BrandedQRCode;
var _c;
$RefreshReg$(_c, "BrandedQRCode");


if (import.meta.hot && !inWebWorker) {
  window.$RefreshReg$ = prevRefreshReg;
  window.$RefreshSig$ = prevRefreshSig;
}


if (import.meta.hot && !inWebWorker) {
  RefreshRuntime.__hmr_import(import.meta.url).then((currentExports) => {
    RefreshRuntime.registerExportsForReactRefresh("/dev-server/src/components/BrandedQRCode.tsx", currentExports);
    import.meta.hot.accept((nextExports) => {
      if (!nextExports) return;
      const invalidateMessage = RefreshRuntime.validateRefreshBoundaryAndEnqueueUpdate("/dev-server/src/components/BrandedQRCode.tsx", currentExports, nextExports);
      if (invalidateMessage) import.meta.hot.invalidate(invalidateMessage);
    });
  });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkJyYW5kZWRRUkNvZGUudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFFSQ29kZVNWRyB9IGZyb20gXCJxcmNvZGUucmVhY3RcIjtcblxuaW50ZXJmYWNlIEJyYW5kZWRRUkNvZGVQcm9wcyB7XG4gIHZhbHVlOiBzdHJpbmc7XG4gIHNpemU/OiBudW1iZXI7XG4gIGJyYW5kTmFtZT86IHN0cmluZztcbn1cblxuY29uc3QgQnJhbmRlZFFSQ29kZSA9ICh7IHZhbHVlLCBzaXplID0gMTc2LCBicmFuZE5hbWUgfTogQnJhbmRlZFFSQ29kZVByb3BzKSA9PiB7XG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJiZy1bIzBhMGEwYV0gcm91bmRlZC0yeGwgc2hhZG93LWxnIHAtNSBmbGV4IGZsZXgtY29sIGl0ZW1zLWNlbnRlciBnYXAtMyBib3JkZXIgYm9yZGVyLWJvcmRlci8zMFwiPlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJiZy13aGl0ZSBwLTMgcm91bmRlZC14bFwiPlxuICAgICAgICA8UVJDb2RlU1ZHXG4gICAgICAgICAgdmFsdWU9e3ZhbHVlfVxuICAgICAgICAgIHNpemU9e3NpemV9XG4gICAgICAgICAgbGV2ZWw9XCJNXCJcbiAgICAgICAgICBiZ0NvbG9yPVwiI2ZmZmZmZlwiXG4gICAgICAgICAgZmdDb2xvcj1cIiMwMDAwMDBcIlxuICAgICAgICAgIGluY2x1ZGVNYXJnaW49e2ZhbHNlfVxuICAgICAgICAvPlxuICAgICAgPC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGdhcC0xLjVcIj5cbiAgICAgICAge2JyYW5kTmFtZSA/IChcbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0ZXh0LXdoaXRlIGZvbnQtZGlzcGxheSB0ZXh0LXNtIGZvbnQtYm9sZCB0cmFja2luZy13aWRlXCI+e2JyYW5kTmFtZX08L3NwYW4+XG4gICAgICAgICkgOiAoXG4gICAgICAgICAgPD5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRleHQtd2hpdGUgZm9udC1kaXNwbGF5IHRleHQtc20gZm9udC1ib2xkIHRyYWNraW5nLXdpZGVcIj5SZWNhcmdhczwvc3Bhbj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRleHQtc3VjY2VzcyBmb250LWRpc3BsYXkgdGV4dC1zbSBmb250LWJvbGQgdHJhY2tpbmctd2lkZVwiPkJyYXNpbDwvc3Bhbj5cbiAgICAgICAgICA8Lz5cbiAgICAgICAgKX1cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICApO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgQnJhbmRlZFFSQ29kZTtcbiJdLCJuYW1lcyI6WyJRUkNvZGVTVkciLCJCcmFuZGVkUVJDb2RlIiwidmFsdWUiLCJzaXplIiwiYnJhbmROYW1lIiwiZGl2IiwiY2xhc3NOYW1lIiwibGV2ZWwiLCJiZ0NvbG9yIiwiZmdDb2xvciIsImluY2x1ZGVNYXJnaW4iLCJzcGFuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLFNBQVNBLFNBQVMsUUFBUSxlQUFlO0FBUXpDLE1BQU1DLGdCQUFnQixDQUFDLEVBQUVDLEtBQUssRUFBRUMsT0FBTyxHQUFHLEVBQUVDLFNBQVMsRUFBc0I7SUFDekUscUJBQ0UsUUFBQ0M7UUFBSUMsV0FBVTs7MEJBQ2IsUUFBQ0Q7Z0JBQUlDLFdBQVU7MEJBQ2IsY0FBQSxRQUFDTjtvQkFDQ0UsT0FBT0E7b0JBQ1BDLE1BQU1BO29CQUNOSSxPQUFNO29CQUNOQyxTQUFRO29CQUNSQyxTQUFRO29CQUNSQyxlQUFlOzs7Ozs7Ozs7OzswQkFHbkIsUUFBQ0w7Z0JBQUlDLFdBQVU7MEJBQ1pGLDBCQUNDLFFBQUNPO29CQUFLTCxXQUFVOzhCQUEyREY7Ozs7O3lDQUUzRTs7c0NBQ0UsUUFBQ087NEJBQUtMLFdBQVU7c0NBQTBEOzs7Ozs7c0NBQzFFLFFBQUNLOzRCQUFLTCxXQUFVO3NDQUE0RDs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQU14RjtLQXpCTUw7QUEyQk4sZUFBZUEsY0FBYyJ9