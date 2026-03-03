import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface MentionUser {
  id: string;
  nome: string | null;
  avatar_url: string | null;
  role?: string;
}

interface MentionDropdownProps {
  users: MentionUser[];
  filter: string;
  onSelect: (user: MentionUser) => void;
  visible: boolean;
}

export function MentionDropdown({ users, filter, onSelect, visible }: MentionDropdownProps) {
  const ref = useRef<HTMLDivElement>(null);

  const filtered = users.filter(u => {
    if (!filter) return true;
    return (u.nome || "").toLowerCase().includes(filter.toLowerCase());
  }).slice(0, 6);

  if (!visible || filtered.length === 0) return null;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="absolute bottom-full left-0 right-0 mb-1 mx-3 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50 max-h-48 overflow-y-auto"
    >
      {filtered.map(u => (
        <button
          key={u.id}
          onMouseDown={(e) => { e.preventDefault(); onSelect(u); }}
          className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-muted/60 transition-colors text-left"
        >
          {u.avatar_url ? (
            <img src={u.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
              {(u.nome || "?")[0]?.toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{u.nome || "Usuário"}</p>
            {u.role === "admin" && <span className="text-[9px] text-primary font-semibold">Admin</span>}
          </div>
        </button>
      ))}
    </motion.div>
  );
}
