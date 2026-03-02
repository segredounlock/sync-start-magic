import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import logo from "@/assets/recargas-brasil-logo.jpeg";

// Preload the image globally so it's cached across renders
const preloadedImage = new Image();
preloadedImage.src = logo;

export function SplashScreen() {
  const [imageReady, setImageReady] = useState(preloadedImage.complete);

  useEffect(() => {
    if (preloadedImage.complete) {
      setImageReady(true);
      return;
    }
    const onLoad = () => setImageReady(true);
    preloadedImage.addEventListener("load", onLoad);
    return () => preloadedImage.removeEventListener("load", onLoad);
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[hsl(var(--background))]">
      {/* Ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] rounded-full bg-primary/10 blur-[100px]" />
      </div>

      {/* Logo */}
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="relative z-10"
      >
        <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden shadow-2xl border border-border/50 ring-1 ring-primary/20">
          {!imageReady && (
            <div className="w-full h-full bg-muted/50 animate-pulse" />
          )}
          <img
            src={logo}
            alt="Recargas Brasil"
            className={`w-full h-full object-cover transition-opacity duration-300 ${imageReady ? "opacity-100" : "opacity-0 absolute inset-0"}`}
          />
        </div>
      </motion.div>

      {/* Animated dots */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="flex gap-2 mt-6 z-10"
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2.5 h-2.5 rounded-full bg-primary"
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.div>

      {/* Text */}
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="mt-4 text-sm text-muted-foreground font-medium tracking-wide z-10"
      >
        Carregando...
      </motion.p>
    </div>
  );
}
