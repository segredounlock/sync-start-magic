import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Lock } from "lucide-react";
import { styledToast as toast } from "@/lib/toast";

interface PinProtectionProps {
  children: React.ReactNode;
  configKey?: string; // system_config key for storing the PIN hash
}

export function PinProtection({ children, configKey = "adminPin" }: PinProtectionProps) {
  const [unlocked, setUnlocked] = useState(false);
  const [hasPin, setHasPin] = useState<boolean | null>(null); // null = loading
  const [pin, setPin] = useState(["", "", "", ""]);
  const [confirmPin, setConfirmPin] = useState(["", "", "", ""]);
  const [step, setStep] = useState<"enter" | "create" | "confirm">("enter");
  const [error, setError] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const confirmRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    checkPin();
  }, []);

  const checkPin = async () => {
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
      // Save PIN
      await supabase.from("system_config").upsert(
        { key: configKey, value: pinValue, updated_at: new Date().toISOString() },
        { onConflict: "key" }
      );
      setHasPin(true);
      setUnlocked(true);
      toast.success("PIN criado com sucesso!");
      return;
    }

    // Verify PIN
    const { data } = await supabase
      .from("system_config")
      .select("value")
      .eq("key", configKey)
      .maybeSingle();

    if (data?.value === pinValue) {
      setUnlocked(true);
    } else {
      setError("PIN incorreto");
      setPin(["", "", "", ""]);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  };

  // Auto-submit when all digits are filled
  useEffect(() => {
    const pinValue = pin.join("");
    if (pinValue.length === 4 && step !== "confirm") {
      if (step === "create") {
        handleSubmit();
      } else {
        handleSubmit();
      }
    }
  }, [pin]);

  useEffect(() => {
    const confirmValue = confirmPin.join("");
    if (confirmValue.length === 4 && step === "confirm") {
      handleSubmit();
    }
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
    <div className="flex gap-3 justify-center">
      {values.map((digit, i) => (
        <input
          key={i}
          ref={el => { refs.current[i] = el; }}
          type="password"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={e => handleDigit(i, e.target.value, isConfirm)}
          onKeyDown={e => handleKeyDown(i, e, isConfirm)}
          className="w-14 h-14 text-center text-2xl font-bold rounded-xl border-2 border-border bg-muted/50 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all"
          autoFocus={i === 0}
        />
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
    </div>
  );
}
