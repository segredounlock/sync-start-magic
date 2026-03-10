

# Auditoria de Segurança — Resultados e Plano de Correção

## Vulnerabilidades Encontradas

### CRÍTICAS (3)

**1. Escalação de Privilégio via verification_badge (PRIVILEGE_ESCALATION)**
Qualquer usuário autenticado pode editar seu próprio perfil e definir `verification_badge` com qualquer valor. Isso concede poderes de editar/deletar mensagens de QUALQUER usuário no chat, pois as policies `Badge holders can update/delete messages` confiam nesse campo.

**Correção:** Adicionar `WITH CHECK` na policy `Users can update own profile` para impedir que o usuário altere `verification_badge` por conta própria (só admin pode).

**2. Dados Sensíveis Expostos — Profiles (EXPOSED_SENSITIVE_DATA)**
A policy `Authenticated can view any profile` expõe **todas** as colunas (email, telefone, whatsapp_number, telegram_bot_token) para qualquer usuário logado. O `telegram_bot_token` é uma credencial secreta.

**Correção:** Criar uma view pública com apenas colunas não-sensíveis (id, nome, avatar_url, slug, bio, verification_badge, store_name) e restringir a policy de SELECT completo ao próprio usuário e admins.

**3. Grupos de Chat Abertos (PUBLIC_USER_DATA)**
Qualquer autenticado pode ler TODAS as conversas de grupo, mensagens, membros, reações e recibos de leitura — sem ser membro. A coluna `is_private` existe mas nunca é verificada nas policies.

**Correção:** Adicionar verificação de membership (`EXISTS in chat_members`) nas policies de SELECT para conversas do tipo `group`.

### ALERTAS (4)

**4. Leaked Password Protection desativado**
O sistema não verifica se senhas escolhidas pelos usuários estão em bases de dados vazadas.

**Correção:** Ativar via `configure_auth`.

**5. Custos internos expostos — pricing_rules**
A tabela `pricing_rules` com coluna `custo` (custo interno) é visível para todos os autenticados, revelando margens do negócio.

**Correção:** Restringir SELECT a admins, ou criar view sem a coluna `custo`.

**6. Votos de enquete públicos — poll_votes**
Qualquer autenticado vê quem votou em qual opção.

**Correção:** Restringir SELECT ao próprio usuário.

**7. Grafo social completo exposto — follows**
A policy `USING: true` permite que qualquer autenticado veja todos os relacionamentos de follow do sistema.

**Correção:** Restringir a `follower_id = auth.uid() OR following_id = auth.uid()`.

### PROBLEMAS ADICIONAIS NO CÓDIGO

**8. Senha salva em localStorage (Auth.tsx, linha 41)**
```typescript
const [password, setPassword] = useState(() => localStorage.getItem("rememberedPass") || "");
```
Senhas em texto claro no localStorage são acessíveis via XSS ou acesso físico ao dispositivo. O "lembrar-me" deveria salvar apenas o email, NUNCA a senha.

**Correção:** Remover `rememberedPass` do localStorage. Manter apenas `rememberedEmail`.

**9. Proteção brute-force apenas client-side (Auth.tsx, linhas 33-34)**
O cooldown de 5 tentativas / 60s é implementado apenas no frontend com `useState`. Um atacante pode ignorar isso completamente chamando a API diretamente. A proteção real vem do rate limiting do backend de autenticação, mas o client-side não adiciona segurança real.

**Nota:** Isso é defesa em profundidade aceitável — o backend já tem rate limiting. Sem alteração necessária, mas importante saber.

### Pontos positivos confirmados
- Sem uso de `dangerouslySetInnerHTML` (proteção XSS)
- Sem uso de `eval()` (proteção contra injeção JS)
- Sem verificação de roles via localStorage (todas via banco)
- Sem URLs construídas com concatenação de input do usuário
- Edge Functions usam service_role_key apenas server-side

---

## Plano de Correção (6 alterações)

| # | Tipo | Arquivo/Local | Ação |
|---|---|---|---|
| 1 | Migration SQL | RLS policy profiles | Criar policy restritiva: users só podem update próprio perfil SEM alterar `verification_badge` |
| 2 | Migration SQL | RLS policy profiles | Substituir `Authenticated can view any profile` por view/policy que oculta colunas sensíveis |
| 3 | Migration SQL | RLS chat_* | Adicionar check `EXISTS(chat_members)` para type='group' em conversations, messages, reactions, reads |
| 4 | Migration SQL | RLS pricing_rules | Restringir SELECT a admins apenas |
| 5 | Migration SQL | RLS poll_votes + follows | Corrigir policies de SELECT |
| 6 | Código | src/pages/Auth.tsx | Remover armazenamento de senha no localStorage |

Todas as correções são retrocompatíveis — nenhuma funcionalidade existente será quebrada, apenas o acesso indevido será bloqueado.

