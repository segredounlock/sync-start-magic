
Objetivo: ajustar o instalador do espelho para inicializar automaticamente a configuração necessária, salvar com segurança no banco e eliminar os problemas de duplicação/erros no fluxo.

1. Corrigir a duplicação visual imediata
- Remover a segunda renderização de `renderAdmin()` em `src/components/InstallWizard.tsx`.
- Revisar o passo `admin` para garantir que o formulário apareça só uma vez e que o step indicator continue correto.

2. Trocar a ideia de “rodar migrations no frontend” por inicialização backend segura
- Não depender de o frontend “aplicar migrations”, porque isso não é confiável nem permitido como fluxo de instalação.
- Usar o `init-mirror` como etapa automática obrigatória de bootstrap do espelho.
- Fazer o instalador chamar essa função no momento certo, após criar o admin e já com sessão/token válidos.

3. Reordenar o fluxo de instalação para salvar sem quebrar RLS
- Fluxo alvo:
  1. criar admin
  2. aguardar sessão estar pronta
  3. persistir chaves críticas (`license_key`, `license_master_url`, `masterProjectUrl`)
  4. chamar `init-mirror`
  5. validar retorno da inicialização
  6. marcar `install_completed`
- Se qualquer etapa crítica falhar, a instalação não conclui.

4. Melhorar a robustez do salvamento
- Confirmar via leitura imediata que `license_master_url` e `masterProjectUrl` ficaram gravadas corretamente.
- Salvar também um status claro de inicialização para evitar estado “meio instalado”.
- Exibir erro real retornado pelo backend quando `init-mirror` falhar, em vez de mensagem genérica.

5. Corrigir erros de duplicidade lógica no fluxo
- Revisar se o instalador está:
  - executando `upsert` repetido sem necessidade,
  - voltando para `license` em erro sem limpar estado,
  - disparando operações em sequência sem checar autenticação pronta.
- Garantir que o botão “Instalar” não possa disparar duas vezes enquanto estiver carregando.

6. Alinhar com o gate de licença
- Ajustar a leitura em `LicenseGate.tsx` para reconhecer melhor:
  - instalação não iniciada,
  - instalação incompleta,
  - configuração mestre ausente/inválida,
  - licença ausente,
  - licença válida.
- Evitar cair em telas erradas por conta de configuração parcial.

7. Melhorar o feedback do usuário
- Manter a UI simples como você pediu: sem lista técnica de “dependências”.
- Mostrar somente:
  - carregando,
  - sucesso,
  - erro exato do backend,
  - opção de tentar novamente.
- Se `init-mirror` detectar problema estrutural, mostrar mensagem objetiva sobre o que faltou.

Seção técnica
- Arquivos principais:
  - `src/components/InstallWizard.tsx`
  - `src/components/LicenseGate.tsx`
  - `supabase/functions/init-mirror/index.ts`
  - possivelmente `src/utils/licenseValidation.ts`
- Correção concreta já confirmada no código:
  - existe duplicação em `InstallWizard.tsx`:
    - `{step === "admin" && renderAdmin()}`
    - `{step === "admin" && renderAdmin()}`
- Direção recomendada:
  - usar `init-mirror` como bootstrap idempotente,
  - não tentar “rodar migration automática” pelo cliente,
  - tratar bootstrap como requisito de instalação e validar resposta antes de finalizar.
- Resultado esperado:
  - sem formulário duplicado,
  - sem instalação incompleta silenciosa,
  - sem erro genérico quando o backend falhar,
  - persistência confiável das chaves críticas do espelho.
