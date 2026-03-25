

# Proteger Admin e Principal com PIN de Segurança

## O que muda

Ao acessar `/admin` (AdminDashboard) ou `/principal` (Painel Principal), o sistema pedira o PIN de 4 digitos antes de mostrar qualquer conteudo. Sem o PIN correto, nada e exibido.

## Como funciona hoje

- O PinProtection ja existe e funciona bem
- Ele so e usado em **secoes especificas** dentro do Principal (aba API e Backup)
- O AdminDashboard **nao usa** PinProtection

## Plano de implementacao

### 1. Envolver AdminDashboard com PinProtection

**Arquivo**: `src/pages/AdminDashboard.tsx`

- Importar `PinProtection`
- Envolver todo o conteudo retornado pelo componente com `<PinProtection configKey="adminPin">...</PinProtection>`

### 2. Envolver Principal com PinProtection (nivel da pagina)

**Arquivo**: `src/pages/Principal.tsx`

- Mover o `<PinProtection>` para envolver **toda a pagina** em vez de apenas as abas individuais
- Remover os `<PinProtection>` internos das abas API e Backup (ja que a pagina inteira estara protegida)

### Resultado

- Ao navegar para `/admin` ou `/principal`, o usuario vera a tela de PIN
- Apos digitar o PIN correto, o conteudo e liberado normalmente
- O PIN e o mesmo ja configurado (`adminPin` no `system_config`)
- Se o PIN ainda nao foi criado, o sistema pede para criar um novo

