

## Plano: Ocultar nome interno do gateway para usuários

### Problema
No `RevendedorPainel.tsx` (linha 2346), quando o revendedor gera um PIX, aparece `via PixGo`, `via PushinPay`, etc. Usuários normais não devem ver o nome interno do gateway — deve aparecer apenas **"via Pix"**.

### Locais encontrados
| Arquivo | Linha | Contexto | Visível para |
|---|---|---|---|
| `RevendedorPainel.tsx` | 2346 | `via {pixData.gateway}` na tela de pagamento PIX | Revendedores/usuários |
| `AdminDashboard.tsx` | 2356-2368 | Modal "Detalhes do Depósito" com badge do gateway | Apenas admin ✅ |

O AdminDashboard é exclusivo de admins, então os nomes técnicos (PixGo, PushinPay, etc.) podem permanecer lá.

### Alteração
**`src/pages/RevendedorPainel.tsx` (linha 2346)**
- Trocar `via {pixData.gateway}` por `via Pix`
- Simples e direto — o método de pagamento é sempre PIX, independente do gateway interno.

