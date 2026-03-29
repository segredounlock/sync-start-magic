import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Shield, Lock } from "lucide-react";
import { styledToast as toast } from "@/lib/toast";

interface PinProtectionProps {
  children: React.ReactNode;
  configKey?: string;
}

// Module-level session cache: { [configKey]: timestamp }
const pinSessionCache: Record<string, number> = {};

// Default timeout in seconds
const DEFAULT_PIN_TIMEOUT = 300; // 5 minutes

// SHA-256 hash for PIN
async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin + "::lovable-pin-salt");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

async function getPinTimeout(): Promise<number> {
  try {
    const { data } = await supabase
      .from("system_config")
      .select("value")
      .eq("key", "pinTimeoutSeconds")
      .maybeSingle();
    if (data?.value) {
      const val = parseInt(data.value, 10);
      if (!isNaN(val) && val >= 0) return val;
    }
  } catch {}
  return DEFAULT_PIN_TIMEOUT;
}

function isSessionValid(configKey: string, timeoutSeconds: number): boolean {
  const ts = pinSessionCache[configKey];
  if (!ts) return false;
  if (timeoutSeconds === 0) return true; // 0 = never expires
  return (Date.now() - ts) < timeoutSeconds * 1000;
}

export function PinProtection({ children, configKey = "adminPin" }: PinProtectionProps) {
  const [unlocked, setUnlocked] = useState(false);
  const [hasPin, setHasPin] = useState<boolean | null>(null);
  const [pin, setPin] = useState(["", "", "", ""]);
  const [confirmPin, setConfirmPin] = useState(["", "", "", ""]);
  const [step, setStep] = useState<"enter" | "create" | "confirm">("enter");
  const [error, setError] = useState("");
  const [timeoutSeconds, setTimeoutSeconds] = useState(DEFAULT_PIN_TIMEOUT);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const confirmRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    checkSessionAndPin();
  }, []);

  const checkSessionAndPin = async () => {
    // Load timeout config
    const timeout = await getPinTimeout();
    setTimeoutSeconds(timeout);

    // Check if session is still valid
    if (isSessionValid(configKey, timeout)) {
      setUnlocked(true);
      return;
    }

    // Check if PIN exists
    const { data } = await supabase
      .from("system_config")
      .select("value")
      .eq("key", configKey)
      .maybeSingle();
    if (data?.value) {
      setHasPin(true);
      setStep("enter");
    } else {
      setHasPin(false);
      setStep("create");
    }
  };

  const handleDigit = (index: number, value: string, isConfirm = false) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    if (isConfirm) {
      const newPin = [...confirmPin];
      newPin[index] = digit;
      setConfirmPin(newPin);
      if (digit && index < 3) confirmRefs.current[index + 1]?.focus();
    } else {
      const newPin = [...pin];
      newPin[index] = digit;
      setPin(newPin);
      if (digit && index < 3) inputRefs.current[index + 1]?.focus();
    }
    setError("");
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent, isConfirm = false) => {
    if (e.key === "Backspace") {
      const current = isConfirm ? confirmPin : pin;
      if (!current[index] && index > 0) {
        const refs = isConfirm ? confirmRefs : inputRefs;
        refs.current[index - 1]?.focus();
      }
    }
  };

  const unlockSession = () => {
    pinSessionCache[configKey] = Date.now();
    setUnlocked(true);
  };

  const handleSubmit = async () => {
    const pinValue = pin.join("");
    if (pinValue.length !== 4) return;

    if (step === "create") {
      setStep("confirm");
      setConfirmPin(["", "", "", ""]);
      setTimeout(() => confirmRefs.current[0]?.focus(), 100);
      return;
    }

    if (step === "confirm") {
      const confirmValue = confirmPin.join("");
      if (pinValue !== confirmValue) {
        setError("Os PINs não coincidem. Tente novamente.");
        setConfirmPin(["", "", "", ""]);
        setTimeout(() => confirmRefs.current[0]?.focus(), 100);
        return;
      }
      const hashed = await hashPin(pinValue);
      await supabase.from("system_config").upsert(
        { key: configKey, value: hashed, updated_at: new Date().toISOString() },
        { onConflict: "key" }
      );
      setHasPin(true);
      unlockSession();
      toast.success("PIN criado com sucesso!");
      return;
    }

    // Verify PIN
    const { data } = await supabase
      .from("system_config")
      .select("value")
      .eq("key", configKey)
      .maybeSingle();

    const hashed = await hashPin(pinValue);

    if (data?.value === hashed || (data?.value?.length === 4 && data?.value === pinValue)) {
      if (data?.value?.length === 4) {
        await supabase.from("system_config").upsert(
          { key: configKey, value: hashed, updated_at: new Date().toISOString() },
          { onConflict: "key" }
        );
      }
      unlockSession();
    } else {
      setError("PIN incorreto");
      setPin(["", "", "", ""]);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  };

  // Auto-submit
  useEffect(() => {
    if (pin.join("").length === 4 && step !== "confirm") handleSubmit();
  }, [pin]);

  useEffect(() => {
    if (confirmPin.join("").length === 4 && step === "confirm") handleSubmit();
  }, [confirmPin]);

  if (unlocked) return <>{children}</>;

  if (hasPin === null) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-muted-foreground text-sm">Carregando...</div>
      </div>
    );
  }

  const renderPinInputs = (values: string[], refs: React.MutableRefObject<(HTMLInputElement | null)[]>, isConfirm = false) => (
    <div className="flex gap-4 justify-center">
      {values.map((digit, i) => (
        <div key={i} className="relative w-14 h-14">
          <input
            ref={el => { refs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={e => handleDigit(i, e.target.value, isConfirm)}
            onKeyDown={e => handleKeyDown(i, e, isConfirm)}
            className="w-14 h-14 text-center text-2xl font-bold rounded-xl border-2 border-border bg-muted/50 text-transparent caret-transparent focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all selection:bg-transparent"
            autoFocus={i === 0}
            autoComplete="off"
          />
          {/* Dot indicator */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className={`rounded-full bg-primary transition-all duration-100 ${
                digit
                  ? "w-3.5 h-3.5 opacity-100 scale-100"
                  : "w-0 h-0 opacity-0 scale-0"
              }`}
            />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
        {hasPin ? <Lock className="h-8 w-8 text-primary" /> : <Shield className="h-8 w-8 text-primary" />}
      </div>

      <div className="text-center space-y-1">
        <h3 className="text-lg font-bold text-foreground">
          {step === "create" ? "Criar PIN de Segurança" : step === "confirm" ? "Confirmar PIN" : "Digite seu PIN"}
        </h3>
        <p className="text-sm text-muted-foreground">
          {step === "create"
            ? "Crie um PIN de 4 dígitos para proteger suas chaves de API"
            : step === "confirm"
            ? "Digite o PIN novamente para confirmar"
            : "Digite o PIN de 4 dígitos para acessar as configurações"}
        </p>
      </div>

      {step === "confirm" ? renderPinInputs(confirmPin, confirmRefs, true) : renderPinInputs(pin, inputRefs)}

      {error && (
        <p className="text-sm text-destructive font-medium">{error}</p>
      )}

      {hasPin && step === "enter" && timeoutSeconds > 0 && (
        <p className="text-xs text-muted-foreground">
          Sessão válida por {timeoutSeconds >= 60 ? `${Math.floor(timeoutSeconds / 60)} min` : `${timeoutSeconds}s`} após autenticação
        </p>
      )}
    </div>
  );
}

/** Utility to clear PIN session (e.g. on logout) */
export function clearPinSession(configKey?: string) {
  if (configKey) {
    delete pinSessionCache[configKey];
  } else {
    Object.keys(pinSessionCache).forEach(k => delete pinSessionCache[k]);
  }
}
