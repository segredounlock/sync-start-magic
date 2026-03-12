import { createHotContext as __vite__createHotContext } from "/@vite/client";import.meta.hot = __vite__createHotContext("/src/components/AnimatedIcon.tsx");import * as RefreshRuntime from "/@react-refresh";
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
  window.$RefreshReg$ = RefreshRuntime.getRefreshReg("/dev-server/src/components/AnimatedIcon.tsx");
  window.$RefreshSig$ = RefreshRuntime.createSignatureFunctionForTransform;
}

import __vite__cjsImport2_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=fb1d4910"; const _jsxDEV = __vite__cjsImport2_react_jsxDevRuntime["jsxDEV"];
import { motion } from "/node_modules/.vite/deps/framer-motion.js?v=0eb59201";
const animations = {
    pulse: {
        animate: {
            scale: [
                1,
                1.2,
                1
            ]
        },
        transition: {
            repeat: Infinity,
            duration: 2,
            ease: "easeInOut"
        }
    },
    bounce: {
        animate: {
            y: [
                0,
                -4,
                0
            ]
        },
        transition: {
            repeat: Infinity,
            duration: 1.5,
            ease: "easeInOut"
        }
    },
    spin: {
        animate: {
            rotate: [
                0,
                360
            ]
        },
        transition: {
            repeat: Infinity,
            duration: 3,
            ease: "linear"
        }
    },
    wiggle: {
        animate: {
            rotate: [
                0,
                -10,
                10,
                -10,
                0
            ]
        },
        transition: {
            repeat: Infinity,
            duration: 2,
            ease: "easeInOut"
        }
    },
    float: {
        animate: {
            y: [
                0,
                -6,
                0
            ],
            x: [
                0,
                2,
                0
            ]
        },
        transition: {
            repeat: Infinity,
            duration: 3,
            ease: "easeInOut"
        }
    }
};
export function AnimatedIcon({ icon: Icon, className = "", animation = "pulse", delay = 0 }) {
    const anim = animations[animation];
    return /*#__PURE__*/ _jsxDEV(motion.div, {
        initial: {
            scale: 0,
            opacity: 0
        },
        animate: {
            scale: 1,
            opacity: 1
        },
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 15,
            delay
        },
        className: "inline-flex",
        children: /*#__PURE__*/ _jsxDEV(motion.div, {
            animate: anim.animate,
            transition: anim.transition,
            children: /*#__PURE__*/ _jsxDEV(Icon, {
                className: className
            }, void 0, false, {
                fileName: "/dev-server/src/components/AnimatedIcon.tsx",
                lineNumber: 48,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "/dev-server/src/components/AnimatedIcon.tsx",
            lineNumber: 44,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "/dev-server/src/components/AnimatedIcon.tsx",
        lineNumber: 38,
        columnNumber: 5
    }, this);
}
_c = AnimatedIcon;
var _c;
$RefreshReg$(_c, "AnimatedIcon");


if (import.meta.hot && !inWebWorker) {
  window.$RefreshReg$ = prevRefreshReg;
  window.$RefreshSig$ = prevRefreshSig;
}


if (import.meta.hot && !inWebWorker) {
  RefreshRuntime.__hmr_import(import.meta.url).then((currentExports) => {
    RefreshRuntime.registerExportsForReactRefresh("/dev-server/src/components/AnimatedIcon.tsx", currentExports);
    import.meta.hot.accept((nextExports) => {
      if (!nextExports) return;
      const invalidateMessage = RefreshRuntime.validateRefreshBoundaryAndEnqueueUpdate("/dev-server/src/components/AnimatedIcon.tsx", currentExports, nextExports);
      if (invalidateMessage) import.meta.hot.invalidate(invalidateMessage);
    });
  });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkFuaW1hdGVkSWNvbi50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgbW90aW9uIH0gZnJvbSBcImZyYW1lci1tb3Rpb25cIjtcbmltcG9ydCB7IEx1Y2lkZUljb24gfSBmcm9tIFwibHVjaWRlLXJlYWN0XCI7XG5cbmludGVyZmFjZSBBbmltYXRlZEljb25Qcm9wcyB7XG4gIGljb246IEx1Y2lkZUljb247XG4gIGNsYXNzTmFtZT86IHN0cmluZztcbiAgYW5pbWF0aW9uPzogXCJwdWxzZVwiIHwgXCJib3VuY2VcIiB8IFwic3BpblwiIHwgXCJ3aWdnbGVcIiB8IFwiZmxvYXRcIjtcbiAgZGVsYXk/OiBudW1iZXI7XG59XG5cbmNvbnN0IGFuaW1hdGlvbnMgPSB7XG4gIHB1bHNlOiB7XG4gICAgYW5pbWF0ZTogeyBzY2FsZTogWzEsIDEuMiwgMV0gfSxcbiAgICB0cmFuc2l0aW9uOiB7IHJlcGVhdDogSW5maW5pdHksIGR1cmF0aW9uOiAyLCBlYXNlOiBcImVhc2VJbk91dFwiIGFzIGNvbnN0IH0sXG4gIH0sXG4gIGJvdW5jZToge1xuICAgIGFuaW1hdGU6IHsgeTogWzAsIC00LCAwXSB9LFxuICAgIHRyYW5zaXRpb246IHsgcmVwZWF0OiBJbmZpbml0eSwgZHVyYXRpb246IDEuNSwgZWFzZTogXCJlYXNlSW5PdXRcIiBhcyBjb25zdCB9LFxuICB9LFxuICBzcGluOiB7XG4gICAgYW5pbWF0ZTogeyByb3RhdGU6IFswLCAzNjBdIH0sXG4gICAgdHJhbnNpdGlvbjogeyByZXBlYXQ6IEluZmluaXR5LCBkdXJhdGlvbjogMywgZWFzZTogXCJsaW5lYXJcIiBhcyBjb25zdCB9LFxuICB9LFxuICB3aWdnbGU6IHtcbiAgICBhbmltYXRlOiB7IHJvdGF0ZTogWzAsIC0xMCwgMTAsIC0xMCwgMF0gfSxcbiAgICB0cmFuc2l0aW9uOiB7IHJlcGVhdDogSW5maW5pdHksIGR1cmF0aW9uOiAyLCBlYXNlOiBcImVhc2VJbk91dFwiIGFzIGNvbnN0IH0sXG4gIH0sXG4gIGZsb2F0OiB7XG4gICAgYW5pbWF0ZTogeyB5OiBbMCwgLTYsIDBdLCB4OiBbMCwgMiwgMF0gfSxcbiAgICB0cmFuc2l0aW9uOiB7IHJlcGVhdDogSW5maW5pdHksIGR1cmF0aW9uOiAzLCBlYXNlOiBcImVhc2VJbk91dFwiIGFzIGNvbnN0IH0sXG4gIH0sXG59O1xuXG5leHBvcnQgZnVuY3Rpb24gQW5pbWF0ZWRJY29uKHsgaWNvbjogSWNvbiwgY2xhc3NOYW1lID0gXCJcIiwgYW5pbWF0aW9uID0gXCJwdWxzZVwiLCBkZWxheSA9IDAgfTogQW5pbWF0ZWRJY29uUHJvcHMpIHtcbiAgY29uc3QgYW5pbSA9IGFuaW1hdGlvbnNbYW5pbWF0aW9uXTtcblxuICByZXR1cm4gKFxuICAgIDxtb3Rpb24uZGl2XG4gICAgICBpbml0aWFsPXt7IHNjYWxlOiAwLCBvcGFjaXR5OiAwIH19XG4gICAgICBhbmltYXRlPXt7IHNjYWxlOiAxLCBvcGFjaXR5OiAxIH19XG4gICAgICB0cmFuc2l0aW9uPXt7IHR5cGU6IFwic3ByaW5nXCIsIHN0aWZmbmVzczogMzAwLCBkYW1waW5nOiAxNSwgZGVsYXkgfX1cbiAgICAgIGNsYXNzTmFtZT1cImlubGluZS1mbGV4XCJcbiAgICA+XG4gICAgICA8bW90aW9uLmRpdlxuICAgICAgICBhbmltYXRlPXthbmltLmFuaW1hdGV9XG4gICAgICAgIHRyYW5zaXRpb249e2FuaW0udHJhbnNpdGlvbn1cbiAgICAgID5cbiAgICAgICAgPEljb24gY2xhc3NOYW1lPXtjbGFzc05hbWV9IC8+XG4gICAgICA8L21vdGlvbi5kaXY+XG4gICAgPC9tb3Rpb24uZGl2PlxuICApO1xufVxuIl0sIm5hbWVzIjpbIm1vdGlvbiIsImFuaW1hdGlvbnMiLCJwdWxzZSIsImFuaW1hdGUiLCJzY2FsZSIsInRyYW5zaXRpb24iLCJyZXBlYXQiLCJJbmZpbml0eSIsImR1cmF0aW9uIiwiZWFzZSIsImJvdW5jZSIsInkiLCJzcGluIiwicm90YXRlIiwid2lnZ2xlIiwiZmxvYXQiLCJ4IiwiQW5pbWF0ZWRJY29uIiwiaWNvbiIsIkljb24iLCJjbGFzc05hbWUiLCJhbmltYXRpb24iLCJkZWxheSIsImFuaW0iLCJkaXYiLCJpbml0aWFsIiwib3BhY2l0eSIsInR5cGUiLCJzdGlmZm5lc3MiLCJkYW1waW5nIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLFNBQVNBLE1BQU0sUUFBUSxnQkFBZ0I7QUFVdkMsTUFBTUMsYUFBYTtJQUNqQkMsT0FBTztRQUNMQyxTQUFTO1lBQUVDLE9BQU87Z0JBQUM7Z0JBQUc7Z0JBQUs7YUFBRTtRQUFDO1FBQzlCQyxZQUFZO1lBQUVDLFFBQVFDO1lBQVVDLFVBQVU7WUFBR0MsTUFBTTtRQUFxQjtJQUMxRTtJQUNBQyxRQUFRO1FBQ05QLFNBQVM7WUFBRVEsR0FBRztnQkFBQztnQkFBRyxDQUFDO2dCQUFHO2FBQUU7UUFBQztRQUN6Qk4sWUFBWTtZQUFFQyxRQUFRQztZQUFVQyxVQUFVO1lBQUtDLE1BQU07UUFBcUI7SUFDNUU7SUFDQUcsTUFBTTtRQUNKVCxTQUFTO1lBQUVVLFFBQVE7Z0JBQUM7Z0JBQUc7YUFBSTtRQUFDO1FBQzVCUixZQUFZO1lBQUVDLFFBQVFDO1lBQVVDLFVBQVU7WUFBR0MsTUFBTTtRQUFrQjtJQUN2RTtJQUNBSyxRQUFRO1FBQ05YLFNBQVM7WUFBRVUsUUFBUTtnQkFBQztnQkFBRyxDQUFDO2dCQUFJO2dCQUFJLENBQUM7Z0JBQUk7YUFBRTtRQUFDO1FBQ3hDUixZQUFZO1lBQUVDLFFBQVFDO1lBQVVDLFVBQVU7WUFBR0MsTUFBTTtRQUFxQjtJQUMxRTtJQUNBTSxPQUFPO1FBQ0xaLFNBQVM7WUFBRVEsR0FBRztnQkFBQztnQkFBRyxDQUFDO2dCQUFHO2FBQUU7WUFBRUssR0FBRztnQkFBQztnQkFBRztnQkFBRzthQUFFO1FBQUM7UUFDdkNYLFlBQVk7WUFBRUMsUUFBUUM7WUFBVUMsVUFBVTtZQUFHQyxNQUFNO1FBQXFCO0lBQzFFO0FBQ0Y7QUFFQSxPQUFPLFNBQVNRLGFBQWEsRUFBRUMsTUFBTUMsSUFBSSxFQUFFQyxZQUFZLEVBQUUsRUFBRUMsWUFBWSxPQUFPLEVBQUVDLFFBQVEsQ0FBQyxFQUFxQjtJQUM1RyxNQUFNQyxPQUFPdEIsVUFBVSxDQUFDb0IsVUFBVTtJQUVsQyxxQkFDRSxRQUFDckIsT0FBT3dCLEdBQUc7UUFDVEMsU0FBUztZQUFFckIsT0FBTztZQUFHc0IsU0FBUztRQUFFO1FBQ2hDdkIsU0FBUztZQUFFQyxPQUFPO1lBQUdzQixTQUFTO1FBQUU7UUFDaENyQixZQUFZO1lBQUVzQixNQUFNO1lBQVVDLFdBQVc7WUFBS0MsU0FBUztZQUFJUDtRQUFNO1FBQ2pFRixXQUFVO2tCQUVWLGNBQUEsUUFBQ3BCLE9BQU93QixHQUFHO1lBQ1RyQixTQUFTb0IsS0FBS3BCLE9BQU87WUFDckJFLFlBQVlrQixLQUFLbEIsVUFBVTtzQkFFM0IsY0FBQSxRQUFDYztnQkFBS0MsV0FBV0E7Ozs7Ozs7Ozs7Ozs7Ozs7QUFJekI7S0FsQmdCSCJ9