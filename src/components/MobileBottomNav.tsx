import { useState } from "react";
import { MoreHorizontal, X, LogOut, Crown, BarChart3, Landmark, LayoutDashboard } from "lucide-react";
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
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden px-3 pb-[calc(env(safe-area-inset-bottom)+6px)]">
        <div className="bg-card/95 backdrop-blur-xl rounded-2xl shadow-[0_-4px_24px_rgba(0,0,0,0.3)] px-1">
          <div className="flex items-end justify-around py-1">
            {mainItems.map((item, index) => {
              const isActive = activeKey === item.key;
              const iconColor = isActive ? (item.color || "text-primary") : "text-muted-foreground/70";

              if (item.highlighted) {
                return (
                  <motion.button
                    key={item.key}
                    onClick={() => handleSelect(item.key)}
                    className="flex flex-col items-center gap-0.5 -mb-0.5 relative"
                    whileTap={{ scale: 0.9 }}
                  >
                    <motion.div
                      className={`w-[54px] h-[54px] rounded-2xl flex items-center justify-center -mt-7 relative ${
                        isActive
                          ? "bg-success shadow-[0_0_28px_hsl(var(--success)/0.5)]"
                          : "bg-success/80 shadow-[0_0_16px_hsl(var(--success)/0.3)]"
                      }`}
                      animate={isActive ? {
                        y: [0, -3, 0],
                        boxShadow: [
                          "0 0 16px hsl(var(--success) / 0.3)",
                          "0 0 28px hsl(var(--success) / 0.5)",
                          "0 0 16px hsl(var(--success) / 0.3)",
                        ]
                      } : {}}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <item.icon className="h-6 w-6 text-success-foreground" />
                    </motion.div>
                    <span className={`text-[10px] font-bold mt-0.5 ${
                      isActive ? "text-success" : "text-success/70"
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
                  className="flex flex-col items-center gap-0.5 pb-0.5 px-1.5 min-w-[52px] relative"
                  whileTap={{ scale: 0.85 }}
                >
                  <div className="relative w-10 h-10 flex items-center justify-center">
                    {/* Active glow background */}
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          className="absolute inset-0 rounded-xl bg-primary/15"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ type: "spring", stiffness: 400, damping: 20 }}
                        />
                      )}
                    </AnimatePresence>
                    <motion.div
                      animate={{ y: [0, -3, 0] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: index * 0.2 }}
                    >
                      <item.icon className={`h-5 w-5 relative z-10 transition-all duration-200 ${
                        item.color || "text-primary"
                      } ${isActive ? "drop-shadow-[0_0_6px_hsl(var(--primary)/0.5)]" : "opacity-80"}`} />
                    </motion.div>
                  </div>
                  <span className={`text-[10px] font-semibold transition-colors duration-200 ${
                    isActive ? (item.color || "text-primary") : (item.color || "text-primary/70")
                  }`}>
                    {item.label}
                  </span>
                  {/* Active dot indicator */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        className="absolute -bottom-0.5 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_6px_hsl(var(--primary)/0.5)]"
                        initial={{ scale: 0 }}
                        animate={{ scale: [1, 1.3, 1] }}
                        exit={{ scale: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 25 }}
                      />
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}

            {hasMore && (
              <motion.button
                onClick={() => setMoreOpen(true)}
                className="flex flex-col items-center gap-0.5 py-1.5 px-1.5 min-w-[52px]"
                whileTap={{ scale: 0.85 }}
              >
                <div className="relative w-10 h-10 flex items-center justify-center">
                  <AnimatePresence>
                    {(isActiveInMore || moreOpen) && (
                      <motion.div
                        className="absolute inset-0 rounded-xl bg-primary/15"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                      />
                    )}
                  </AnimatePresence>
                  <motion.div
                    animate={moreOpen ? { rotate: 90 } : { rotate: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <MoreHorizontal className={`h-5 w-5 relative z-10 ${isActiveInMore || moreOpen ? "text-primary" : "text-muted-foreground/70"}`} />
                  </motion.div>
                </div>
                <span className={`text-[10px] font-medium ${
                  isActiveInMore || moreOpen ? "text-primary" : "text-muted-foreground/70"
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
              className="fixed inset-0 bg-black/60 z-[60] md:hidden"
              onClick={() => setMoreOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              className="fixed inset-x-0 bottom-0 z-[61] md:hidden rounded-t-2xl bg-background shadow-[0_-8px_30px_rgba(0,0,0,0.4)] pb-[env(safe-area-inset-bottom)]"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 pb-3">
                <h2 className="font-display text-lg font-bold text-foreground">Menu</h2>
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <button
                    onClick={() => setMoreOpen(false)}
                    className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* User Info */}
              {userLabel && (
                <div className="mx-4 mb-3 p-3 rounded-xl bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                      {(userLabel[0] || "U").toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{userLabel}</p>
                      {userRole && <p className="text-xs text-muted-foreground">{userRole}</p>}
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
                      className={`flex flex-col items-center justify-center gap-2 py-4 px-2 rounded-xl active:scale-95 ${
                        isActive
                          ? "bg-primary/15 text-primary"
                          : "bg-muted/40 text-foreground hover:bg-muted/60"
                      }`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.2 }}
                      whileTap={{ scale: 0.92 }}
                    >
                      <item.icon className={`h-6 w-6 ${item.color || "text-primary"}`} />
                      <span className={`text-[11px] font-semibold text-center leading-tight ${isActive ? "text-primary" : "text-foreground"}`}>
                        {item.label}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Panel Navigation Links */}
              {panelLinks && panelLinks.length > 0 && (
                <div className="px-4 pb-2 pt-1 space-y-1">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-semibold px-1 mb-1.5">Ir para</p>
                  {panelLinks.map((link, index) => (
                    <motion.button
                      key={link.path}
                      onClick={() => { navigate(link.path); setMoreOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (moreItems.length + index) * 0.05, duration: 0.2 }}
                    >
                      <link.icon className={`h-5 w-5 ${link.color}`} />
                      <span>{link.label}</span>
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Sign Out */}
              {onSignOut && (
                <div className="px-4 pb-5 pt-1">
                  <button
                    onClick={onSignOut}
                    className="w-full py-3 rounded-xl bg-destructive/10 text-destructive text-sm font-semibold hover:bg-destructive/20 flex items-center justify-center gap-2"
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
