

## Plano: Botão para testar som de depósito

### O que será feito
Adicionar um botão "Testar Som" na seção de Notificações do `/principal` (Geral) que, ao ser clicado, toca o som de confirmação de depósito (`pix.mp3`).

### Alteração

**`src/pages/Principal.tsx`** — Na seção de Notificações (card de configuração):
- Adicionar um botão estilizado com ícone de alto-falante abaixo da nota informativa
- Ao clicar, chama `unlockAudio()` + `playCashRegisterSound()` do `src/lib/sounds.ts`
- Texto: "🔊 Testar Som de Depósito"

