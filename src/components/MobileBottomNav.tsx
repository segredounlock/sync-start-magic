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
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card/95 backdrop-blur-xl border-t border-border/50 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around h-14">
          {mainItems.map((item) => {
            const isActive = activeKey === item.key;
            return (
              <motion.button
                key={item.key}
                onClick={() => handleSelect(item.key)}
                className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${
                  isActive ? "" : "opacity-50"
                }`}
                whileTap={{ scale: 0.9 }}
              >
                <motion.div
                  animate={{ y: [0, -2, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <item.icon className={`h-5 w-5 ${item.color || "text-primary"}`} />
                </motion.div>
                <span className={`text-[10px] font-semibold ${item.color || "text-primary"}`}>
                  {item.label}
                </span>
                {isActive && (
                  <motion.div
                    className="w-1 h-1 rounded-full bg-primary mt-0.5"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    layoutId="nav-dot"
                  />
                )}
              </motion.button>
            );
          })}

          {hasMore && (
            <button
              onClick={() => setMoreOpen(true)}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${
                isActiveInMore ? "" : "opacity-50"
              }`}
            >
              <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
              <span className="text-[10px] font-semibold text-muted-foreground">Mais</span>
            </button>
          )}
        </div>
      </nav>

      {/* Bottom Sheet */}
      <AnimatePresence>
        {moreOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 z-[60] md:hidden"
              onClick={() => setMoreOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              className="fixed inset-x-0 bottom-0 z-[61] md:hidden rounded-t-2xl bg-background border-t border-border shadow-2xl pb-[env(safe-area-inset-bottom)]"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
            >
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-9 h-1 rounded-full bg-muted-foreground/20" />
              </div>

              <div className="flex items-center justify-between px-5 pb-3">
                <h2 className="text-base font-bold text-foreground">Menu</h2>
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

              {userLabel && (
                <div className="mx-4 mb-3 p-3 rounded-xl bg-muted/40">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center text-sm font-bold text-primary">
                      {(userLabel[0] || "U").toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{userLabel}</p>
                      {userRole && <p className="text-[11px] text-muted-foreground">{userRole}</p>}
                    </div>
                  </div>
                </div>
              )}

              <div className="px-4 pb-3 grid grid-cols-3 gap-2">
                {moreItems.map((item) => {
                  const isActive = activeKey === item.key;
                  return (
                    <motion.button
                      key={item.key}
                      onClick={() => handleSelect(item.key)}
                      className={`flex flex-col items-center justify-center gap-2 py-4 rounded-xl transition-colors ${
                        isActive ? "bg-primary/10 text-primary" : "bg-muted/30 text-foreground"
                      }`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.05 * moreItems.indexOf(item), type: "spring", stiffness: 300, damping: 20 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <motion.div
                        animate={{ y: [0, -3, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.1 * moreItems.indexOf(item) }}
                      >
                        <item.icon className={`h-5 w-5 ${item.color || "text-primary"}`} />
                      </motion.div>
                      <span className="text-[11px] font-semibold">{item.label}</span>
                    </motion.button>
                  );
                })}
              </div>

              {panelLinks && panelLinks.length > 0 && (
                <div className="px-4 pb-2 space-y-0.5">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground/50 font-semibold px-1 mb-1">Ir para</p>
                  {panelLinks.map((link) => (
                    <button
                      key={link.path}
                      onClick={() => { navigate(link.path); setMoreOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted/30 transition-colors"
                    >
                      <link.icon className={`h-4 w-4 ${link.color}`} />
                      <span>{link.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {onSignOut && (
                <div className="px-4 pb-5 pt-2">
                  <button
                    onClick={onSignOut}
                    className="w-full py-2.5 rounded-xl bg-destructive/10 text-destructive text-sm font-semibold flex items-center justify-center gap-2"
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
