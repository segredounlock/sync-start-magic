

# Adicionar Bypass por Dominio Principal no LicenseGate

## O que muda
O dominio `recargasbrasill.com` (e seus subdomínios) será reconhecido automaticamente como servidor principal e nunca precisará de licença — independente de quem estiver logado.

## Como funciona hoje
O bypass atual só funciona se o **usuário logado for o masterAdminId**. Outros usuários no seu servidor principal ainda passam pela validação de licença (que funciona porque não tem `license_key` configurada e o status vira `no_license`).

## Solução
Adicionar uma checagem de domínio **antes** de qualquer validação no `LicenseGate.tsx`:

```
Se hostname contém "recargasbrasill.com" → bypass direto (status = "master")
Senão → segue fluxo normal (masterAdmin check → license check → etc)
```

Isso garante:
- **recargasbrasill.com** — acesso livre sempre, para todos os usuários
- **Qualquer outro domínio** (espelhos) — precisa de licença válida
- O masterAdminId continua funcionando como bypass extra (para caso você acesse de outro domínio)

## Segurança
- Esse código **vai para os espelhos** via sync, mas como o espelho roda em outro domínio, a checagem não libera nada para eles
- O domínio é verificado via `window.location.hostname` que não pode ser falsificado pelo usuário

## Arquivo alterado
1. `src/components/LicenseGate.tsx` — adicionar lista de domínios principais e checagem no início do `validate()`

## Detalhe técnico
```typescript
const MASTER_DOMAINS = ["recargasbrasill.com"];

// No início do validate():
const hostname = window.location.hostname.toLowerCase();
const isMasterDomain = MASTER_DOMAINS.some(d => 
  hostname === d || hostname.endsWith(`.${d}`)
);
if (isMasterDomain) {
  setStatus("master");
  return;
}
```

## Impacto
- Servidor principal: sempre livre, sem nenhuma validação
- Espelhos: sem alteração, continuam precisando de licença

