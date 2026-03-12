import { createHotContext as __vite__createHotContext } from "/@vite/client";import.meta.hot = __vite__createHotContext("/src/components/PinProtection.tsx");import * as RefreshRuntime from "/@react-refresh";
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
  window.$RefreshReg$ = RefreshRuntime.getRefreshReg("/dev-server/src/components/PinProtection.tsx");
  window.$RefreshSig$ = RefreshRuntime.createSignatureFunctionForTransform;
}

import __vite__cjsImport2_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=fb1d4910"; const _jsxDEV = __vite__cjsImport2_react_jsxDevRuntime["jsxDEV"]; const _Fragment = __vite__cjsImport2_react_jsxDevRuntime["Fragment"];
var _s = $RefreshSig$();
import __vite__cjsImport3_react from "/node_modules/.vite/deps/react.js?v=b874473c"; const useState = __vite__cjsImport3_react["useState"]; const useEffect = __vite__cjsImport3_react["useEffect"]; const useRef = __vite__cjsImport3_react["useRef"];
import { supabase } from "/src/integrations/supabase/client.ts";
import { Shield, Lock } from "/node_modules/.vite/deps/lucide-react.js?v=1627e724";
import { styledToast as toast } from "/src/lib/toast.tsx";
export function PinProtection({ children, configKey = "adminPin" }) {
    _s();
    const [unlocked, setUnlocked] = useState(false);
    const [hasPin, setHasPin] = useState(null); // null = loading
    const [pin, setPin] = useState([
        "",
        "",
        "",
        ""
    ]);
    const [confirmPin, setConfirmPin] = useState([
        "",
        "",
        "",
        ""
    ]);
    const [step, setStep] = useState("enter");
    const [error, setError] = useState("");
    const inputRefs = useRef([]);
    const confirmRefs = useRef([]);
    useEffect(()=>{
        checkPin();
    }, []);
    const checkPin = async ()=>{
        const { data } = await supabase.from("system_config").select("value").eq("key", configKey).maybeSingle();
        if (data?.value) {
            setHasPin(true);
            setStep("enter");
        } else {
            setHasPin(false);
            setStep("create");
        }
    };
    const handleDigit = (index, value, isConfirm = false)=>{
        const digit = value.replace(/\D/g, "").slice(-1);
        if (isConfirm) {
            const newPin = [
                ...confirmPin
            ];
            newPin[index] = digit;
            setConfirmPin(newPin);
            if (digit && index < 3) confirmRefs.current[index + 1]?.focus();
        } else {
            const newPin = [
                ...pin
            ];
            newPin[index] = digit;
            setPin(newPin);
            if (digit && index < 3) inputRefs.current[index + 1]?.focus();
        }
        setError("");
    };
    const handleKeyDown = (index, e, isConfirm = false)=>{
        if (e.key === "Backspace") {
            const current = isConfirm ? confirmPin : pin;
            if (!current[index] && index > 0) {
                const refs = isConfirm ? confirmRefs : inputRefs;
                refs.current[index - 1]?.focus();
            }
        }
    };
    const handleSubmit = async ()=>{
        const pinValue = pin.join("");
        if (pinValue.length !== 4) return;
        if (step === "create") {
            setStep("confirm");
            setConfirmPin([
                "",
                "",
                "",
                ""
            ]);
            setTimeout(()=>confirmRefs.current[0]?.focus(), 100);
            return;
        }
        if (step === "confirm") {
            const confirmValue = confirmPin.join("");
            if (pinValue !== confirmValue) {
                setError("Os PINs não coincidem. Tente novamente.");
                setConfirmPin([
                    "",
                    "",
                    "",
                    ""
                ]);
                setTimeout(()=>confirmRefs.current[0]?.focus(), 100);
                return;
            }
            // Save PIN
            await supabase.from("system_config").upsert({
                key: configKey,
                value: pinValue,
                updated_at: new Date().toISOString()
            }, {
                onConflict: "key"
            });
            setHasPin(true);
            setUnlocked(true);
            toast.success("PIN criado com sucesso!");
            return;
        }
        // Verify PIN
        const { data } = await supabase.from("system_config").select("value").eq("key", configKey).maybeSingle();
        if (data?.value === pinValue) {
            setUnlocked(true);
        } else {
            setError("PIN incorreto");
            setPin([
                "",
                "",
                "",
                ""
            ]);
            setTimeout(()=>inputRefs.current[0]?.focus(), 100);
        }
    };
    // Auto-submit when all digits are filled
    useEffect(()=>{
        const pinValue = pin.join("");
        if (pinValue.length === 4 && step !== "confirm") {
            if (step === "create") {
                handleSubmit();
            } else {
                handleSubmit();
            }
        }
    }, [
        pin
    ]);
    useEffect(()=>{
        const confirmValue = confirmPin.join("");
        if (confirmValue.length === 4 && step === "confirm") {
            handleSubmit();
        }
    }, [
        confirmPin
    ]);
    if (unlocked) return /*#__PURE__*/ _jsxDEV(_Fragment, {
        children: children
    }, void 0, false);
    if (hasPin === null) {
        return /*#__PURE__*/ _jsxDEV("div", {
            className: "flex items-center justify-center py-20",
            children: /*#__PURE__*/ _jsxDEV("div", {
                className: "animate-pulse text-muted-foreground text-sm",
                children: "Carregando..."
            }, void 0, false, {
                fileName: "/dev-server/src/components/PinProtection.tsx",
                lineNumber: 136,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "/dev-server/src/components/PinProtection.tsx",
            lineNumber: 135,
            columnNumber: 7
        }, this);
    }
    const renderPinInputs = (values, refs, isConfirm = false)=>/*#__PURE__*/ _jsxDEV("div", {
            className: "flex gap-3 justify-center",
            children: values.map((digit, i)=>/*#__PURE__*/ _jsxDEV("input", {
                    ref: (el)=>{
                        refs.current[i] = el;
                    },
                    type: "password",
                    inputMode: "numeric",
                    maxLength: 1,
                    value: digit,
                    onChange: (e)=>handleDigit(i, e.target.value, isConfirm),
                    onKeyDown: (e)=>handleKeyDown(i, e, isConfirm),
                    className: "w-14 h-14 text-center text-2xl font-bold rounded-xl border-2 border-border bg-muted/50 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all",
                    autoFocus: i === 0
                }, i, false, {
                    fileName: "/dev-server/src/components/PinProtection.tsx",
                    lineNumber: 144,
                    columnNumber: 9
                }, this))
        }, void 0, false, {
            fileName: "/dev-server/src/components/PinProtection.tsx",
            lineNumber: 142,
            columnNumber: 5
        }, this);
    return /*#__PURE__*/ _jsxDEV("div", {
        className: "flex flex-col items-center justify-center py-16 space-y-6",
        children: [
            /*#__PURE__*/ _jsxDEV("div", {
                className: "w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center",
                children: hasPin ? /*#__PURE__*/ _jsxDEV(Lock, {
                    className: "h-8 w-8 text-primary"
                }, void 0, false, {
                    fileName: "/dev-server/src/components/PinProtection.tsx",
                    lineNumber: 163,
                    columnNumber: 19
                }, this) : /*#__PURE__*/ _jsxDEV(Shield, {
                    className: "h-8 w-8 text-primary"
                }, void 0, false, {
                    fileName: "/dev-server/src/components/PinProtection.tsx",
                    lineNumber: 163,
                    columnNumber: 63
                }, this)
            }, void 0, false, {
                fileName: "/dev-server/src/components/PinProtection.tsx",
                lineNumber: 162,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ _jsxDEV("div", {
                className: "text-center space-y-1",
                children: [
                    /*#__PURE__*/ _jsxDEV("h3", {
                        className: "text-lg font-bold text-foreground",
                        children: step === "create" ? "Criar PIN de Segurança" : step === "confirm" ? "Confirmar PIN" : "Digite seu PIN"
                    }, void 0, false, {
                        fileName: "/dev-server/src/components/PinProtection.tsx",
                        lineNumber: 167,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ _jsxDEV("p", {
                        className: "text-sm text-muted-foreground",
                        children: step === "create" ? "Crie um PIN de 4 dígitos para proteger suas chaves de API" : step === "confirm" ? "Digite o PIN novamente para confirmar" : "Digite o PIN de 4 dígitos para acessar as configurações"
                    }, void 0, false, {
                        fileName: "/dev-server/src/components/PinProtection.tsx",
                        lineNumber: 170,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "/dev-server/src/components/PinProtection.tsx",
                lineNumber: 166,
                columnNumber: 7
            }, this),
            step === "confirm" ? renderPinInputs(confirmPin, confirmRefs, true) : renderPinInputs(pin, inputRefs),
            error && /*#__PURE__*/ _jsxDEV("p", {
                className: "text-sm text-destructive font-medium",
                children: error
            }, void 0, false, {
                fileName: "/dev-server/src/components/PinProtection.tsx",
                lineNumber: 182,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "/dev-server/src/components/PinProtection.tsx",
        lineNumber: 161,
        columnNumber: 5
    }, this);
}
_s(PinProtection, "cqqlz5d/UO2kn1q7HKSaUAokZXw=");
_c = PinProtection;
var _c;
$RefreshReg$(_c, "PinProtection");


if (import.meta.hot && !inWebWorker) {
  window.$RefreshReg$ = prevRefreshReg;
  window.$RefreshSig$ = prevRefreshSig;
}


if (import.meta.hot && !inWebWorker) {
  RefreshRuntime.__hmr_import(import.meta.url).then((currentExports) => {
    RefreshRuntime.registerExportsForReactRefresh("/dev-server/src/components/PinProtection.tsx", currentExports);
    import.meta.hot.accept((nextExports) => {
      if (!nextExports) return;
      const invalidateMessage = RefreshRuntime.validateRefreshBoundaryAndEnqueueUpdate("/dev-server/src/components/PinProtection.tsx", currentExports, nextExports);
      if (invalidateMessage) import.meta.hot.invalidate(invalidateMessage);
    });
  });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlBpblByb3RlY3Rpb24udHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHVzZVN0YXRlLCB1c2VFZmZlY3QsIHVzZVJlZiB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgc3VwYWJhc2UgfSBmcm9tIFwiQC9pbnRlZ3JhdGlvbnMvc3VwYWJhc2UvY2xpZW50XCI7XG5pbXBvcnQgeyBTaGllbGQsIExvY2sgfSBmcm9tIFwibHVjaWRlLXJlYWN0XCI7XG5pbXBvcnQgeyBzdHlsZWRUb2FzdCBhcyB0b2FzdCB9IGZyb20gXCJAL2xpYi90b2FzdFwiO1xuXG5pbnRlcmZhY2UgUGluUHJvdGVjdGlvblByb3BzIHtcbiAgY2hpbGRyZW46IFJlYWN0LlJlYWN0Tm9kZTtcbiAgY29uZmlnS2V5Pzogc3RyaW5nOyAvLyBzeXN0ZW1fY29uZmlnIGtleSBmb3Igc3RvcmluZyB0aGUgUElOIGhhc2hcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFBpblByb3RlY3Rpb24oeyBjaGlsZHJlbiwgY29uZmlnS2V5ID0gXCJhZG1pblBpblwiIH06IFBpblByb3RlY3Rpb25Qcm9wcykge1xuICBjb25zdCBbdW5sb2NrZWQsIHNldFVubG9ja2VkXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgY29uc3QgW2hhc1Bpbiwgc2V0SGFzUGluXSA9IHVzZVN0YXRlPGJvb2xlYW4gfCBudWxsPihudWxsKTsgLy8gbnVsbCA9IGxvYWRpbmdcbiAgY29uc3QgW3Bpbiwgc2V0UGluXSA9IHVzZVN0YXRlKFtcIlwiLCBcIlwiLCBcIlwiLCBcIlwiXSk7XG4gIGNvbnN0IFtjb25maXJtUGluLCBzZXRDb25maXJtUGluXSA9IHVzZVN0YXRlKFtcIlwiLCBcIlwiLCBcIlwiLCBcIlwiXSk7XG4gIGNvbnN0IFtzdGVwLCBzZXRTdGVwXSA9IHVzZVN0YXRlPFwiZW50ZXJcIiB8IFwiY3JlYXRlXCIgfCBcImNvbmZpcm1cIj4oXCJlbnRlclwiKTtcbiAgY29uc3QgW2Vycm9yLCBzZXRFcnJvcl0gPSB1c2VTdGF0ZShcIlwiKTtcbiAgY29uc3QgaW5wdXRSZWZzID0gdXNlUmVmPChIVE1MSW5wdXRFbGVtZW50IHwgbnVsbClbXT4oW10pO1xuICBjb25zdCBjb25maXJtUmVmcyA9IHVzZVJlZjwoSFRNTElucHV0RWxlbWVudCB8IG51bGwpW10+KFtdKTtcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNoZWNrUGluKCk7XG4gIH0sIFtdKTtcblxuICBjb25zdCBjaGVja1BpbiA9IGFzeW5jICgpID0+IHtcbiAgICBjb25zdCB7IGRhdGEgfSA9IGF3YWl0IHN1cGFiYXNlXG4gICAgICAuZnJvbShcInN5c3RlbV9jb25maWdcIilcbiAgICAgIC5zZWxlY3QoXCJ2YWx1ZVwiKVxuICAgICAgLmVxKFwia2V5XCIsIGNvbmZpZ0tleSlcbiAgICAgIC5tYXliZVNpbmdsZSgpO1xuICAgIGlmIChkYXRhPy52YWx1ZSkge1xuICAgICAgc2V0SGFzUGluKHRydWUpO1xuICAgICAgc2V0U3RlcChcImVudGVyXCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzZXRIYXNQaW4oZmFsc2UpO1xuICAgICAgc2V0U3RlcChcImNyZWF0ZVwiKTtcbiAgICB9XG4gIH07XG5cbiAgY29uc3QgaGFuZGxlRGlnaXQgPSAoaW5kZXg6IG51bWJlciwgdmFsdWU6IHN0cmluZywgaXNDb25maXJtID0gZmFsc2UpID0+IHtcbiAgICBjb25zdCBkaWdpdCA9IHZhbHVlLnJlcGxhY2UoL1xcRC9nLCBcIlwiKS5zbGljZSgtMSk7XG4gICAgaWYgKGlzQ29uZmlybSkge1xuICAgICAgY29uc3QgbmV3UGluID0gWy4uLmNvbmZpcm1QaW5dO1xuICAgICAgbmV3UGluW2luZGV4XSA9IGRpZ2l0O1xuICAgICAgc2V0Q29uZmlybVBpbihuZXdQaW4pO1xuICAgICAgaWYgKGRpZ2l0ICYmIGluZGV4IDwgMykgY29uZmlybVJlZnMuY3VycmVudFtpbmRleCArIDFdPy5mb2N1cygpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBuZXdQaW4gPSBbLi4ucGluXTtcbiAgICAgIG5ld1BpbltpbmRleF0gPSBkaWdpdDtcbiAgICAgIHNldFBpbihuZXdQaW4pO1xuICAgICAgaWYgKGRpZ2l0ICYmIGluZGV4IDwgMykgaW5wdXRSZWZzLmN1cnJlbnRbaW5kZXggKyAxXT8uZm9jdXMoKTtcbiAgICB9XG4gICAgc2V0RXJyb3IoXCJcIik7XG4gIH07XG5cbiAgY29uc3QgaGFuZGxlS2V5RG93biA9IChpbmRleDogbnVtYmVyLCBlOiBSZWFjdC5LZXlib2FyZEV2ZW50LCBpc0NvbmZpcm0gPSBmYWxzZSkgPT4ge1xuICAgIGlmIChlLmtleSA9PT0gXCJCYWNrc3BhY2VcIikge1xuICAgICAgY29uc3QgY3VycmVudCA9IGlzQ29uZmlybSA/IGNvbmZpcm1QaW4gOiBwaW47XG4gICAgICBpZiAoIWN1cnJlbnRbaW5kZXhdICYmIGluZGV4ID4gMCkge1xuICAgICAgICBjb25zdCByZWZzID0gaXNDb25maXJtID8gY29uZmlybVJlZnMgOiBpbnB1dFJlZnM7XG4gICAgICAgIHJlZnMuY3VycmVudFtpbmRleCAtIDFdPy5mb2N1cygpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICBjb25zdCBoYW5kbGVTdWJtaXQgPSBhc3luYyAoKSA9PiB7XG4gICAgY29uc3QgcGluVmFsdWUgPSBwaW4uam9pbihcIlwiKTtcbiAgICBpZiAocGluVmFsdWUubGVuZ3RoICE9PSA0KSByZXR1cm47XG5cbiAgICBpZiAoc3RlcCA9PT0gXCJjcmVhdGVcIikge1xuICAgICAgc2V0U3RlcChcImNvbmZpcm1cIik7XG4gICAgICBzZXRDb25maXJtUGluKFtcIlwiLCBcIlwiLCBcIlwiLCBcIlwiXSk7XG4gICAgICBzZXRUaW1lb3V0KCgpID0+IGNvbmZpcm1SZWZzLmN1cnJlbnRbMF0/LmZvY3VzKCksIDEwMCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHN0ZXAgPT09IFwiY29uZmlybVwiKSB7XG4gICAgICBjb25zdCBjb25maXJtVmFsdWUgPSBjb25maXJtUGluLmpvaW4oXCJcIik7XG4gICAgICBpZiAocGluVmFsdWUgIT09IGNvbmZpcm1WYWx1ZSkge1xuICAgICAgICBzZXRFcnJvcihcIk9zIFBJTnMgbsOjbyBjb2luY2lkZW0uIFRlbnRlIG5vdmFtZW50ZS5cIik7XG4gICAgICAgIHNldENvbmZpcm1QaW4oW1wiXCIsIFwiXCIsIFwiXCIsIFwiXCJdKTtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiBjb25maXJtUmVmcy5jdXJyZW50WzBdPy5mb2N1cygpLCAxMDApO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICAvLyBTYXZlIFBJTlxuICAgICAgYXdhaXQgc3VwYWJhc2UuZnJvbShcInN5c3RlbV9jb25maWdcIikudXBzZXJ0KFxuICAgICAgICB7IGtleTogY29uZmlnS2V5LCB2YWx1ZTogcGluVmFsdWUsIHVwZGF0ZWRfYXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSB9LFxuICAgICAgICB7IG9uQ29uZmxpY3Q6IFwia2V5XCIgfVxuICAgICAgKTtcbiAgICAgIHNldEhhc1Bpbih0cnVlKTtcbiAgICAgIHNldFVubG9ja2VkKHRydWUpO1xuICAgICAgdG9hc3Quc3VjY2VzcyhcIlBJTiBjcmlhZG8gY29tIHN1Y2Vzc28hXCIpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFZlcmlmeSBQSU5cbiAgICBjb25zdCB7IGRhdGEgfSA9IGF3YWl0IHN1cGFiYXNlXG4gICAgICAuZnJvbShcInN5c3RlbV9jb25maWdcIilcbiAgICAgIC5zZWxlY3QoXCJ2YWx1ZVwiKVxuICAgICAgLmVxKFwia2V5XCIsIGNvbmZpZ0tleSlcbiAgICAgIC5tYXliZVNpbmdsZSgpO1xuXG4gICAgaWYgKGRhdGE/LnZhbHVlID09PSBwaW5WYWx1ZSkge1xuICAgICAgc2V0VW5sb2NrZWQodHJ1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNldEVycm9yKFwiUElOIGluY29ycmV0b1wiKTtcbiAgICAgIHNldFBpbihbXCJcIiwgXCJcIiwgXCJcIiwgXCJcIl0pO1xuICAgICAgc2V0VGltZW91dCgoKSA9PiBpbnB1dFJlZnMuY3VycmVudFswXT8uZm9jdXMoKSwgMTAwKTtcbiAgICB9XG4gIH07XG5cbiAgLy8gQXV0by1zdWJtaXQgd2hlbiBhbGwgZGlnaXRzIGFyZSBmaWxsZWRcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBwaW5WYWx1ZSA9IHBpbi5qb2luKFwiXCIpO1xuICAgIGlmIChwaW5WYWx1ZS5sZW5ndGggPT09IDQgJiYgc3RlcCAhPT0gXCJjb25maXJtXCIpIHtcbiAgICAgIGlmIChzdGVwID09PSBcImNyZWF0ZVwiKSB7XG4gICAgICAgIGhhbmRsZVN1Ym1pdCgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaGFuZGxlU3VibWl0KCk7XG4gICAgICB9XG4gICAgfVxuICB9LCBbcGluXSk7XG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBjb25maXJtVmFsdWUgPSBjb25maXJtUGluLmpvaW4oXCJcIik7XG4gICAgaWYgKGNvbmZpcm1WYWx1ZS5sZW5ndGggPT09IDQgJiYgc3RlcCA9PT0gXCJjb25maXJtXCIpIHtcbiAgICAgIGhhbmRsZVN1Ym1pdCgpO1xuICAgIH1cbiAgfSwgW2NvbmZpcm1QaW5dKTtcblxuICBpZiAodW5sb2NrZWQpIHJldHVybiA8PntjaGlsZHJlbn08Lz47XG5cbiAgaWYgKGhhc1BpbiA9PT0gbnVsbCkge1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIHB5LTIwXCI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYW5pbWF0ZS1wdWxzZSB0ZXh0LW11dGVkLWZvcmVncm91bmQgdGV4dC1zbVwiPkNhcnJlZ2FuZG8uLi48L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxuICBjb25zdCByZW5kZXJQaW5JbnB1dHMgPSAodmFsdWVzOiBzdHJpbmdbXSwgcmVmczogUmVhY3QuTXV0YWJsZVJlZk9iamVjdDwoSFRNTElucHV0RWxlbWVudCB8IG51bGwpW10+LCBpc0NvbmZpcm0gPSBmYWxzZSkgPT4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBnYXAtMyBqdXN0aWZ5LWNlbnRlclwiPlxuICAgICAge3ZhbHVlcy5tYXAoKGRpZ2l0LCBpKSA9PiAoXG4gICAgICAgIDxpbnB1dFxuICAgICAgICAgIGtleT17aX1cbiAgICAgICAgICByZWY9e2VsID0+IHsgcmVmcy5jdXJyZW50W2ldID0gZWw7IH19XG4gICAgICAgICAgdHlwZT1cInBhc3N3b3JkXCJcbiAgICAgICAgICBpbnB1dE1vZGU9XCJudW1lcmljXCJcbiAgICAgICAgICBtYXhMZW5ndGg9ezF9XG4gICAgICAgICAgdmFsdWU9e2RpZ2l0fVxuICAgICAgICAgIG9uQ2hhbmdlPXtlID0+IGhhbmRsZURpZ2l0KGksIGUudGFyZ2V0LnZhbHVlLCBpc0NvbmZpcm0pfVxuICAgICAgICAgIG9uS2V5RG93bj17ZSA9PiBoYW5kbGVLZXlEb3duKGksIGUsIGlzQ29uZmlybSl9XG4gICAgICAgICAgY2xhc3NOYW1lPVwidy0xNCBoLTE0IHRleHQtY2VudGVyIHRleHQtMnhsIGZvbnQtYm9sZCByb3VuZGVkLXhsIGJvcmRlci0yIGJvcmRlci1ib3JkZXIgYmctbXV0ZWQvNTAgdGV4dC1mb3JlZ3JvdW5kIGZvY3VzOm91dGxpbmUtbm9uZSBmb2N1czpib3JkZXItcHJpbWFyeSBmb2N1czpyaW5nLTIgZm9jdXM6cmluZy1wcmltYXJ5LzMwIHRyYW5zaXRpb24tYWxsXCJcbiAgICAgICAgICBhdXRvRm9jdXM9e2kgPT09IDB9XG4gICAgICAgIC8+XG4gICAgICApKX1cbiAgICA8L2Rpdj5cbiAgKTtcblxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBmbGV4LWNvbCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgcHktMTYgc3BhY2UteS02XCI+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cInctMTYgaC0xNiByb3VuZGVkLTJ4bCBiZy1wcmltYXJ5LzEwIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyXCI+XG4gICAgICAgIHtoYXNQaW4gPyA8TG9jayBjbGFzc05hbWU9XCJoLTggdy04IHRleHQtcHJpbWFyeVwiIC8+IDogPFNoaWVsZCBjbGFzc05hbWU9XCJoLTggdy04IHRleHQtcHJpbWFyeVwiIC8+fVxuICAgICAgPC9kaXY+XG5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwidGV4dC1jZW50ZXIgc3BhY2UteS0xXCI+XG4gICAgICAgIDxoMyBjbGFzc05hbWU9XCJ0ZXh0LWxnIGZvbnQtYm9sZCB0ZXh0LWZvcmVncm91bmRcIj5cbiAgICAgICAgICB7c3RlcCA9PT0gXCJjcmVhdGVcIiA/IFwiQ3JpYXIgUElOIGRlIFNlZ3VyYW7Dp2FcIiA6IHN0ZXAgPT09IFwiY29uZmlybVwiID8gXCJDb25maXJtYXIgUElOXCIgOiBcIkRpZ2l0ZSBzZXUgUElOXCJ9XG4gICAgICAgIDwvaDM+XG4gICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQtc20gdGV4dC1tdXRlZC1mb3JlZ3JvdW5kXCI+XG4gICAgICAgICAge3N0ZXAgPT09IFwiY3JlYXRlXCJcbiAgICAgICAgICAgID8gXCJDcmllIHVtIFBJTiBkZSA0IGTDrWdpdG9zIHBhcmEgcHJvdGVnZXIgc3VhcyBjaGF2ZXMgZGUgQVBJXCJcbiAgICAgICAgICAgIDogc3RlcCA9PT0gXCJjb25maXJtXCJcbiAgICAgICAgICAgID8gXCJEaWdpdGUgbyBQSU4gbm92YW1lbnRlIHBhcmEgY29uZmlybWFyXCJcbiAgICAgICAgICAgIDogXCJEaWdpdGUgbyBQSU4gZGUgNCBkw61naXRvcyBwYXJhIGFjZXNzYXIgYXMgY29uZmlndXJhw6fDtWVzXCJ9XG4gICAgICAgIDwvcD5cbiAgICAgIDwvZGl2PlxuXG4gICAgICB7c3RlcCA9PT0gXCJjb25maXJtXCIgPyByZW5kZXJQaW5JbnB1dHMoY29uZmlybVBpbiwgY29uZmlybVJlZnMsIHRydWUpIDogcmVuZGVyUGluSW5wdXRzKHBpbiwgaW5wdXRSZWZzKX1cblxuICAgICAge2Vycm9yICYmIChcbiAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1zbSB0ZXh0LWRlc3RydWN0aXZlIGZvbnQtbWVkaXVtXCI+e2Vycm9yfTwvcD5cbiAgICAgICl9XG4gICAgPC9kaXY+XG4gICk7XG59XG4iXSwibmFtZXMiOlsidXNlU3RhdGUiLCJ1c2VFZmZlY3QiLCJ1c2VSZWYiLCJzdXBhYmFzZSIsIlNoaWVsZCIsIkxvY2siLCJzdHlsZWRUb2FzdCIsInRvYXN0IiwiUGluUHJvdGVjdGlvbiIsImNoaWxkcmVuIiwiY29uZmlnS2V5IiwidW5sb2NrZWQiLCJzZXRVbmxvY2tlZCIsImhhc1BpbiIsInNldEhhc1BpbiIsInBpbiIsInNldFBpbiIsImNvbmZpcm1QaW4iLCJzZXRDb25maXJtUGluIiwic3RlcCIsInNldFN0ZXAiLCJlcnJvciIsInNldEVycm9yIiwiaW5wdXRSZWZzIiwiY29uZmlybVJlZnMiLCJjaGVja1BpbiIsImRhdGEiLCJmcm9tIiwic2VsZWN0IiwiZXEiLCJtYXliZVNpbmdsZSIsInZhbHVlIiwiaGFuZGxlRGlnaXQiLCJpbmRleCIsImlzQ29uZmlybSIsImRpZ2l0IiwicmVwbGFjZSIsInNsaWNlIiwibmV3UGluIiwiY3VycmVudCIsImZvY3VzIiwiaGFuZGxlS2V5RG93biIsImUiLCJrZXkiLCJyZWZzIiwiaGFuZGxlU3VibWl0IiwicGluVmFsdWUiLCJqb2luIiwibGVuZ3RoIiwic2V0VGltZW91dCIsImNvbmZpcm1WYWx1ZSIsInVwc2VydCIsInVwZGF0ZWRfYXQiLCJEYXRlIiwidG9JU09TdHJpbmciLCJvbkNvbmZsaWN0Iiwic3VjY2VzcyIsImRpdiIsImNsYXNzTmFtZSIsInJlbmRlclBpbklucHV0cyIsInZhbHVlcyIsIm1hcCIsImkiLCJpbnB1dCIsInJlZiIsImVsIiwidHlwZSIsImlucHV0TW9kZSIsIm1heExlbmd0aCIsIm9uQ2hhbmdlIiwidGFyZ2V0Iiwib25LZXlEb3duIiwiYXV0b0ZvY3VzIiwiaDMi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