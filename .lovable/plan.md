

## Plano: Sons de notificação distintos para cadastros Web vs Telegram

### O que será feito

Adicionar dois novos sons de notificação usando Web Audio API (sem arquivos externos), cada um com timbre e melodia distintos:

- **Web** → Som agudo e brilhante (arpejo ascendente em dó maior, tipo "ding-ding-ding")
- **Telegram** → Som mais grave e robótico (onda quadrada/triangle, notas diferentes, tipo "bloop-bloop")

### Arquivos modificados

**1. `src/lib/sounds.ts`** — Adicionar duas novas funções:
- `playWebSignupSound()` — Arpejo ascendente com ondas sine, notas C5-E5-G5 (brilhante, acolhedor)
- `playTelegramSignupSound()` — Duas notas graves com onda triangle/square, notas G3-C4 (robótico, distinto)

**2. `src/hooks/usePrincipalNewUserToasts.ts`** — Chamar o som correspondente junto com cada toast:
- No callback de `profiles` INSERT → chamar `playWebSignupSound()`
- Nos callbacks de `telegram_users` INSERT e UPDATE → chamar `playTelegramSignupSound()`

### Detalhes técnicos

Os sons usam exclusivamente a Web Audio API (já utilizada no `playSuccessSound` existente), sem dependências externas. Cada som terá duração de ~0.5s e volume baixo (0.15) para não ser intrusivo. Falha silenciosa caso o navegador não suporte áudio.

