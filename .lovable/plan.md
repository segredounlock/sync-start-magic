

# Ajustar cores hardcoded no TelegramMiniApp.tsx para design tokens semânticos

## Contexto

O arquivo `TelegramMiniApp.tsx` (2805 linhas) possui **237+ ocorrências** de cores hardcoded (`#22c55e`, `#4ade80`, `#f87171`, `rgba(...)`, etc.) espalhadas pelo JSX. Já existe um objeto `st` (linha ~1090) que centraliza estilos via CSS custom properties (`--tg-*`), mas muitos elementos ignoram esse sistema.

## Estratégia

Expandir o objeto `st` com tokens semânticos adicionais e substituir todas as referências hardcoded por esses tokens.

### 1. Expandir o objeto de estilos `st` (~linha 1090)

Adicionar tokens que faltam:

```ts
const st = {
  // ... existentes (bg, text, hint, link, accent, btn, destructive) ...
  green:       { color: "var(--tg-accent)" },          // era "#22c55e"
  success:     { color: "var(--tg-accent)" },           // "#4ade80" → accent
  successBg:   { backgroundColor: "color-mix(in srgb, var(--tg-accent) 15%, transparent)" },
  warningText: { color: "var(--tg-warning, #facc15)" },
  dangerText:  { color: "var(--tg-destructive)" },      // "#f87171"/"#ef4444"
  dangerBg:    { backgroundColor: "color-mix(in srgb, var(--tg-destructive) 15%, transparent)" },
  infoBg:      { backgroundColor: "color-mix(in srgb, var(--tg-accent) 15%, transparent)" },
  inputBg:     { backgroundColor: "color-mix(in srgb, var(--tg-text) 8%, var(--tg-bg))", 
                 color: "var(--tg-text)", border: "1px solid color-mix(in srgb, var(--tg-hint) 20%, transparent)" },
  overlay:     { backgroundColor: "color-mix(in srgb, var(--tg-bg) 85%, transparent)" },
};
```

### 2. Adicionar CSS custom property `--tg-warning`

Na função `applyThemeVars` que injeta as `--tg-*` no `:root`, adicionar:
```ts
"--tg-warning": isDark ? "#facc15" : "#eab308"
```

### 3. Substituições em massa (por categoria)

| Cor hardcoded | Token semântico | Qtd aprox. |
|---|---|---|
| `"#22c55e"` | `var(--tg-accent)` / `st.accent` | ~30 |
| `"#4ade80"` | `var(--tg-accent)` / `st.success` | ~40 |
| `"#f87171"` / `"#ef4444"` | `var(--tg-destructive)` / `st.dangerText` | ~25 |
| `"#facc15"` | `var(--tg-warning)` / `st.warningText` | ~10 |
| `rgba(74,222,128,0.15)` | `st.successBg` | ~15 |
| `rgba(239,68,68,0.15)` | `st.dangerBg` | ~10 |
| `rgba(255,255,255,0.08/0.12)` | `st.inputBg` / `st.overlay` | ~20 |
| `"#f5f5f5"` | `var(--tg-text)` | ~15 |
| `"#3b82f6"` / `"#a855f7"` / `"#ef4444"` (operadoras) | Manter no objeto `opColors` (são brand colors intencionais) | — |

### 4. Função `timeColor` — usar tokens

```ts
const timeColor = (s: number) => 
  s <= 120 ? "var(--tg-accent)" : s <= 300 ? "var(--tg-warning)" : "var(--tg-destructive)";
```

### 5. Exceções (NÃO converter)

- `TG_DARK_DEFAULTS` / `TG_LIGHT_DEFAULTS` — são valores de fallback para a API do Telegram, precisam ser hex
- `opColors` (CLARO/TIM/VIVO) — brand colors intencionais
- Gradientes de operadora — mesma razão

### Impacto

- Zero mudança visual (mesmas cores, apenas via indireção)
- Facilita manutenção e futuras mudanças de tema
- Preparação para suporte a tema claro no Mini App

