

# Adicionar Seletor de Cargo no Painel Admin (Principal.tsx)

## Problema
Na tela de detalhes do usuário no Painel Principal, não existe um seletor de cargo (Admin, Suporte, Cliente, Usuario). O perfil do usuário (`/perfil/:slug`) já tem esse dropdown, mas o painel admin não.

## Solução
Adicionar um dropdown de cargo na seção de ações do usuário selecionado em `Principal.tsx`, similar ao que já existe em `UserProfile.tsx`.

### Alterações em `src/pages/Principal.tsx`

1. **Adicionar estado** para controle do dropdown de cargo:
   - `showRoleDropdown` (boolean)
   - `changingRole` (boolean)

2. **Adicionar a lista `AVAILABLE_ROLES`** (igual ao UserProfile):
   - Admin, Suporte, Cliente, Usuario

3. **Adicionar função `handleChangeRole`** que:
   - Remove o cargo antigo via `admin-toggle-role` (action: remove)
   - Adiciona o novo cargo via `admin-toggle-role` (action: add)
   - Atualiza o estado local do usuário selecionado
   - Protege o master admin (já existe `isTargetMaster`)

4. **Adicionar o dropdown na UI**, entre o botão "Ativar Revenda" e "Desativar":
   - Botão mostrando o cargo atual com ícone Shield + seta
   - Dropdown animado com as opções de cargo
   - Desabilitado para o master admin
   - Usa as mesmas cores por cargo do UserProfile

### Resultado
- Admin pode alterar o cargo de qualquer usuário direto no painel, sem precisar ir ao perfil
- Master admin continua protegido
- Consistência visual com o seletor do perfil

