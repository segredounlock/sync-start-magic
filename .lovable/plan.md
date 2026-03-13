
Objetivo: impedir que números de uma operadora sejam enviados como outra (ex.: TIM enviada como CLARO), reduzindo erros como “MSISDN not found at Claro”.

1) Diagnóstico (com base no código atual)
- O Mini App faz verificação de número (blacklist/cooldown), mas não bloqueia de forma explícita “operadora divergente”.
- O Bot do Telegram (fluxo de recarga por chat) hoje não faz validação de operadora antes da confirmação final.
- A função backend central (`recarga-express`) ainda aceita a operadora escolhida e só descobre a inconsistência no erro final do provedor.
- Resultado: o erro chega tarde (na criação da recarga), gerando retrabalho e suporte manual.

2) Plano de implementação
- Camada 1 (backend, obrigatória): adicionar validação de operadora dentro de `recarga-express` na ação `recharge`, antes de criar a recarga.
  - Validar telefone (10/11 dígitos) e normalização.
  - Verificar operadora real via endpoint de consulta já existente (quando configurado) e/ou campos retornados no `check-phone`.
  - Comparar operadora detectada vs operadora selecionada (com normalização e aliases: TIM/CLARO/VIVO/OI etc.).
  - Se divergente, bloquear com erro estruturado:
    - `code: "OPERATOR_MISMATCH"`
    - `message` amigável
    - `detected_operator` e `selected_operator`.
- Camada 2 (Mini App): no passo de verificação (`check`), tratar `OPERATOR_MISMATCH` com UI clara:
  - “Esse número parece ser TIM, não CLARO.”
  - bloquear botão de continuar para valores;
  - CTA para “Trocar operadora”.
- Camada 3 (Bot Telegram): validar no `handleRecargaPhone` antes de chegar em `rconfirm_yes`.
  - Se divergente, responder imediatamente com mensagem de orientação e botão para voltar à escolha de operadora.
- Camada 4 (Painel Web de recarga): reforçar o pré-check já existente para exibir mismatch e impedir envio.
- Camada 5 (fallback inteligente): quando o provedor retornar erro textual tipo “MSISDN not found at ...”, converter para erro amigável padronizado (`OPERATOR_MISMATCH`) no backend.

3) Arquivos alvo
- `supabase/functions/recarga-express/index.ts` (regra principal de bloqueio e erro estruturado)
- `src/pages/TelegramMiniApp.tsx` (mensagem/fluxo visual de operadora divergente)
- `supabase/functions/telegram-bot/index.ts` (bloqueio antes da confirmação no chat)
- `src/pages/RevendedorPainel.tsx` (feedback e bloqueio no formulário web)

4) Critérios de aceite
- Ao informar número TIM e selecionar CLARO:
  - Mini App: não permite avançar para confirmação.
  - Bot: não permite confirmar recarga.
  - Painel: bloqueia envio.
  - Backend: nunca cria recarga nessas condições.
- Mensagem ao usuário sempre amigável, sem erro técnico cru.
- Logs backend registram mismatch com operador detectado e selecionado para auditoria.

5) Detalhes técnicos (resumo)
- Sem necessidade de nova tabela/migração neste ajuste.
- Sem alterar autenticação ou políticas de acesso.
- Padronizar resposta de erro no backend evita divergência entre Mini App, Bot e Painel.
- Comparação de operadora deve usar normalização robusta (acento, caixa, espaços, aliases comerciais).
