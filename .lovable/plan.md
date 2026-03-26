
# Corrigir de Forma Definitiva a Tela Branca no Espelho

## Diagnóstico corrigido
A evidência atual mostra que o problema **não é mais “o projeto principal não tem a função ou os dados”**.

No ambiente deste projeto já existem:
- `get_maintenance_mode()`
- policy pública para branding em `system_config`
- vários registros em `system_config`

Então a tela branca no espelho indica outra causa mais provável:

```text
Projeto principal (teste) = OK
Espelho/publicado          = desatualizado ou não inicializado
```

Ou seja, o espelho pode estar com:
- backend sem as migrations publicadas
- `system_config` sem dados mínimos
- publicação de código feita sem a etapa de inicialização do backend
- divergência entre sync de arquivos GitHub e estado real do backend do espelho

## O que precisa ser feito

### 1. Corrigir a origem do problema: espelho sem inicialização garantida
Fortalecer o fluxo do espelho para que ele **nunca dependa de suposição manual**.

#### Ajustes no `supabase/functions/init-mirror/index.ts`
Expandir a inicialização para garantir sempre:
- configs mínimas em `system_config`
- `siteTitle` e `siteSubtitle`
- flags essenciais do sistema
- catálogo mínimo ou aviso claro se não puder sincronizar operadoras
- geração de `referral_code` faltante
- resposta final com diagnóstico completo

Hoje ele já insere configs, mas precisa ficar mais explícito e completo para white-label.

### 2. Adicionar verificação real de prontidão do espelho
O sistema precisa distinguir:

```text
Arquivos sincronizados != espelho pronto para uso
```

#### Ajustes em `supabase/functions/github-sync/index.ts`
Adicionar/fortalecer uma action de status do espelho que valide:
- se `system_config` tem dados essenciais
- se existem tabelas mínimas com dados-base
- se a função `get_maintenance_mode` está disponível
- se o mirror está “pronto”, “parcial” ou “quebrado”

Isso evita confiar apenas no sync de GitHub.

### 3. Melhorar o painel de Backup/Mirror para entendimento claro
#### Ajustes em `src/components/BackupSection.tsx`
Melhorar textos, diagnóstico e legibilidade:
- fontes maiores
- mensagens mais claras sobre a diferença entre:
  - sincronização de arquivos
  - publicação
  - inicialização do backend
- exibir checklist visual:
  - Código sincronizado
  - Backend inicializado
  - Configurações mínimas presentes
  - Mirror apto para abrir sem tela branca

### 4. Mostrar status avançado no painel de mirror
#### Ajustes em `src/components/MirrorSyncPanel.tsx`
Adicionar bloco de “Saúde do Espelho” com:
- status da inicialização
- quantidade de configs essenciais encontradas
- último commit sincronizado
- último sync real
- alerta se o espelho tiver código novo mas backend incompleto

### 5. Impedir falso positivo de “está tudo certo”
Quando o mirror não estiver pronto:
- mostrar erro explícito no painel
- bloquear mensagem de sucesso genérica
- orientar a rodar a inicialização do mirror antes de considerar concluído

## Banco de dados
Não vou repetir a migration anterior como solução principal.

Ajuste de banco só faz sentido se faltar estrutura no ambiente de teste. Pelo estado atual deste projeto:
- `get_maintenance_mode()` já existe
- a policy pública de branding já existe

Então o foco correto agora é:
- garantir inicialização do espelho
- validar prontidão do ambiente espelho/publicado
- não assumir que GitHub sync resolve backend

## Arquivos previstos
1. `supabase/functions/init-mirror/index.ts`
2. `supabase/functions/github-sync/index.ts`
3. `src/components/BackupSection.tsx`
4. `src/components/MirrorSyncPanel.tsx`

## Resultado esperado
- o sistema para de dizer que o espelho está pronto sem evidência real
- fica claro quando só os arquivos foram sincronizados
- o espelho recebe inicialização mínima obrigatória
- reduz drasticamente casos de tela branca por backend incompleto
- o painel passa a explicar melhor o que falta e com textos maiores

## Detalhes técnicos
```text
Problema real:
  Sync GitHub copia código
  ≠
  Publish / backend do espelho aplicar migrations e dados

Solução:
  1. Inicialização idempotente do mirror
  2. Health check do backend do mirror
  3. UI com diagnóstico claro
  4. Sem assumir sucesso sem validação
```
