import { useState, useEffect, useRef, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { InstallWizard } from "@/components/InstallWizard";

const LOCAL_INSTALL_FLAG = "mirror_install_completed";

/**
 * LicenseGate — now only handles install detection.
 * License system has been fully removed.
 */
export function LicenseGate({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<"checking" | "install" | "ready">("checking");
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    checkInstall();
    return () => { mounted.current = false; };
  }, []);

  const checkInstall = async () => {
    try {
      const { data } = await supabase
        .from("system_config")
        .select("value")
        .eq("key", "install_completed")
        .maybeSingle();

      const localInstall = localStorage.getItem(LOCAL_INSTALL_FLAG) === "true";

      if (mounted.current) {
        if (data?.value === "true" || localInstall) {
          setStatus("ready");
        } else {
          setStatus("install");
        }
      }
    } catch {
      const localInstall = localStorage.getItem(LOCAL_INSTALL_FLAG) === "true";
      if (mounted.current) {
        setStatus(localInstall ? "ready" : "install");
      }
    }
  };

  if (status === "checking") return null;

  if (status === "install") {
    return (
      <InstallWizard
        onComplete={() => {
          localStorage.setItem(LOCAL_INSTALL_FLAG, "true");
          setStatus("ready");
        }}
      />
    );
  }

  return <>{children}</>;
}
