

## Diferenças entre os Efeitos Sazonais: Global (`SeasonalEffects.tsx`) vs Mini App (`TelegramMiniApp.tsx`)

### Componente Global (`SeasonalEffects.tsx` — usado em App.tsx)
- **Transição suave completa**: Tem sistema de `exiting` com timer de 2s, partículas fazem fade-out com rotação antes de trocar o tema
- **12 partículas** com tamanhos e delays aleatórios
- **AnimatePresence** no banner e no glow para saída animada
- **Exclusão do Mini App**: Detecta `pathname === "/miniapp"` e retorna `null` (não renderiza)
- Funciona em todas as páginas exceto `/miniapp`

### Mini App (`TelegramMiniApp.tsx` — efeitos inline)
- **Sem transição de saída**: Quando muda o tema, simplesmente troca os emojis e gradientes sem animação de saída graceful. Falta o sistema `exiting` / `transitioning`
- **8 partículas** (otimizado para mobile)
- **Banner extra na parte inferior** (strip acima da nav bar) — exclusivo do Mini App
- **Sem AnimatePresence no glow** (falta `exit` coordenado)
- Usa `useSeasonalTheme()` hook mas **ignora o estado `transitioning`**

### Problema Identificado
O Mini App tem efeitos sazonais **sem as transições suaves** que foram implementadas no componente global. Quando o tema muda, os efeitos cortam abruptamente ao invés de sair com elegância.

### Plano de Correção

1. **Adicionar lógica de transição no Mini App** — usar o estado `transitioning` do hook `useSeasonalTheme` para controlar animações de saída:
   - Partículas: fade-out com rotação (igual ao global)
   - Banner top e bottom: slide-out com opacidade
   - Glow: fade suave de 1.5s
   
2. **Separar `displayedTheme` de `activeTheme`** — o Mini App já recebe `displayedTheme` do hook, mas precisa respeitar o estado `transitioning` para não trocar os visuais abruptamente

3. **Envolver banner e glow em `AnimatePresence`** com condição `!transitioning` para coordenar a saída

Resultado: comportamento idêntico ao global — efeitos saem devagar e com estilo antes do novo tema entrar.

