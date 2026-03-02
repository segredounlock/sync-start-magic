

## Plano: Implementar Efi Pay Gateway Corretamente com Certificado mTLS

### Contexto

A Efi Pay (antiga Gerencianet) exige **mTLS (mutual TLS)** com certificado `.p12` em **todas as requisicoes** da API PIX, tanto sandbox quanto producao. A implementacao atual tenta autenticar sem certificado, o que falha.

### Problema Principal

Deno (edge functions) **nao suporta mTLS nativo** via `fetch()` -- nao ha como enviar certificado de cliente em requisicoes HTTP. Isso e uma limitacao do runtime.

### Solucao: Proxy via Certificado Base64

1. O usuario faz upload do `.p12` no painel
2. O certificado e convertido para PEM e armazenado como base64 na `system_config`
3. A edge function usa `Deno.connectTls()` com o certificado para estabelecer conexao mTLS manualmente, ou alternativamente, usamos uma abordagem com o SDK da Efi que permite passar o certificado como buffer

**Porem**, `Deno.connectTls` nao suporta certificados de cliente (client certificates) -- apenas server certificates. Isso significa que **mTLS puro nao e possivel em Deno/Edge Functions**.

### Alternativa Viavel

A Efi Pay tem um endpoint alternativo **sem mTLS** para ambientes que nao suportam certificado de cliente:
- `https://pix.api.efipay.com.br` (com mTLS)
- `https://api-pix.gerencianet.com.br` (sem mTLS, usando skip_mtls_check para webhooks)

Na pratica, a autenticacao OAuth2 (Client ID + Secret) funciona **sem mTLS no sandbox**. Para producao, a solucao e:

### Alteracoes Planejadas

#### 1. Edge Function `create-pix/index.ts` -- Melhorar createEfiPay
- Usar URLs corretas para sandbox vs producao
- Melhorar tratamento de erros com mensagens claras
- Remover `devedor.cpf` com CPF falso (campo opcional)
- Corrigir formato do `txid` (26-35 chars alfanumericos)

#### 2. Edge Function nova `efi-setup/index.ts` -- Botao "Gerar Chave e Configurar Webhook"
- Registrar webhook na API da Efi Pay automaticamente
- Retornar status de configuracao

#### 3. UI `Principal.tsx` -- Adicionar funcionalidades faltantes
- **Upload de Certificado .p12**: campo de upload que converte o arquivo para base64 e salva em `system_config` (chave `efiPayCertBase64`)
- **Indicador de certificado configurado**: mostrar "Certificado configurado." em verde quando existe
- **Botao "Gerar Chave e Configurar Webhook"**: chama a edge function `efi-setup` para registrar o webhook
- Layout identico ao screenshot fornecido

#### 4. Webhook `pix-webhook/index.ts` -- Adicionar rota /webhook para Efi Pay
- A Efi Pay envia `POST /pix-webhook` com array `pix[]` -- ja implementado
- Adicionar suporte a skip_mtls_check para webhooks (Efi permite isso)

### Detalhes Tecnicos

**Limitacao importante**: Em producao, a Efi Pay exige mTLS para as APIs de cobranca. Como Deno nao suporta mTLS client certificates, temos duas opcoes:
1. Funcionar apenas em **sandbox** (sem mTLS)
2. Usar um **proxy externo** que faca a terminacao mTLS (fora do escopo Lovable)

Para o momento, a implementacao vai funcionar com sandbox e tentar producao (que pode funcionar dependendo da configuracao da conta Efi). O certificado sera armazenado para uso futuro caso o suporte mTLS seja adicionado.

### Arquivos a criar/editar
- `supabase/functions/efi-setup/index.ts` (novo)
- `supabase/functions/create-pix/index.ts` (editar createEfiPay)
- `src/pages/Principal.tsx` (editar secao Efi Pay config -- upload .p12, botao webhook, indicador)

