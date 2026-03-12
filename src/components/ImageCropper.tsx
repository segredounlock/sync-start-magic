import { createHotContext as __vite__createHotContext } from "/@vite/client";import.meta.hot = __vite__createHotContext("/src/components/ImageCropper.tsx");import * as RefreshRuntime from "/@react-refresh";
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
  window.$RefreshReg$ = RefreshRuntime.getRefreshReg("/dev-server/src/components/ImageCropper.tsx");
  window.$RefreshSig$ = RefreshRuntime.createSignatureFunctionForTransform;
}

import __vite__cjsImport2_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=fb1d4910"; const _jsxDEV = __vite__cjsImport2_react_jsxDevRuntime["jsxDEV"];
var _s = $RefreshSig$();
import __vite__cjsImport3_react from "/node_modules/.vite/deps/react.js?v=b874473c"; const useState = __vite__cjsImport3_react["useState"]; const useRef = __vite__cjsImport3_react["useRef"]; const useCallback = __vite__cjsImport3_react["useCallback"]; const useEffect = __vite__cjsImport3_react["useEffect"];
import { motion, AnimatePresence } from "/node_modules/.vite/deps/framer-motion.js?v=0eb59201";
import { ZoomIn, ZoomOut, Check, X, RotateCcw } from "/node_modules/.vite/deps/lucide-react.js?v=1627e724";
export function ImageCropper({ file, onCrop, onCancel }) {
    _s();
    const [imageUrl, setImageUrl] = useState(null);
    const [scale, setScale] = useState(1);
    const [offset, setOffset] = useState({
        x: 0,
        y: 0
    });
    const [dragging, setDragging] = useState(false);
    const [dragStart, setDragStart] = useState({
        x: 0,
        y: 0
    });
    const [imgSize, setImgSize] = useState({
        w: 0,
        h: 0
    });
    const containerRef = useRef(null);
    const imgRef = useRef(null);
    const CROP_SIZE = 280;
    useEffect(()=>{
        const url = URL.createObjectURL(file);
        setImageUrl(url);
        return ()=>URL.revokeObjectURL(url);
    }, [
        file
    ]);
    const handleImageLoad = useCallback((e)=>{
        const img = e.currentTarget;
        const aspect = img.naturalWidth / img.naturalHeight;
        let w, h;
        if (aspect > 1) {
            h = CROP_SIZE;
            w = CROP_SIZE * aspect;
        } else {
            w = CROP_SIZE;
            h = CROP_SIZE / aspect;
        }
        setImgSize({
            w,
            h
        });
        setOffset({
            x: 0,
            y: 0
        });
        // Ensure minimum scale keeps image covering the crop area
        const minScale = Math.max(CROP_SIZE / w, CROP_SIZE / h);
        setScale(Math.max(1, minScale));
    }, []);
    const handlePointerDown = (e)=>{
        e.preventDefault();
        setDragging(true);
        setDragStart({
            x: e.clientX - offset.x,
            y: e.clientY - offset.y
        });
        e.target.setPointerCapture(e.pointerId);
    };
    const handlePointerMove = (e)=>{
        if (!dragging) return;
        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;
        // Limit panning so image stays within crop area
        const maxX = Math.max(0, (imgSize.w * scale - CROP_SIZE) / 2);
        const maxY = Math.max(0, (imgSize.h * scale - CROP_SIZE) / 2);
        setOffset({
            x: Math.max(-maxX, Math.min(maxX, newX)),
            y: Math.max(-maxY, Math.min(maxY, newY))
        });
    };
    const handlePointerUp = ()=>setDragging(false);
    const handleWheel = (e)=>{
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.05 : 0.05;
        const minScale = imgSize.w > 0 ? Math.max(CROP_SIZE / imgSize.w, CROP_SIZE / imgSize.h) : 0.5;
        setScale((s)=>Math.max(minScale, Math.min(3, s + delta)));
    };
    const handleCrop = ()=>{
        if (!imgRef.current) return;
        const canvas = document.createElement("canvas");
        const outputSize = 400;
        canvas.width = outputSize;
        canvas.height = outputSize;
        const ctx = canvas.getContext("2d");
        const img = imgRef.current;
        const scaleRatio = img.naturalWidth / (imgSize.w * scale);
        const cropX = ((imgSize.w * scale - CROP_SIZE) / 2 - offset.x) * scaleRatio;
        const cropY = ((imgSize.h * scale - CROP_SIZE) / 2 - offset.y) * scaleRatio;
        const cropW = CROP_SIZE * scaleRatio;
        const cropH = CROP_SIZE * scaleRatio;
        ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, outputSize, outputSize);
        canvas.toBlob((blob)=>{
            if (blob) onCrop(blob);
        }, "image/jpeg", 0.9);
    };
    const minScale = imgSize.w > 0 ? Math.max(CROP_SIZE / imgSize.w, CROP_SIZE / imgSize.h) : 0.5;
    const zoom = (delta)=>setScale((s)=>Math.max(minScale, Math.min(3, s + delta)));
    const reset = ()=>{
        setScale(Math.max(1, minScale));
        setOffset({
            x: 0,
            y: 0
        });
    };
    return /*#__PURE__*/ _jsxDEV(AnimatePresence, {
        children: /*#__PURE__*/ _jsxDEV(motion.div, {
            initial: {
                opacity: 0
            },
            animate: {
                opacity: 1
            },
            exit: {
                opacity: 0
            },
            className: "fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4",
            onClick: onCancel,
            children: /*#__PURE__*/ _jsxDEV(motion.div, {
                initial: {
                    opacity: 0,
                    scale: 0.9,
                    y: 20
                },
                animate: {
                    opacity: 1,
                    scale: 1,
                    y: 0
                },
                exit: {
                    opacity: 0,
                    scale: 0.9
                },
                onClick: (e)=>e.stopPropagation(),
                className: "w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl overflow-hidden",
                children: [
                    /*#__PURE__*/ _jsxDEV("div", {
                        className: "flex items-center justify-between px-4 py-3 border-b border-border",
                        children: [
                            /*#__PURE__*/ _jsxDEV("h3", {
                                className: "text-sm font-bold text-foreground",
                                children: "Ajustar foto"
                            }, void 0, false, {
                                fileName: "/dev-server/src/components/ImageCropper.tsx",
                                lineNumber: 119,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ _jsxDEV("button", {
                                onClick: onCancel,
                                className: "p-1.5 rounded-lg hover:bg-muted/50 transition-colors",
                                children: /*#__PURE__*/ _jsxDEV(X, {
                                    className: "h-4 w-4 text-muted-foreground"
                                }, void 0, false, {
                                    fileName: "/dev-server/src/components/ImageCropper.tsx",
                                    lineNumber: 121,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "/dev-server/src/components/ImageCropper.tsx",
                                lineNumber: 120,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "/dev-server/src/components/ImageCropper.tsx",
                        lineNumber: 118,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ _jsxDEV("div", {
                        className: "flex items-center justify-center p-6 bg-black/30",
                        children: /*#__PURE__*/ _jsxDEV("div", {
                            ref: containerRef,
                            className: "relative overflow-hidden rounded-full border-2 border-primary/50 cursor-grab active:cursor-grabbing touch-none",
                            style: {
                                width: CROP_SIZE,
                                height: CROP_SIZE
                            },
                            onPointerDown: handlePointerDown,
                            onPointerMove: handlePointerMove,
                            onPointerUp: handlePointerUp,
                            onWheel: handleWheel,
                            children: [
                                imageUrl && /*#__PURE__*/ _jsxDEV("img", {
                                    ref: imgRef,
                                    src: imageUrl,
                                    alt: "Preview",
                                    onLoad: handleImageLoad,
                                    draggable: false,
                                    className: "absolute select-none",
                                    style: {
                                        width: imgSize.w * scale,
                                        height: imgSize.h * scale,
                                        left: `calc(50% - ${imgSize.w * scale / 2}px + ${offset.x}px)`,
                                        top: `calc(50% - ${imgSize.h * scale / 2}px + ${offset.y}px)`
                                    }
                                }, void 0, false, {
                                    fileName: "/dev-server/src/components/ImageCropper.tsx",
                                    lineNumber: 137,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ _jsxDEV("div", {
                                    className: "absolute inset-0 rounded-full ring-2 ring-primary/30 pointer-events-none"
                                }, void 0, false, {
                                    fileName: "/dev-server/src/components/ImageCropper.tsx",
                                    lineNumber: 153,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "/dev-server/src/components/ImageCropper.tsx",
                            lineNumber: 127,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "/dev-server/src/components/ImageCropper.tsx",
                        lineNumber: 126,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ _jsxDEV("div", {
                        className: "px-4 py-3 border-t border-border space-y-3",
                        children: [
                            /*#__PURE__*/ _jsxDEV("div", {
                                className: "flex items-center gap-3",
                                children: [
                                    /*#__PURE__*/ _jsxDEV("button", {
                                        onClick: ()=>zoom(-0.15),
                                        className: "p-1.5 rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground",
                                        children: /*#__PURE__*/ _jsxDEV(ZoomOut, {
                                            className: "h-4 w-4"
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/components/ImageCropper.tsx",
                                            lineNumber: 162,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/components/ImageCropper.tsx",
                                        lineNumber: 161,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("input", {
                                        type: "range",
                                        min: minScale,
                                        max: "3",
                                        step: "0.05",
                                        value: scale,
                                        onChange: (e)=>setScale(Number(e.target.value)),
                                        className: "flex-1 h-1.5 accent-primary cursor-pointer"
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/components/ImageCropper.tsx",
                                        lineNumber: 164,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("button", {
                                        onClick: ()=>zoom(0.15),
                                        className: "p-1.5 rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground",
                                        children: /*#__PURE__*/ _jsxDEV(ZoomIn, {
                                            className: "h-4 w-4"
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/components/ImageCropper.tsx",
                                            lineNumber: 174,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/components/ImageCropper.tsx",
                                        lineNumber: 173,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("button", {
                                        onClick: reset,
                                        className: "p-1.5 rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground",
                                        title: "Resetar",
                                        children: /*#__PURE__*/ _jsxDEV(RotateCcw, {
                                            className: "h-4 w-4"
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/components/ImageCropper.tsx",
                                            lineNumber: 177,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/components/ImageCropper.tsx",
                                        lineNumber: 176,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/components/ImageCropper.tsx",
                                lineNumber: 160,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ _jsxDEV("div", {
                                className: "flex gap-3",
                                children: [
                                    /*#__PURE__*/ _jsxDEV("button", {
                                        onClick: onCancel,
                                        className: "flex-1 py-2.5 rounded-xl border border-border text-foreground font-semibold text-sm hover:bg-muted/50 transition-colors",
                                        children: "Cancelar"
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/components/ImageCropper.tsx",
                                        lineNumber: 183,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("button", {
                                        onClick: handleCrop,
                                        className: "flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 transition-all flex items-center justify-center gap-2",
                                        children: [
                                            /*#__PURE__*/ _jsxDEV(Check, {
                                                className: "h-4 w-4"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/components/ImageCropper.tsx",
                                                lineNumber: 193,
                                                columnNumber: 17
                                            }, this),
                                            "Confirmar"
                                        ]
                                    }, void 0, true, {
                                        fileName: "/dev-server/src/components/ImageCropper.tsx",
                                        lineNumber: 189,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/components/ImageCropper.tsx",
                                lineNumber: 182,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "/dev-server/src/components/ImageCropper.tsx",
                        lineNumber: 158,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ _jsxDEV("p", {
                        className: "text-[10px] text-muted-foreground text-center pb-3 px-4",
                        children: "Arraste para posicionar · Use o zoom para ajustar"
                    }, void 0, false, {
                        fileName: "/dev-server/src/components/ImageCropper.tsx",
                        lineNumber: 199,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "/dev-server/src/components/ImageCropper.tsx",
                lineNumber: 110,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "/dev-server/src/components/ImageCropper.tsx",
            lineNumber: 103,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "/dev-server/src/components/ImageCropper.tsx",
        lineNumber: 102,
        columnNumber: 5
    }, this);
}
_s(ImageCropper, "YhYVgH/pvVWhkrVHZR4d878GCJ4=");
_c = ImageCropper;
var _c;
$RefreshReg$(_c, "ImageCropper");


if (import.meta.hot && !inWebWorker) {
  window.$RefreshReg$ = prevRefreshReg;
  window.$RefreshSig$ = prevRefreshSig;
}


if (import.meta.hot && !inWebWorker) {
  RefreshRuntime.__hmr_import(import.meta.url).then((currentExports) => {
    RefreshRuntime.registerExportsForReactRefresh("/dev-server/src/components/ImageCropper.tsx", currentExports);
    import.meta.hot.accept((nextExports) => {
      if (!nextExports) return;
      const invalidateMessage = RefreshRuntime.validateRefreshBoundaryAndEnqueueUpdate("/dev-server/src/components/ImageCropper.tsx", currentExports, nextExports);
      if (invalidateMessage) import.meta.hot.invalidate(invalidateMessage);
    });
  });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkltYWdlQ3JvcHBlci50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgdXNlU3RhdGUsIHVzZVJlZiwgdXNlQ2FsbGJhY2ssIHVzZUVmZmVjdCB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgbW90aW9uLCBBbmltYXRlUHJlc2VuY2UgfSBmcm9tIFwiZnJhbWVyLW1vdGlvblwiO1xuaW1wb3J0IHsgWm9vbUluLCBab29tT3V0LCBDaGVjaywgWCwgUm90YXRlQ2N3IH0gZnJvbSBcImx1Y2lkZS1yZWFjdFwiO1xuXG5pbnRlcmZhY2UgSW1hZ2VDcm9wcGVyUHJvcHMge1xuICBmaWxlOiBGaWxlO1xuICBvbkNyb3A6IChjcm9wcGVkQmxvYjogQmxvYikgPT4gdm9pZDtcbiAgb25DYW5jZWw6ICgpID0+IHZvaWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBJbWFnZUNyb3BwZXIoeyBmaWxlLCBvbkNyb3AsIG9uQ2FuY2VsIH06IEltYWdlQ3JvcHBlclByb3BzKSB7XG4gIGNvbnN0IFtpbWFnZVVybCwgc2V0SW1hZ2VVcmxdID0gdXNlU3RhdGU8c3RyaW5nIHwgbnVsbD4obnVsbCk7XG4gIGNvbnN0IFtzY2FsZSwgc2V0U2NhbGVdID0gdXNlU3RhdGUoMSk7XG4gIGNvbnN0IFtvZmZzZXQsIHNldE9mZnNldF0gPSB1c2VTdGF0ZSh7IHg6IDAsIHk6IDAgfSk7XG4gIGNvbnN0IFtkcmFnZ2luZywgc2V0RHJhZ2dpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xuICBjb25zdCBbZHJhZ1N0YXJ0LCBzZXREcmFnU3RhcnRdID0gdXNlU3RhdGUoeyB4OiAwLCB5OiAwIH0pO1xuICBjb25zdCBbaW1nU2l6ZSwgc2V0SW1nU2l6ZV0gPSB1c2VTdGF0ZSh7IHc6IDAsIGg6IDAgfSk7XG4gIGNvbnN0IGNvbnRhaW5lclJlZiA9IHVzZVJlZjxIVE1MRGl2RWxlbWVudD4obnVsbCk7XG4gIGNvbnN0IGltZ1JlZiA9IHVzZVJlZjxIVE1MSW1hZ2VFbGVtZW50PihudWxsKTtcblxuICBjb25zdCBDUk9QX1NJWkUgPSAyODA7XG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCB1cmwgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGZpbGUpO1xuICAgIHNldEltYWdlVXJsKHVybCk7XG4gICAgcmV0dXJuICgpID0+IFVSTC5yZXZva2VPYmplY3RVUkwodXJsKTtcbiAgfSwgW2ZpbGVdKTtcblxuICBjb25zdCBoYW5kbGVJbWFnZUxvYWQgPSB1c2VDYWxsYmFjaygoZTogUmVhY3QuU3ludGhldGljRXZlbnQ8SFRNTEltYWdlRWxlbWVudD4pID0+IHtcbiAgICBjb25zdCBpbWcgPSBlLmN1cnJlbnRUYXJnZXQ7XG4gICAgY29uc3QgYXNwZWN0ID0gaW1nLm5hdHVyYWxXaWR0aCAvIGltZy5uYXR1cmFsSGVpZ2h0O1xuICAgIGxldCB3OiBudW1iZXIsIGg6IG51bWJlcjtcbiAgICBpZiAoYXNwZWN0ID4gMSkge1xuICAgICAgaCA9IENST1BfU0laRTtcbiAgICAgIHcgPSBDUk9QX1NJWkUgKiBhc3BlY3Q7XG4gICAgfSBlbHNlIHtcbiAgICAgIHcgPSBDUk9QX1NJWkU7XG4gICAgICBoID0gQ1JPUF9TSVpFIC8gYXNwZWN0O1xuICAgIH1cbiAgICBzZXRJbWdTaXplKHsgdywgaCB9KTtcbiAgICBzZXRPZmZzZXQoeyB4OiAwLCB5OiAwIH0pO1xuICAgIC8vIEVuc3VyZSBtaW5pbXVtIHNjYWxlIGtlZXBzIGltYWdlIGNvdmVyaW5nIHRoZSBjcm9wIGFyZWFcbiAgICBjb25zdCBtaW5TY2FsZSA9IE1hdGgubWF4KENST1BfU0laRSAvIHcsIENST1BfU0laRSAvIGgpO1xuICAgIHNldFNjYWxlKE1hdGgubWF4KDEsIG1pblNjYWxlKSk7XG4gIH0sIFtdKTtcblxuICBjb25zdCBoYW5kbGVQb2ludGVyRG93biA9IChlOiBSZWFjdC5Qb2ludGVyRXZlbnQpID0+IHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgc2V0RHJhZ2dpbmcodHJ1ZSk7XG4gICAgc2V0RHJhZ1N0YXJ0KHsgeDogZS5jbGllbnRYIC0gb2Zmc2V0LngsIHk6IGUuY2xpZW50WSAtIG9mZnNldC55IH0pO1xuICAgIChlLnRhcmdldCBhcyBIVE1MRWxlbWVudCkuc2V0UG9pbnRlckNhcHR1cmUoZS5wb2ludGVySWQpO1xuICB9O1xuXG4gIGNvbnN0IGhhbmRsZVBvaW50ZXJNb3ZlID0gKGU6IFJlYWN0LlBvaW50ZXJFdmVudCkgPT4ge1xuICAgIGlmICghZHJhZ2dpbmcpIHJldHVybjtcbiAgICBjb25zdCBuZXdYID0gZS5jbGllbnRYIC0gZHJhZ1N0YXJ0Lng7XG4gICAgY29uc3QgbmV3WSA9IGUuY2xpZW50WSAtIGRyYWdTdGFydC55O1xuICAgIC8vIExpbWl0IHBhbm5pbmcgc28gaW1hZ2Ugc3RheXMgd2l0aGluIGNyb3AgYXJlYVxuICAgIGNvbnN0IG1heFggPSBNYXRoLm1heCgwLCAoaW1nU2l6ZS53ICogc2NhbGUgLSBDUk9QX1NJWkUpIC8gMik7XG4gICAgY29uc3QgbWF4WSA9IE1hdGgubWF4KDAsIChpbWdTaXplLmggKiBzY2FsZSAtIENST1BfU0laRSkgLyAyKTtcbiAgICBzZXRPZmZzZXQoe1xuICAgICAgeDogTWF0aC5tYXgoLW1heFgsIE1hdGgubWluKG1heFgsIG5ld1gpKSxcbiAgICAgIHk6IE1hdGgubWF4KC1tYXhZLCBNYXRoLm1pbihtYXhZLCBuZXdZKSksXG4gICAgfSk7XG4gIH07XG5cbiAgY29uc3QgaGFuZGxlUG9pbnRlclVwID0gKCkgPT4gc2V0RHJhZ2dpbmcoZmFsc2UpO1xuXG4gIGNvbnN0IGhhbmRsZVdoZWVsID0gKGU6IFJlYWN0LldoZWVsRXZlbnQpID0+IHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgY29uc3QgZGVsdGEgPSBlLmRlbHRhWSA+IDAgPyAtMC4wNSA6IDAuMDU7XG4gICAgY29uc3QgbWluU2NhbGUgPSBpbWdTaXplLncgPiAwID8gTWF0aC5tYXgoQ1JPUF9TSVpFIC8gaW1nU2l6ZS53LCBDUk9QX1NJWkUgLyBpbWdTaXplLmgpIDogMC41O1xuICAgIHNldFNjYWxlKHMgPT4gTWF0aC5tYXgobWluU2NhbGUsIE1hdGgubWluKDMsIHMgKyBkZWx0YSkpKTtcbiAgfTtcblxuICBjb25zdCBoYW5kbGVDcm9wID0gKCkgPT4ge1xuICAgIGlmICghaW1nUmVmLmN1cnJlbnQpIHJldHVybjtcbiAgICBjb25zdCBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xuICAgIGNvbnN0IG91dHB1dFNpemUgPSA0MDA7XG4gICAgY2FudmFzLndpZHRoID0gb3V0cHV0U2l6ZTtcbiAgICBjYW52YXMuaGVpZ2h0ID0gb3V0cHV0U2l6ZTtcbiAgICBjb25zdCBjdHggPSBjYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpITtcblxuICAgIGNvbnN0IGltZyA9IGltZ1JlZi5jdXJyZW50O1xuICAgIGNvbnN0IHNjYWxlUmF0aW8gPSBpbWcubmF0dXJhbFdpZHRoIC8gKGltZ1NpemUudyAqIHNjYWxlKTtcbiAgICBjb25zdCBjcm9wWCA9ICgoaW1nU2l6ZS53ICogc2NhbGUgLSBDUk9QX1NJWkUpIC8gMiAtIG9mZnNldC54KSAqIHNjYWxlUmF0aW87XG4gICAgY29uc3QgY3JvcFkgPSAoKGltZ1NpemUuaCAqIHNjYWxlIC0gQ1JPUF9TSVpFKSAvIDIgLSBvZmZzZXQueSkgKiBzY2FsZVJhdGlvO1xuICAgIGNvbnN0IGNyb3BXID0gQ1JPUF9TSVpFICogc2NhbGVSYXRpbztcbiAgICBjb25zdCBjcm9wSCA9IENST1BfU0laRSAqIHNjYWxlUmF0aW87XG5cbiAgICBjdHguZHJhd0ltYWdlKGltZywgY3JvcFgsIGNyb3BZLCBjcm9wVywgY3JvcEgsIDAsIDAsIG91dHB1dFNpemUsIG91dHB1dFNpemUpO1xuICAgIGNhbnZhcy50b0Jsb2IoKGJsb2IpID0+IHtcbiAgICAgIGlmIChibG9iKSBvbkNyb3AoYmxvYik7XG4gICAgfSwgXCJpbWFnZS9qcGVnXCIsIDAuOSk7XG4gIH07XG5cbiAgY29uc3QgbWluU2NhbGUgPSBpbWdTaXplLncgPiAwID8gTWF0aC5tYXgoQ1JPUF9TSVpFIC8gaW1nU2l6ZS53LCBDUk9QX1NJWkUgLyBpbWdTaXplLmgpIDogMC41O1xuICBjb25zdCB6b29tID0gKGRlbHRhOiBudW1iZXIpID0+IHNldFNjYWxlKHMgPT4gTWF0aC5tYXgobWluU2NhbGUsIE1hdGgubWluKDMsIHMgKyBkZWx0YSkpKTtcbiAgY29uc3QgcmVzZXQgPSAoKSA9PiB7IHNldFNjYWxlKE1hdGgubWF4KDEsIG1pblNjYWxlKSk7IHNldE9mZnNldCh7IHg6IDAsIHk6IDAgfSk7IH07XG5cbiAgcmV0dXJuIChcbiAgICA8QW5pbWF0ZVByZXNlbmNlPlxuICAgICAgPG1vdGlvbi5kaXZcbiAgICAgICAgaW5pdGlhbD17eyBvcGFjaXR5OiAwIH19XG4gICAgICAgIGFuaW1hdGU9e3sgb3BhY2l0eTogMSB9fVxuICAgICAgICBleGl0PXt7IG9wYWNpdHk6IDAgfX1cbiAgICAgICAgY2xhc3NOYW1lPVwiZml4ZWQgaW5zZXQtMCB6LVs2MF0gZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgYmctYmxhY2svNzAgYmFja2Ryb3AtYmx1ci1zbSBweC00XCJcbiAgICAgICAgb25DbGljaz17b25DYW5jZWx9XG4gICAgICA+XG4gICAgICAgIDxtb3Rpb24uZGl2XG4gICAgICAgICAgaW5pdGlhbD17eyBvcGFjaXR5OiAwLCBzY2FsZTogMC45LCB5OiAyMCB9fVxuICAgICAgICAgIGFuaW1hdGU9e3sgb3BhY2l0eTogMSwgc2NhbGU6IDEsIHk6IDAgfX1cbiAgICAgICAgICBleGl0PXt7IG9wYWNpdHk6IDAsIHNjYWxlOiAwLjkgfX1cbiAgICAgICAgICBvbkNsaWNrPXsoZSkgPT4gZS5zdG9wUHJvcGFnYXRpb24oKX1cbiAgICAgICAgICBjbGFzc05hbWU9XCJ3LWZ1bGwgbWF4LXctc20gYmctY2FyZCBib3JkZXIgYm9yZGVyLWJvcmRlciByb3VuZGVkLTJ4bCBzaGFkb3ctMnhsIG92ZXJmbG93LWhpZGRlblwiXG4gICAgICAgID5cbiAgICAgICAgICB7LyogSGVhZGVyICovfVxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIHB4LTQgcHktMyBib3JkZXItYiBib3JkZXItYm9yZGVyXCI+XG4gICAgICAgICAgICA8aDMgY2xhc3NOYW1lPVwidGV4dC1zbSBmb250LWJvbGQgdGV4dC1mb3JlZ3JvdW5kXCI+QWp1c3RhciBmb3RvPC9oMz5cbiAgICAgICAgICAgIDxidXR0b24gb25DbGljaz17b25DYW5jZWx9IGNsYXNzTmFtZT1cInAtMS41IHJvdW5kZWQtbGcgaG92ZXI6YmctbXV0ZWQvNTAgdHJhbnNpdGlvbi1jb2xvcnNcIj5cbiAgICAgICAgICAgICAgPFggY2xhc3NOYW1lPVwiaC00IHctNCB0ZXh0LW11dGVkLWZvcmVncm91bmRcIiAvPlxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICB7LyogQ3JvcCBhcmVhICovfVxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgcC02IGJnLWJsYWNrLzMwXCI+XG4gICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgIHJlZj17Y29udGFpbmVyUmVmfVxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJyZWxhdGl2ZSBvdmVyZmxvdy1oaWRkZW4gcm91bmRlZC1mdWxsIGJvcmRlci0yIGJvcmRlci1wcmltYXJ5LzUwIGN1cnNvci1ncmFiIGFjdGl2ZTpjdXJzb3ItZ3JhYmJpbmcgdG91Y2gtbm9uZVwiXG4gICAgICAgICAgICAgIHN0eWxlPXt7IHdpZHRoOiBDUk9QX1NJWkUsIGhlaWdodDogQ1JPUF9TSVpFIH19XG4gICAgICAgICAgICAgIG9uUG9pbnRlckRvd249e2hhbmRsZVBvaW50ZXJEb3dufVxuICAgICAgICAgICAgICBvblBvaW50ZXJNb3ZlPXtoYW5kbGVQb2ludGVyTW92ZX1cbiAgICAgICAgICAgICAgb25Qb2ludGVyVXA9e2hhbmRsZVBvaW50ZXJVcH1cbiAgICAgICAgICAgICAgb25XaGVlbD17aGFuZGxlV2hlZWx9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIHtpbWFnZVVybCAmJiAoXG4gICAgICAgICAgICAgICAgPGltZ1xuICAgICAgICAgICAgICAgICAgcmVmPXtpbWdSZWZ9XG4gICAgICAgICAgICAgICAgICBzcmM9e2ltYWdlVXJsfVxuICAgICAgICAgICAgICAgICAgYWx0PVwiUHJldmlld1wiXG4gICAgICAgICAgICAgICAgICBvbkxvYWQ9e2hhbmRsZUltYWdlTG9hZH1cbiAgICAgICAgICAgICAgICAgIGRyYWdnYWJsZT17ZmFsc2V9XG4gICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJhYnNvbHV0ZSBzZWxlY3Qtbm9uZVwiXG4gICAgICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgICAgICB3aWR0aDogaW1nU2l6ZS53ICogc2NhbGUsXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogaW1nU2l6ZS5oICogc2NhbGUsXG4gICAgICAgICAgICAgICAgICAgIGxlZnQ6IGBjYWxjKDUwJSAtICR7KGltZ1NpemUudyAqIHNjYWxlKSAvIDJ9cHggKyAke29mZnNldC54fXB4KWAsXG4gICAgICAgICAgICAgICAgICAgIHRvcDogYGNhbGMoNTAlIC0gJHsoaW1nU2l6ZS5oICogc2NhbGUpIC8gMn1weCArICR7b2Zmc2V0Lnl9cHgpYCxcbiAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgey8qIENpcmN1bGFyIG92ZXJsYXkgZ3VpZGUgKi99XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYWJzb2x1dGUgaW5zZXQtMCByb3VuZGVkLWZ1bGwgcmluZy0yIHJpbmctcHJpbWFyeS8zMCBwb2ludGVyLWV2ZW50cy1ub25lXCIgLz5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgey8qIENvbnRyb2xzICovfVxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicHgtNCBweS0zIGJvcmRlci10IGJvcmRlci1ib3JkZXIgc3BhY2UteS0zXCI+XG4gICAgICAgICAgICB7LyogWm9vbSBzbGlkZXIgKi99XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGdhcC0zXCI+XG4gICAgICAgICAgICAgIDxidXR0b24gb25DbGljaz17KCkgPT4gem9vbSgtMC4xNSl9IGNsYXNzTmFtZT1cInAtMS41IHJvdW5kZWQtbGcgaG92ZXI6YmctbXV0ZWQvNTAgdHJhbnNpdGlvbi1jb2xvcnMgdGV4dC1tdXRlZC1mb3JlZ3JvdW5kXCI+XG4gICAgICAgICAgICAgICAgPFpvb21PdXQgY2xhc3NOYW1lPVwiaC00IHctNFwiIC8+XG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICB0eXBlPVwicmFuZ2VcIlxuICAgICAgICAgICAgICAgIG1pbj17bWluU2NhbGV9XG4gICAgICAgICAgICAgICAgbWF4PVwiM1wiXG4gICAgICAgICAgICAgICAgc3RlcD1cIjAuMDVcIlxuICAgICAgICAgICAgICAgIHZhbHVlPXtzY2FsZX1cbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGUpID0+IHNldFNjYWxlKE51bWJlcihlLnRhcmdldC52YWx1ZSkpfVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImZsZXgtMSBoLTEuNSBhY2NlbnQtcHJpbWFyeSBjdXJzb3ItcG9pbnRlclwiXG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIDxidXR0b24gb25DbGljaz17KCkgPT4gem9vbSgwLjE1KX0gY2xhc3NOYW1lPVwicC0xLjUgcm91bmRlZC1sZyBob3ZlcjpiZy1tdXRlZC81MCB0cmFuc2l0aW9uLWNvbG9ycyB0ZXh0LW11dGVkLWZvcmVncm91bmRcIj5cbiAgICAgICAgICAgICAgICA8Wm9vbUluIGNsYXNzTmFtZT1cImgtNCB3LTRcIiAvPlxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXtyZXNldH0gY2xhc3NOYW1lPVwicC0xLjUgcm91bmRlZC1sZyBob3ZlcjpiZy1tdXRlZC81MCB0cmFuc2l0aW9uLWNvbG9ycyB0ZXh0LW11dGVkLWZvcmVncm91bmRcIiB0aXRsZT1cIlJlc2V0YXJcIj5cbiAgICAgICAgICAgICAgICA8Um90YXRlQ2N3IGNsYXNzTmFtZT1cImgtNCB3LTRcIiAvPlxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICB7LyogQWN0aW9uIGJ1dHRvbnMgKi99XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggZ2FwLTNcIj5cbiAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e29uQ2FuY2VsfVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImZsZXgtMSBweS0yLjUgcm91bmRlZC14bCBib3JkZXIgYm9yZGVyLWJvcmRlciB0ZXh0LWZvcmVncm91bmQgZm9udC1zZW1pYm9sZCB0ZXh0LXNtIGhvdmVyOmJnLW11dGVkLzUwIHRyYW5zaXRpb24tY29sb3JzXCJcbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIENhbmNlbGFyXG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgb25DbGljaz17aGFuZGxlQ3JvcH1cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJmbGV4LTEgcHktMi41IHJvdW5kZWQteGwgYmctcHJpbWFyeSB0ZXh0LXByaW1hcnktZm9yZWdyb3VuZCBmb250LXNlbWlib2xkIHRleHQtc20gaG92ZXI6YnJpZ2h0bmVzcy0xMTAgdHJhbnNpdGlvbi1hbGwgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgZ2FwLTJcIlxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPENoZWNrIGNsYXNzTmFtZT1cImgtNCB3LTRcIiAvPlxuICAgICAgICAgICAgICAgIENvbmZpcm1hclxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1bMTBweF0gdGV4dC1tdXRlZC1mb3JlZ3JvdW5kIHRleHQtY2VudGVyIHBiLTMgcHgtNFwiPlxuICAgICAgICAgICAgQXJyYXN0ZSBwYXJhIHBvc2ljaW9uYXIgwrcgVXNlIG8gem9vbSBwYXJhIGFqdXN0YXJcbiAgICAgICAgICA8L3A+XG4gICAgICAgIDwvbW90aW9uLmRpdj5cbiAgICAgIDwvbW90aW9uLmRpdj5cbiAgICA8L0FuaW1hdGVQcmVzZW5jZT5cbiAgKTtcbn1cbiJdLCJuYW1lcyI6WyJ1c2VTdGF0ZSIsInVzZVJlZiIsInVzZUNhbGxiYWNrIiwidXNlRWZmZWN0IiwibW90aW9uIiwiQW5pbWF0ZVByZXNlbmNlIiwiWm9vbUluIiwiWm9vbU91dCIsIkNoZWNrIiwiWCIsIlJvdGF0ZUNjdyIsIkltYWdlQ3JvcHBlciIsImZpbGUiLCJvbkNyb3AiLCJvbkNhbmNlbCIsImltYWdlVXJsIiwic2V0SW1hZ2VVcmwiLCJzY2FsZSIsInNldFNjYWxlIiwib2Zmc2V0Iiwic2V0T2Zmc2V0IiwieCIsInkiLCJkcmFnZ2luZyIsInNldERyYWdnaW5nIiwiZHJhZ1N0YXJ0Iiwic2V0RHJhZ1N0YXJ0IiwiaW1nU2l6ZSIsInNldEltZ1NpemUiLCJ3IiwiaCIsImNvbnRhaW5lclJlZiIsImltZ1JlZiIsIkNST1BfU0laRSIsInVybCIsIlVSTCIsImNyZWF0ZU9iamVjdFVSTCIsInJldm9rZU9iamVjdFVSTCIsImhhbmRsZUltYWdlTG9hZCIsImUiLCJpbWciLCJjdXJyZW50VGFyZ2V0IiwiYXNwZWN0IiwibmF0dXJhbFdpZHRoIiwibmF0dXJhbEhlaWdodCIsIm1pblNjYWxlIiwiTWF0aCIsIm1heCIsImhhbmRsZVBvaW50ZXJEb3duIiwicHJldmVudERlZmF1bHQiLCJjbGllbnRYIiwiY2xpZW50WSIsInRhcmdldCIsInNldFBvaW50ZXJDYXB0dXJlIiwicG9pbnRlcklkIiwiaGFuZGxlUG9pbnRlck1vdmUiLCJuZXdYIiwibmV3WSIsIm1heFgiLCJtYXhZIiwibWluIiwiaGFuZGxlUG9pbnRlclVwIiwiaGFuZGxlV2hlZWwiLCJkZWx0YSIsImRlbHRhWSIsInMiLCJoYW5kbGVDcm9wIiwiY3VycmVudCIsImNhbnZhcyIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsIm91dHB1dFNpemUiLCJ3aWR0aCIsImhlaWdodCIsImN0eCIsImdldENvbnRleHQiLCJzY2FsZVJhdGlvIiwiY3JvcFgiLCJjcm9wWSIsImNyb3BXIiwiY3JvcEgiLCJkcmF3SW1hZ2UiLCJ0b0Jsb2IiLCJibG9iIiwiem9vbSIsInJlc2V0IiwiZGl2IiwiaW5pdGlhbCIsIm9wYWNpdHkiLCJhbmltYXRlIiwiZXhpdCIsImNsYXNzTmFtZSIsIm9uQ2xpY2siLCJzdG9wUHJvcGFnYXRpb24iLCJoMyIsImJ1dHRvbiIsInJlZiIsInN0eWxlIiwib25Qb2ludGVyRG93biIsIm9uUG9pbnRlck1vdmUiLCJvblBvaW50ZXJVcCIsIm9uV2hlZWwiLCJzcmMiLCJhbHQiLCJvbkxvYWQiLCJkcmFnZ2FibGUiLCJsZWZ0IiwidG9wIiwiaW5wdXQiLCJ0eXBlIiwic3RlcCIsInZhbHVlIiwib25DaGFuZ2UiLCJOdW1iZXIiLCJ0aXRsZSIsInAiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLFNBQVNBLFFBQVEsRUFBRUMsTUFBTSxFQUFFQyxXQUFXLEVBQUVDLFNBQVMsUUFBUSxRQUFRO0FBQ2pFLFNBQVNDLE1BQU0sRUFBRUMsZUFBZSxRQUFRLGdCQUFnQjtBQUN4RCxTQUFTQyxNQUFNLEVBQUVDLE9BQU8sRUFBRUMsS0FBSyxFQUFFQyxD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