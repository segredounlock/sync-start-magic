import { createHotContext as __vite__createHotContext } from "/@vite/client";import.meta.hot = __vite__createHotContext("/src/components/AnimatedCounter.tsx");import * as RefreshRuntime from "/@react-refresh";
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
  window.$RefreshReg$ = RefreshRuntime.getRefreshReg("/dev-server/src/components/AnimatedCounter.tsx");
  window.$RefreshSig$ = RefreshRuntime.createSignatureFunctionForTransform;
}

import __vite__cjsImport2_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=fb1d4910"; const _jsxDEV = __vite__cjsImport2_react_jsxDevRuntime["jsxDEV"];
var _s = $RefreshSig$(), _s1 = $RefreshSig$();
import __vite__cjsImport3_react from "/node_modules/.vite/deps/react.js?v=b874473c"; const useEffect = __vite__cjsImport3_react["useEffect"]; const useRef = __vite__cjsImport3_react["useRef"]; const useState = __vite__cjsImport3_react["useState"];
export function AnimatedCounter({ value, prefix = "", suffix = "", decimals = 2, duration = 600, className = "" }) {
    _s();
    const [display, setDisplay] = useState(value);
    const prevValue = useRef(value);
    const rafRef = useRef();
    useEffect(()=>{
        const from = prevValue.current;
        const to = value;
        prevValue.current = value;
        if (from === to) {
            setDisplay(to);
            return;
        }
        const startTime = performance.now();
        const animate = (now)=>{
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // easeOutExpo
            const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            setDisplay(from + (to - from) * eased);
            if (progress < 1) {
                rafRef.current = requestAnimationFrame(animate);
            }
        };
        rafRef.current = requestAnimationFrame(animate);
        return ()=>{
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [
        value,
        duration
    ]);
    const formatted = display.toLocaleString("pt-BR", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
    return /*#__PURE__*/ _jsxDEV("span", {
        className: className,
        children: [
            prefix,
            formatted,
            suffix
        ]
    }, void 0, true, {
        fileName: "/dev-server/src/components/AnimatedCounter.tsx",
        lineNumber: 60,
        columnNumber: 5
    }, this);
}
_s(AnimatedCounter, "yG9GWC2Gd7HmF/wX7gDhOebJ3HY=");
_c = AnimatedCounter;
export function AnimatedInt({ value, duration = 600, className = "" }) {
    _s1();
    const [display, setDisplay] = useState(value);
    const prevValue = useRef(value);
    const rafRef = useRef();
    useEffect(()=>{
        const from = prevValue.current;
        const to = value;
        prevValue.current = value;
        if (from === to) {
            setDisplay(to);
            return;
        }
        const startTime = performance.now();
        const animate = (now)=>{
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            setDisplay(Math.round(from + (to - from) * eased));
            if (progress < 1) {
                rafRef.current = requestAnimationFrame(animate);
            }
        };
        rafRef.current = requestAnimationFrame(animate);
        return ()=>{
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [
        value,
        duration
    ]);
    return /*#__PURE__*/ _jsxDEV("span", {
        className: className,
        children: display
    }, void 0, false, {
        fileName: "/dev-server/src/components/AnimatedCounter.tsx",
        lineNumber: 106,
        columnNumber: 10
    }, this);
}
_s1(AnimatedInt, "yG9GWC2Gd7HmF/wX7gDhOebJ3HY=");
_c1 = AnimatedInt;
var _c, _c1;
$RefreshReg$(_c, "AnimatedCounter");
$RefreshReg$(_c1, "AnimatedInt");


if (import.meta.hot && !inWebWorker) {
  window.$RefreshReg$ = prevRefreshReg;
  window.$RefreshSig$ = prevRefreshSig;
}


if (import.meta.hot && !inWebWorker) {
  RefreshRuntime.__hmr_import(import.meta.url).then((currentExports) => {
    RefreshRuntime.registerExportsForReactRefresh("/dev-server/src/components/AnimatedCounter.tsx", currentExports);
    import.meta.hot.accept((nextExports) => {
      if (!nextExports) return;
      const invalidateMessage = RefreshRuntime.validateRefreshBoundaryAndEnqueueUpdate("/dev-server/src/components/AnimatedCounter.tsx", currentExports, nextExports);
      if (invalidateMessage) import.meta.hot.invalidate(invalidateMessage);
    });
  });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkFuaW1hdGVkQ291bnRlci50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgdXNlRWZmZWN0LCB1c2VSZWYsIHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCI7XG5cbmludGVyZmFjZSBBbmltYXRlZENvdW50ZXJQcm9wcyB7XG4gIHZhbHVlOiBudW1iZXI7XG4gIHByZWZpeD86IHN0cmluZztcbiAgc3VmZml4Pzogc3RyaW5nO1xuICBkZWNpbWFscz86IG51bWJlcjtcbiAgZHVyYXRpb24/OiBudW1iZXI7XG4gIGNsYXNzTmFtZT86IHN0cmluZztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEFuaW1hdGVkQ291bnRlcih7XG4gIHZhbHVlLFxuICBwcmVmaXggPSBcIlwiLFxuICBzdWZmaXggPSBcIlwiLFxuICBkZWNpbWFscyA9IDIsXG4gIGR1cmF0aW9uID0gNjAwLFxuICBjbGFzc05hbWUgPSBcIlwiLFxufTogQW5pbWF0ZWRDb3VudGVyUHJvcHMpIHtcbiAgY29uc3QgW2Rpc3BsYXksIHNldERpc3BsYXldID0gdXNlU3RhdGUodmFsdWUpO1xuICBjb25zdCBwcmV2VmFsdWUgPSB1c2VSZWYodmFsdWUpO1xuICBjb25zdCByYWZSZWYgPSB1c2VSZWY8bnVtYmVyPigpO1xuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3QgZnJvbSA9IHByZXZWYWx1ZS5jdXJyZW50O1xuICAgIGNvbnN0IHRvID0gdmFsdWU7XG4gICAgcHJldlZhbHVlLmN1cnJlbnQgPSB2YWx1ZTtcblxuICAgIGlmIChmcm9tID09PSB0bykge1xuICAgICAgc2V0RGlzcGxheSh0byk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qgc3RhcnRUaW1lID0gcGVyZm9ybWFuY2Uubm93KCk7XG5cbiAgICBjb25zdCBhbmltYXRlID0gKG5vdzogbnVtYmVyKSA9PiB7XG4gICAgICBjb25zdCBlbGFwc2VkID0gbm93IC0gc3RhcnRUaW1lO1xuICAgICAgY29uc3QgcHJvZ3Jlc3MgPSBNYXRoLm1pbihlbGFwc2VkIC8gZHVyYXRpb24sIDEpO1xuICAgICAgLy8gZWFzZU91dEV4cG9cbiAgICAgIGNvbnN0IGVhc2VkID0gcHJvZ3Jlc3MgPT09IDEgPyAxIDogMSAtIE1hdGgucG93KDIsIC0xMCAqIHByb2dyZXNzKTtcbiAgICAgIHNldERpc3BsYXkoZnJvbSArICh0byAtIGZyb20pICogZWFzZWQpO1xuXG4gICAgICBpZiAocHJvZ3Jlc3MgPCAxKSB7XG4gICAgICAgIHJhZlJlZi5jdXJyZW50ID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGFuaW1hdGUpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICByYWZSZWYuY3VycmVudCA9IHJlcXVlc3RBbmltYXRpb25GcmFtZShhbmltYXRlKTtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgaWYgKHJhZlJlZi5jdXJyZW50KSBjYW5jZWxBbmltYXRpb25GcmFtZShyYWZSZWYuY3VycmVudCk7XG4gICAgfTtcbiAgfSwgW3ZhbHVlLCBkdXJhdGlvbl0pO1xuXG4gIGNvbnN0IGZvcm1hdHRlZCA9IGRpc3BsYXkudG9Mb2NhbGVTdHJpbmcoXCJwdC1CUlwiLCB7XG4gICAgbWluaW11bUZyYWN0aW9uRGlnaXRzOiBkZWNpbWFscyxcbiAgICBtYXhpbXVtRnJhY3Rpb25EaWdpdHM6IGRlY2ltYWxzLFxuICB9KTtcblxuICByZXR1cm4gKFxuICAgIDxzcGFuIGNsYXNzTmFtZT17Y2xhc3NOYW1lfT5cbiAgICAgIHtwcmVmaXh9e2Zvcm1hdHRlZH17c3VmZml4fVxuICAgIDwvc3Bhbj5cbiAgKTtcbn1cblxuaW50ZXJmYWNlIEFuaW1hdGVkSW50UHJvcHMge1xuICB2YWx1ZTogbnVtYmVyO1xuICBkdXJhdGlvbj86IG51bWJlcjtcbiAgY2xhc3NOYW1lPzogc3RyaW5nO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gQW5pbWF0ZWRJbnQoeyB2YWx1ZSwgZHVyYXRpb24gPSA2MDAsIGNsYXNzTmFtZSA9IFwiXCIgfTogQW5pbWF0ZWRJbnRQcm9wcykge1xuICBjb25zdCBbZGlzcGxheSwgc2V0RGlzcGxheV0gPSB1c2VTdGF0ZSh2YWx1ZSk7XG4gIGNvbnN0IHByZXZWYWx1ZSA9IHVzZVJlZih2YWx1ZSk7XG4gIGNvbnN0IHJhZlJlZiA9IHVzZVJlZjxudW1iZXI+KCk7XG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBmcm9tID0gcHJldlZhbHVlLmN1cnJlbnQ7XG4gICAgY29uc3QgdG8gPSB2YWx1ZTtcbiAgICBwcmV2VmFsdWUuY3VycmVudCA9IHZhbHVlO1xuXG4gICAgaWYgKGZyb20gPT09IHRvKSB7XG4gICAgICBzZXREaXNwbGF5KHRvKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBzdGFydFRpbWUgPSBwZXJmb3JtYW5jZS5ub3coKTtcblxuICAgIGNvbnN0IGFuaW1hdGUgPSAobm93OiBudW1iZXIpID0+IHtcbiAgICAgIGNvbnN0IGVsYXBzZWQgPSBub3cgLSBzdGFydFRpbWU7XG4gICAgICBjb25zdCBwcm9ncmVzcyA9IE1hdGgubWluKGVsYXBzZWQgLyBkdXJhdGlvbiwgMSk7XG4gICAgICBjb25zdCBlYXNlZCA9IHByb2dyZXNzID09PSAxID8gMSA6IDEgLSBNYXRoLnBvdygyLCAtMTAgKiBwcm9ncmVzcyk7XG4gICAgICBzZXREaXNwbGF5KE1hdGgucm91bmQoZnJvbSArICh0byAtIGZyb20pICogZWFzZWQpKTtcblxuICAgICAgaWYgKHByb2dyZXNzIDwgMSkge1xuICAgICAgICByYWZSZWYuY3VycmVudCA9IHJlcXVlc3RBbmltYXRpb25GcmFtZShhbmltYXRlKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmFmUmVmLmN1cnJlbnQgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYW5pbWF0ZSk7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGlmIChyYWZSZWYuY3VycmVudCkgY2FuY2VsQW5pbWF0aW9uRnJhbWUocmFmUmVmLmN1cnJlbnQpO1xuICAgIH07XG4gIH0sIFt2YWx1ZSwgZHVyYXRpb25dKTtcblxuICByZXR1cm4gPHNwYW4gY2xhc3NOYW1lPXtjbGFzc05hbWV9PntkaXNwbGF5fTwvc3Bhbj47XG59XG4iXSwibmFtZXMiOlsidXNlRWZmZWN0IiwidXNlUmVmIiwidXNlU3RhdGUiLCJBbmltYXRlZENvdW50ZXIiLCJ2YWx1ZSIsInByZWZpeCIsInN1ZmZpeCIsImRlY2ltYWxzIiwiZHVyYXRpb24iLCJjbGFzc05hbWUiLCJkaXNwbGF5Iiwic2V0RGlzcGxheSIsInByZXZWYWx1ZSIsInJhZlJlZiIsImZyb20iLCJjdXJyZW50IiwidG8iLCJzdGFydFRpbWUiLCJwZXJmb3JtYW5jZSIsIm5vdyIsImFuaW1hdGUiLCJlbGFwc2VkIiwicHJvZ3Jlc3MiLCJNYXRoIiwibWluIiwiZWFzZWQiLCJwb3ciLCJyZXF1ZXN0QW5pbWF0aW9uRnJhbWUiLCJjYW5jZWxBbmltYXRpb25GcmFtZSIsImZvcm1hdHRlZCIsInRvTG9jYWxlU3RyaW5nIiwibWluaW11bUZyYWN0aW9uRGlnaXRzIiwibWF4aW11bUZyYWN0aW9uRGlnaXRzIiwic3BhbiIsIkFuaW1hdGVkSW50Iiwicm91bmQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLFNBQVNBLFNBQVMsRUFBRUMsTUFBTSxFQUFFQyxRQUFRLFFBQVEsUUFBUTtBQVdwRCxPQUFPLFNBQVNDLGdCQUFnQixFQUM5QkMsS0FBSyxFQUNMQyxTQUFTLEVBQUUsRUFDWEMsU0FBUyxFQUFFLEVBQ1hDLFdBQVcsQ0FBQyxFQUNaQyxXQUFXLEdBQUcsRUFDZEMsWUFBWSxFQUFFLEVBQ087O0lBQ3JCLE1BQU0sQ0FBQ0MsU0FBU0MsV0FBVyxHQUFHVCxTQUFTRTtJQUN2QyxNQUFNUSxZQUFZWCxPQUFPRztJQUN6QixNQUFNUyxTQUFTWjtJQUVmRCxVQUFVO1FBQ1IsTUFBTWMsT0FBT0YsVUFBVUcsT0FBTztRQUM5QixNQUFNQyxLQUFLWjtRQUNYUSxVQUFVRyxPQUFPLEdBQUdYO1FBRXBCLElBQUlVLFNBQVNFLElBQUk7WUFDZkwsV0FBV0s7WUFDWDtRQUNGO1FBRUEsTUFBTUMsWUFBWUMsWUFBWUMsR0FBRztRQUVqQyxNQUFNQyxVQUFVLENBQUNEO1lBQ2YsTUFBTUUsVUFBVUYsTUFBTUY7WUFDdEIsTUFBTUssV0FBV0MsS0FBS0MsR0FBRyxDQUFDSCxVQUFVYixVQUFVO1lBQzlDLGNBQWM7WUFDZCxNQUFNaUIsUUFBUUgsYUFBYSxJQUFJLElBQUksSUFBSUMsS0FBS0csR0FBRyxDQUFDLEdBQUcsQ0FBQyxLQUFLSjtZQUN6RFgsV0FBV0csT0FBTyxBQUFDRSxDQUFBQSxLQUFLRixJQUFHLElBQUtXO1lBRWhDLElBQUlILFdBQVcsR0FBRztnQkFDaEJULE9BQU9FLE9BQU8sR0FBR1ksc0JBQXNCUDtZQUN6QztRQUNGO1FBRUFQLE9BQU9FLE9BQU8sR0FBR1ksc0JBQXNCUDtRQUN2QyxPQUFPO1lBQ0wsSUFBSVAsT0FBT0UsT0FBTyxFQUFFYSxxQkFBcUJmLE9BQU9FLE9BQU87UUFDekQ7SUFDRixHQUFHO1FBQUNYO1FBQU9JO0tBQVM7SUFFcEIsTUFBTXFCLFlBQVluQixRQUFRb0IsY0FBYyxDQUFDLFNBQVM7UUFDaERDLHVCQUF1QnhCO1FBQ3ZCeUIsdUJBQXVCekI7SUFDekI7SUFFQSxxQkFDRSxRQUFDMEI7UUFBS3hCLFdBQVdBOztZQUNkSjtZQUFRd0I7WUFBV3ZCOzs7Ozs7O0FBRzFCO0dBcERnQkg7S0FBQUE7QUE0RGhCLE9BQU8sU0FBUytCLFlBQVksRUFBRTlCLEtBQUssRUFBRUksV0FBVyxHQUFHLEVBQUVDLFlBQVksRUFBRSxFQUFvQjs7SUFDckYsTUFBTSxDQUFDQyxTQUFTQyxXQUFXLEdBQUdULFNBQVNFO0lBQ3ZDLE1BQU1RLFlBQVlYLE9BQU9HO0lBQ3pCLE1BQU1TLFNBQVNaO0lBRWZELFVBQVU7UUFDUixNQUFNYyxPQUFPRixVQUFVRyxPQUFPO1FBQzlCLE1BQU1DLEtBQUtaO1FBQ1hRLFVBQVVHLE9BQU8sR0FBR1g7UUFFcEIsSUFBSVUsU0FBU0UsSUFBSTtZQUNmTCxXQUFXSztZQUNYO1FBQ0Y7UUFFQSxNQUFNQyxZQUFZQyxZQUFZQyxHQUFHO1FBRWpDLE1BQU1DLFVBQVUsQ0FBQ0Q7WUFDZixNQUFNRSxVQUFVRixNQUFNRjtZQUN0QixNQUFNSyxXQUFXQyxLQUFLQyxHQUFHLENBQUNILFVBQVViLFVBQVU7WUFDOUMsTUFBTWlCLFFBQVFILGFBQWEsSUFBSSxJQUFJLElBQUlDLEtBQUtHLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBS0o7WUFDekRYLFdBQVdZLEtBQUtZLEtBQUssQ0FBQ3JCLE9BQU8sQUFBQ0UsQ0FBQUEsS0FBS0YsSUFBRyxJQUFLVztZQUUzQyxJQUFJSCxXQUFXLEdBQUc7Z0JBQ2hCVCxPQUFPRSxPQUFPLEdBQUdZLHNCQUFzQlA7WUFDekM7UUFDRjtRQUVBUCxPQUFPRSxPQUFPLEdBQUdZLHNCQUFzQlA7UUFDdkMsT0FBTztZQUNMLElBQUlQLE9BQU9FLE9BQU8sRUFBRWEscUJBQXFCZixPQUFPRSxPQUFPO1FBQ3pEO0lBQ0YsR0FBRztRQUFDWDtRQUFPSTtLQUFTO0lBRXBCLHFCQUFPLFFBQUN5QjtRQUFLeEIsV0FBV0E7a0JBQVlDOzs7Ozs7QUFDdEM7SUFuQ2dCd0I7TUFBQUEifQ==