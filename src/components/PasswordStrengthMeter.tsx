import { validatePassword } from "@/lib/passwordValidation";
import { motion } from "framer-motion";
import { CheckCircle, XCircle } from "lucide-react";

interface Props {
  password: string;
  show?: boolean;
}

export function PasswordStrengthMeter({ password, show = true }: Props) {
  if (!show || !password) return null;

  const check = validatePassword(password);
  const bars = 4;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="space-y-2 mt-2"
    >
      {/* Strength bar */}
      <div className="flex gap-1">
        {Array.from({ length: bars }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              i < check.score
                ? check.score <= 1
                  ? "bg-destructive"
                  : check.score === 2
                  ? "bg-warning"
                  : check.score === 3
                  ? "bg-primary"
                  : "bg-success"
                : "bg-muted"
            }`}
          />
        ))}
      </div>

      {/* Label */}
      <p className={`text-[11px] font-medium ${check.color}`}>{check.label}</p>

      {/* Requirements */}
      <div className="space-y-0.5">
        {[
          { met: password.length >= 8, text: "Mínimo 8 caracteres" },
          { met: /[A-Z]/.test(password), text: "1 letra maiúscula" },
          { met: /[0-9]/.test(password), text: "1 número" },
          { met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password), text: "1 caractere especial" },
        ].map((req) => (
          <div key={req.text} className="flex items-center gap-1.5">
            {req.met ? (
              <CheckCircle className="w-3 h-3 text-success shrink-0" />
            ) : (
              <XCircle className="w-3 h-3 text-muted-foreground shrink-0" />
            )}
            <span className={`text-[10px] ${req.met ? "text-success" : "text-muted-foreground"}`}>
              {req.text}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
