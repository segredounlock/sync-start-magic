import { motion } from "framer-motion";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { DocSection } from "./docsRedeData";

export function renderMarkdown(text: string) {
  const lines = text.split("\n");
  const elements: JSX.Element[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code blocks
    if (line.trim().startsWith("```")) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++;
      elements.push(
        <pre key={`code-${i}`} className="bg-muted/50 border border-border rounded-lg p-4 overflow-x-auto text-xs font-mono text-foreground my-3">
          {codeLines.join("\n")}
        </pre>
      );
      continue;
    }

    // Tables
    if (line.includes("|") && line.trim().startsWith("|")) {
      const tableRows: string[] = [];
      while (i < lines.length && lines[i].includes("|") && lines[i].trim().startsWith("|")) {
        tableRows.push(lines[i]);
        i++;
      }
      const parsed = tableRows
        .filter((r) => !r.match(/^\|\s*[-:]+/))
        .map((r) => r.split("|").filter(Boolean).map((c) => c.trim()));

      if (parsed.length > 0) {
        const header = parsed[0];
        const body = parsed.slice(1);
        elements.push(
          <div key={`table-${i}`} className="overflow-x-auto my-3">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr>
                  {header.map((h, hi) => (
                    <th key={hi} className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/30 border-b border-border first:rounded-tl-lg last:rounded-tr-lg">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {body.map((row, ri) => (
                  <tr key={ri} className="border-b border-border/50 hover:bg-muted/10">
                    {row.map((cell, ci) => (
                      <td key={ci} className="px-3 py-2 text-foreground">
                        <span dangerouslySetInnerHTML={{ __html: cell.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-muted text-xs font-mono text-primary">$1</code>').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>') }} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      continue;
    }

    // H3
    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={`h3-${i}`} className="text-base font-bold text-foreground mt-5 mb-2">
          {line.replace("### ", "")}
        </h3>
      );
      i++;
      continue;
    }

    // H4
    if (line.startsWith("#### ")) {
      elements.push(
        <h4 key={`h4-${i}`} className="text-sm font-bold text-primary mt-4 mb-1">
          {line.replace("#### ", "")}
        </h4>
      );
      i++;
      continue;
    }

    // List items
    if (line.trim().startsWith("- ")) {
      elements.push(
        <li key={`li-${i}`} className="text-sm text-muted-foreground ml-4 list-disc my-1">
          <span dangerouslySetInnerHTML={{ __html: line.trim().slice(2).replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-muted text-xs font-mono text-primary">$1</code>').replace(/\*\*([^*]+)\*\*/g, '<strong class="text-foreground">$1</strong>') }} />
        </li>
      );
      i++;
      continue;
    }

    // Empty line
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Regular paragraph
    elements.push(
      <p key={`p-${i}`} className="text-sm text-muted-foreground leading-relaxed my-2">
        <span dangerouslySetInnerHTML={{ __html: line.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-muted text-xs font-mono text-primary">$1</code>').replace(/\*\*([^*]+)\*\*/g, '<strong class="text-foreground">$1</strong>') }} />
      </p>
    );
    i++;
  }

  return elements;
}

export function SectionAccordion({ section, isOpen, onToggle }: { section: DocSection; isOpen: boolean; onToggle: () => void }) {
  const Icon = section.icon;
  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card/50 backdrop-blur-sm">
      <button onClick={onToggle} className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-muted/20 transition-colors">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="h-4.5 w-4.5 text-primary" />
        </div>
        <span className="flex-1 text-base font-bold text-foreground">{section.title}</span>
        {isOpen ? <ChevronDown className="h-5 w-5 text-muted-foreground" /> : <ChevronRight className="h-5 w-5 text-muted-foreground" />}
      </button>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="px-5 pb-5 border-t border-border"
        >
          <div className="pt-4">{renderMarkdown(section.content)}</div>
        </motion.div>
      )}
    </div>
  );
}
