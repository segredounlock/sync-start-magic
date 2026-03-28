

# Blindagem Total Anti-Bypass do Sistema de Licenciamento

## Vulnerabilidades identificadas

Analisei o codigo atual e encontrei **5 vetores de bypass** que precisam ser fechados:

1. **localStorage manipulavel**: Alguem pode abrir o DevTools e alterar `license_validation_cache` para `{valid: true}` ou forjar `license_crypto_proof`
2. **Crypto proof sem segredo**: A funcao `createLocalLicenseProof` usa SHA-256 puro sem chave secreta -- qualquer pessoa pode regenerar o hash com dados falsos
3. **Bypass por masterAdminId**: Na linha 126 do LicenseGate, se alguem for o primeiro usuario do espelho (vira masterAdmin via trigger), o sistema libera sem licenca
4. **Sem validacao server-side**: Toda a protecao e client-side (React). Se alguem modificar o JS ou usar DevTools, passa direto
5. **Cache de 6h sem integridade**: O cache local nao tem assinatura, pode ser fabricado

## Solucao: Protecao em 4 camadas

```text
Camada 1: Edge Function (server-side) -- impossivel de burlar
Camada 2: RLS Policy no banco -- bloqueia queries sem licenca
Camada 3: LicenseGate hardened -- anti-tampering no frontend
Camada 4: Crypto proof com HMAC -- assinado por segredo do servidor
```

## O que sera feito

### 1. Nova Edge Function `license-check-server` (validacao server-side)
- Roda no backend do espelho, nao no navegador
- Verifica se `license_key` existe no `system_config` do espelho
- Chama o servidor principal para validar
- Retorna um token de sessao curta (1h) assinado com HMAC
- Impossivel de burlar via DevTools

### 2. Remover bypass por masterAdminId no LicenseGate
- O masterAdmin do espelho NAO deve pular a licenca
- Unico bypass: dominio `recargasbrasill.com`
- O masterAdmin continua tendo acesso ao painel `/principal`, mas precisa de licenca ativa

### 3. Crypto proof com HMAC (chave derivada do servidor)
- Na instalacao, o servidor gera um `install_secret` unico (UUID aleatorio) salvo em `system_config`
- A prova local usa HMAC-SHA256 com esse segredo, nao SHA-256 puro
- Sem o segredo correto, e impossivel forjar a prova
- O segredo muda a cada revalidacao

### 4. Anti-tampering no LicenseGate
- Detecta se o cache foi modificado manualmente (checksum de integridade)
- Se detectar manipulacao, invalida e forca revalidacao no servidor
- Timer interno criptografico que nao pode ser pausado
- Bloqueia se `license_check_server` retornar invalido

### 5. RLS policy server-side (camada extra)
- Criar func