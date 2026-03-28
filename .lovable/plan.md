

# Garantir que o Sistema de Licença Funcione no Espelho

## Diagnóstico
O código do `LicenseGate.tsx` já vai pro espelho via sync. Porém, a lógica atual de bypass tem uma falha:

```
Se masterAdminId existe E license_key NÃO existe → bypass (assume que é o master)
```

No espelho, se o `masterAdminId` foi configurado pelo `init-mirror` ou pelo trigger `handle_new_user`, e o `license_key` ainda não foi inserido, o espelho **pula a validação** — ou seja, funciona sem licença.

## Solução

### 1. Corrigir a lógica de bypass no LicenseGate.tsx
Mudar a detecção de "sou o master" para algo mais seguro. Em vez de checar apenas se `license_key` não existe, verificar se o **usuário logado É o masterAdminId** do servidor:

```
Se o user logado === masterAdminId → bypass (é o dono do master)
Se não tem license_key → bloquear (espelho sem licença)
```

Isso garante que:
- No SEU servidor: você (masterAdmin) entra sem licença
- No espelho: mesmo que o primeiro user vire masterAdmin lá, ele precisa de licença porque o LicenseGate vai checar contra o servidor PRINCIPAL

### 2. Atualizar o init-mirror para NÃO seedar masterAdminId
O `init-mirror` atualmente pode estar inserindo `masterAdminId` no espelho. Isso confunde o LicenseGate. Devemos garantir que o `init-mirror` **não** insira essa chave, deixando o trigger `handle_new_user` criar o master do espelho.

### 3. Adicionar license_master_url na documentação
Documentar que o espelho precisa ter:
- `license_key` em `system_config` (a chave gerada por você)
- `license_master_url` em `system_config` (URL do seu backend principal)

## Arquivos alterados
1. `src/components/LicenseGate.tsx` — corrigir lógica de bypass
2. `supabase/functions/init-mirror/index.ts` — verificar seeds
3. `documentation/MIGRACAO.md` — instruções para configurar licença no espelho

## Impacto
- Servidor principal: zero mudança, continua funcionando normalmente
- Espelhos: passam a ser obrigados a ter licença válida configurada

