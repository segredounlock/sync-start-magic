import { useState, useCallback, useRef, useEffect } from 'react';
import { Bold, Italic, Strikethrough, Code, Quote, Link2 } from 'lucide-react';

interface TextFormatToolbarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  className?: string;
}

interface ToolbarPosition {
  top: number;
  left: number;
}

const FORMAT_BUTTONS = [
  { key: 'bold', icon: Bold, tag: 'b', label: 'Negrito' },
  { key: 'italic', icon: Italic, tag: 'i', label: 'Itálico' },
  { key: 'strike', icon: Strikethrough, tag: 's', label: 'Tachado' },
  { key: 'code', icon: Code, tag: 'code', label: 'Código' },
  { key: 'quote', icon: Quote, tag: 'blockquote', label: 'Citação' },
  { key: 'link', icon: Link2, tag: 'a', label: 'Link' },
] as const;

export function TextFormatToolbar({ value, onChange, placeholder, rows = 4, required, className }: TextFormatToolbarProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPos, setToolbarPos] = useState<ToolbarPosition>({ top: 0, left: 0 });
  const [selection, setSelection] = useState<{ start: number; end: number } | null>(null);

  const handleSelect = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start !== end) {
      setSelection({ start, end });

      // Position toolbar above selection
      const container = containerRef.current;
      if (!container) return;

      const textareaRect = textarea.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      // Estimate position based on character position
      const textBeforeSelection = value.substring(0, start);
      const lines = textBeforeSelection.split('\n');
      const lineHeight = 22;
      const charWidth = 8;
      
      const currentLine = lines.length - 1;
      const currentCol = lines[lines.length - 1].length;
      const selLength = end - start;

      const top = Math.max(0, (currentLine * lineHeight) - 40 + (textareaRect.top - containerRect.top));
      const left = Math.min(
        Math.max(0, (currentCol * charWidth) + (selLength * charWidth / 2) - 100),
        containerRect.width - 250
      );

      setToolbarPos({ top: Math.max(-44, top), left: Math.max(0, left) });
      setShowToolbar(true);
    } else {
      setShowToolbar(false);
      setSelection(null);
    }
  }, [value]);

  const applyFormat = useCallback((tag: string) => {
    if (!selection || !textareaRef.current) return;

    const { start, end } = selection;
    const selectedText = value.substring(start, end);

    if (tag === 'a') {
      const url = prompt('Digite a URL do link:', 'https://');
      if (!url) return;
      const formatted = `<a href="${url}">${selectedText}</a>`;
      const newValue = value.substring(0, start) + formatted + value.substring(end);
      onChange(newValue);
    } else {
      const formatted = `<${tag}>${selectedText}</${tag}>`;
      const newValue = value.substring(0, start) + formatted + value.substring(end);
      onChange(newValue);
    }

    setShowToolbar(false);
    setSelection(null);

    // Refocus textarea
    setTimeout(() => textareaRef.current?.focus(), 50);
  }, [selection, value, onChange]);

  // Hide toolbar on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        toolbarRef.current && !toolbarRef.current.contains(e.target as Node) &&
        textareaRef.current && !textareaRef.current.contains(e.target as Node)
      ) {
        setShowToolbar(false);
        setSelection(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      {/* Floating toolbar */}
      {showToolbar && (
        <div
          ref={toolbarRef}
          className="absolute z-50 flex items-center gap-0.5 px-1.5 py-1 rounded-xl bg-[#1a1a2e] border border-border/30 shadow-xl animate-in fade-in zoom-in-95 duration-150"
          style={{ top: toolbarPos.top, left: toolbarPos.left }}
        >
          {FORMAT_BUTTONS.map(({ key, icon: Icon, tag, label }) => (
            <button
              key={key}
              type="button"
              title={label}
              onMouseDown={(e) => {
                e.preventDefault(); // Prevent textarea blur
                applyFormat(tag);
              }}
              className="p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      )}

      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onSelect={handleSelect}
        onMouseUp={handleSelect}
        placeholder={placeholder}
        rows={rows}
        required={required}
        className={className}
      />

      <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1.5">
        <span className="opacity-60">💡</span>
        Selecione o texto para formatar: <span className="font-bold">negrito</span>, <span className="italic">itálico</span>, <span className="line-through">tachado</span>, <code className="text-[10px] bg-muted/50 px-1 rounded">código</code>, link
      </p>
    </div>
  );
}

/** Render HTML-formatted text safely for preview (only Telegram-allowed tags) */
export function renderTelegramHtml(text: string): string {
  const allowedTags = ['b', 'i', 's', 'code', 'blockquote', 'a', 'pre', 'u'];
  // Escape everything except allowed tags
  let safe = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  
  // Re-enable allowed tags
  for (const tag of allowedTags) {
    // Opening tags (with attributes for <a>)
    if (tag === 'a') {
      safe = safe.replace(/&lt;a\s+href=&quot;([^&]*)&quot;&gt;/gi, '<a href="$1" class="text-primary underline" target="_blank" rel="noopener noreferrer">');
    } else {
      safe = safe.replace(new RegExp(`&lt;${tag}&gt;`, 'gi'), `<${tag}>`);
    }
    // Closing tags
    safe = safe.replace(new RegExp(`&lt;/${tag}&gt;`, 'gi'), `</${tag}>`);
  }

  // Auto-link plain URLs that are not already inside <a> tags
  safe = safe.replace(
    /(?<!href="|">)(https?:\/\/[^\s<]+)/gi,
    '<a href="$1" class="text-primary underline break-all" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  return safe;
}
