import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, ArrowLeft, Copy, Check, Shield } from "lucide-react";
import { sections } from "./docs/docsRedeData";
import { SectionAccordion } from "./docs/DocsRedeComponents";

export default function DocsRede() {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(["visao-geral"]));
  const [copied, setCopied] = useState(false);

  const toggleSection = (id: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const expandAll = () => setOpenSections(new Set(sections.map((s) => s.id)));
  const collapseAll = () => setOpenSections(new Set());

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText("https://recargasbrasill.com/docs/rede");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Voltar</span>
          </a>
          <button
            onClick={copyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copiado!" : "Copiar Link"}
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 pb-20">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
            <BookOpen className="h-3.5 w-3.5" />
            Documentação Técnica
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-foreground mb-3">
            Sistema de Rede de Indicações
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
            Documentação completa do modelo de micro-franquias digitais — precificação em cascata, comissões automáticas, isolamento por RLS e multicanal unificado.
          </p>
        </motion.div>

        {/* Controls */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-xs text-muted-foreground font-medium">{sections.length} seções</p>
          <div className="flex gap-2">
            <button onClick={expandAll} className="text-xs font-semibold text-primary hover:underline">Expandir Tudo</button>
            <span className="text-muted-foreground">·</span>
            <button onClick={collapseAll} className="text-xs font-semibold text-primary hover:underline">Fechar Tudo</button>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-3">
          {sections.map((section, i) => (
            <motion.div key={section.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <SectionAccordion
                section={section}
                isOpen={openSections.has(section.id)}
                onToggle={() => toggleSection(section.id)}
              />
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-muted/30 border border-border">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">Documentação gerada automaticamente · Atualizada em Março 2026</span>
          </div>
        </div>
      </div>
    </div>
  );
}
