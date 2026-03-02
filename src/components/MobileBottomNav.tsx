import { useState } from "react";
import { MoreHorizontal, X, LogOut } from "lucide-react";
import { LucideIcon } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

export interface NavItem {
  key: string;
  label: string;
  icon: LucideIcon;
  color?: string;
  animation?: "pulse" | "bounce" | "spin" | "wiggle" | "float";
  highlighted?: boolean;
}

interface PanelLink {
  label: string;
  path: string;
  icon: LucideIcon;
  color: string;
}

interface MobileBottomNavProps {
  items: NavItem[];
  activeKey: string;
  onSelect: (key: string) => void;
  mainCount?: number;
  userLabel?: string;
  userRole?: string;
  onSignOut?: () => void;
  panelLinks?: PanelLink[];
}

export function MobileBottomNav({
  items,
  activeKey,
  onSelect,
  mainCount = 4,
  userLabel,
  userRole,
  onSignOut,
  panelLinks,
}: MobileBottomNavProps) {
  const navigate = useNavigate();
  const mainItems = items.slice(0, mainCount);
  const moreItems = items.slice(mainCount);
  const hasMore = moreItems.length > 0;

  const [moreOpen, setMoreOpen] = useState(false);

  const handleSelect = (key: string) => {
    onSelect(key);
    setMoreOpen(false);
  };

  const isActiveInMore = moreItems.some(i => i.key === activeKey);

  return (
    <>
      {/* Floating Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden px-2.5 pb-[calc(env(safe-area-inset-bottom)+4px)]">
        {/* Gradient fade above bar */}
        <div className="absolute inset-x-0 -top-6 h-6 bg-gradient-to-t from-background/80 to-transparent pointer-events-none" />

        <div className="relative bg-card/90 backdrop-blur-2xl border border-border/50 rounded-[20px] shadow-[0_-2px_30px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.06)] overflow-hidden">
          {/* Subtle top shine line */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

          <div className="flex items-end justify-around px-1 py-1.5">
            {mainItems.map((item) => {
              const isActive = activeKey === item.key;

              if (item.highlighted) {
                return (
                  <motion.button
                    key={item.key}
                    onClick={() => handleSelect(item.key)}
                    className="flex flex-col items-center relative -mb-0.5"
                    whileTap={{ scale: 0.88 }}
                  >
                    {/* Floating highlighted button */}
                    <motion.div
                      className="relative -mt-5"
                      animate={isActive ? { y: [0, -2, 0] } : {}}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                      {/* Outer glow ring */}
                      {isActive && (
                        <motion.div
                          className="absolute -inset-1.5 rounded-[22px] bg-success/20"
                          animate={{ opacity: [0.3, 0.6, 0.3] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}
                      <div
                        className={`w-[52px] h-[52px] rounded-[18px] flex items-center justify-center relative ${
                          isActive
                            ? "bg-gradient-to-b from-success to-success/80 shadow-[0_4px_20px_hsl(var(--success)/0.45)]"
                            : "bg-gradient-to-b from-success/90 to-success/60 shadow-[0_2px_12px_hsl(var(--success)/0.25)]"
                        }`}
                      >
                        {/* Inner shine */}
                        <div className="absolute inset-x-2 top-1 h-[40%] rounded-full bg-white/15" />
                        <item.icon className="h-[22px] w-[22px] text-success-foreground relative z-10" />
                      </div>
                    </motion.div>
                    <span className={`text-[10px] font-bold mt-1.5 tracking-wide ${
                      isActive ? "text-success" : "text-success/60"
                    }`}>
                      {item.label}
                    </span>
                  </motion.button>
                );
              }

              return (
                <motion.button
                  key={item.key}
                  onClick={() => handleSelect(item.key)}
                  className="flex flex-col items-center gap-0.5 px-1 min-w-[56px] relative py-1"
                  whileTap={{ scale: 0.85 }}
                >
                  <div className="relative w-10 h-10 flex items-center justify-center">
                    {/* Active bg pill */}
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          className="absolute inset-0.5 rounded-2xl bg-primary/10 border border-primary/15"
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.5, opacity: 0 }}
                          transition={{ type: "spring", stiffness: 500, damping: 25 }}
                        />
                      )}
                    </AnimatePresence>
                    <item.icon className={`h-[20px] w-[20px] relative z-10 transition-all duration-300 ${
                      isActive
                        ? `${item.color || "text-primary"} drop-shadow-[0_0_8px_hsl(var(--primary)/0.4)]`
                        : "text-muted-foreground/50"
                    }`} />
                  </div>
                  <span className={`text-[10px] font-semibold transition-all duration-300 ${
                    isActive ? (item.color || "text-primary") : "text-muted-foreground/50"
                  }`}>
                    {item.label}
                  </span>
                  {/* Active dot */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        className="absolute bottom-0 w-1 h-1 rounded-full bg-primary shadow-[0_0_6px_hsl(var(--primary)/0.6)]"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 20 }}
                      />
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}

            {hasMore && (
              <motion.button
                onClick={() => setMoreOpen(true)}
                className="flex flex-col items-center gap-0.5 px-1 min-w-[56px] py-1"
                whileTap={{ scale: 0.85 }}
              >
                <div className="relative w-10 h-10 flex items-center justify-center">
                  <AnimatePresence>
                    {(isActiveInMore || moreOpen) && (
                      <motion.div
                        className="absolute inset-0.5 rounded-2xl bg-primary/10 border border-primary/15"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                      />
                    )}
                  </AnimatePresence>
                  <motion.div
                    animate={moreOpen ? { rotate: 90 } : { rotate: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <MoreHorizontal className={`h-5 w-5 relative z-10 transition-colors duration-300 ${
                      isActiveInMore || moreOpen ? "text-primary" : "text-muted-foreground/50"
                    }`} />
                  </motion.div>
                </div>
                <span className={`text-[10px] font-semibold transition-colors duration-300 ${
                  isActiveInMore || moreOpen ? "text-primary" : "text-muted-foreground/50"
                }`}>
                  Mais
                </span>
              </motion.button>
            )}
          </div>
        </div>
      </nav>

      {/* "Mais" Bottom Sheet */}
      <AnimatePresence>
        {moreOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden"
              onClick={() => setMoreOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              className="fixed inset-x-0 bottom-0 z-[61] md:hidden rounded-t-3xl bg-background/95 backdrop-blur-2xl border-t border-border/50 shadow-[0_-8px_40px_rgba(0,0,0,0.4)] pb-[env(safe-area-inset-bottom)]"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-9 h-1 rounded-full bg-muted-foreground/20" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 pb-3">
                <h2 className="text-base font-bold text-foreground">Menu</h2>
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <button
                    onClick={() => setMoreOpen(false)}
                    className="w-8 h-8 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* User Info */}
              {userLabel && (
                <div className="mx-4 mb-3 p-3 rounded-2xl bg-muted/30 border border-border/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0 border border-primary/20">
                      {(userLabel[0] || "U").toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{userLabel}</p>
                      {userRole && (
                        <p className="text-[11px] text-muted-foreground">{userRole}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Grid of items */}
              <div className="px-4 pb-3 grid grid-cols-3 gap-2">
                {moreItems.map((item, index) => {
                  const isActive = activeKey === item.key;
                  return (
                    <motion.button
                      key={item.key}
                      onClick={() => handleSelect(item.key)}
                      className={`flex flex-col items-center justify-center gap-2.5 py-4 px-2 rounded-2xl border transition-all duration-200 active:scale-95 ${
                        isActive
                          ? "bg-primary/10 border-primary/20 text-primary shadow-[0_0_12px_hsl(var(--primary)/0.1)]"
                          : "bg-muted/20 border-border/20 text-foreground hover:bg-muted/40"
                      }`}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04, duration: 0.2 }}
                      whileTap={{ scale: 0.92 }}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isActive ? "bg-primary/15" : "bg-muted/40"
                      }`}>
                        <item.icon className={`h-5 w-5 ${item.color || "text-primary"}`} />
                      </div>
                      <span className={`text-[11px] font-semibold text-center leading-tight ${
                        isActive ? "text-primary" : "text-foreground/80"
                      }`}>
                        {item.label}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Panel Navigation Links */}
              {panelLinks && panelLinks.length > 0 && (
                <div className="px-4 pb-2 pt-1 space-y-1">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground/50 font-semibold px-1 mb-1.5">
                    Ir para
                  </p>
                  {panelLinks.map((link, index) => (
                    <motion.button
                      key={link.path}
                      onClick={() => { navigate(link.path); setMoreOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all duration-200"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (moreItems.length + index) * 0.04, duration: 0.2 }}
                    >
                      <div className="w-8 h-8 rounded-lg bg-muted/30 flex items-center justify-center">
                        <link.icon className={`h-4 w-4 ${link.color}`} />
                      </div>
                      <span>{link.label}</span>
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Sign Out */}
              {onSignOut && (
                <div className="px-4 pb-5 pt-2">
                  <button
                    onClick={onSignOut}
                    className="w-full py-3 rounded-2xl bg-destructive/8 border border-destructive/15 text-destructive text-sm font-semibold hover:bg-destructive/15 flex items-center justify-center gap-2 transition-all duration-200"
                  >
                    <LogOut className="h-4 w-4" /> Sair
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
