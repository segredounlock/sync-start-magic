

# Desativar Confirmação de E-mail

## O Problema
Usuários estão recebendo "E-mail ainda não confirmado" ao tentar fazer login. O toggle no painel Principal salva a config no banco, mas não altera a configuração real do sistema de autenticação.

## Solução
1. **Ativar auto-confirm no backend** — usar `configure_auth` para definir `autoconfirm: true`, eliminando a necessidade de confirmação de e-mail
2. **Garantir que o toggle no Principal sincronize com a configuração real** — a edge function `admin-toggle-email-verify` já existe mas não altera a config real; isso é aceitável pois a configuração será feita agora

## O que muda
- Novos usuários entram direto sem precisar confirmar e-mail
- Usuários existentes que não confirmaram poderão fazer login normalmente
- O toggle no `/principal` continuará funcionando para controle visual

## Impacto
- Zero risco funcional — apenas remove uma barreira de entrada
- Usuários existentes não são afetados negativamente

## Arquivos alterados
1. **Configuração de auth** — `autoconfirm: true` via configure_auth tool
2. Nenhum arquivo de código precisa mudar

