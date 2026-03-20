# 💳 Sistema de Pagamentos

## Fluxo de Depósito PIX

```
1. Usuário solicita depósito (valor + saldo tipo)
2. Frontend chama create-pix edge function
3. Edge function:
   a. Verifica sessão e calcula taxa
   b. Cria transaction (status: pending)
   c. Chama gateway selecionado
   d. Retorna QR Code (base64 + copia-cola)
4. Frontend exibe QR Code
5. Monitor em background verifica status (polling)
6. pix-webhook recebe confirmação do gateway
7. Edge function:
   a. Valida pagamento
   b. Credita saldo (increment_saldo)
   c. Atualiza transaction (status: completed)
   d. Notifica admin
```

## Gateways Suportados

### Mercado Pago
- **Config:** `mercadoPagoKeyProd`, `mercadoPagoKeyTest`, `mercadoPagoModo`
- **API:** REST v1/payments
- **Webhook:** Notificação via IPN

### PushinPay
- **Config:** `pushinPayToken`
- **API:** REST /api/pix/cashIn
- **Webhook:** POST com status do pagamento

### VirtualPay
- **Config:** `virtualPayClientId`, `virtualPayClientSecret`, `virtualPayPlatformId`
- **API:** OAuth2 + REST
- **Webhook:** Callback URL

### EfiPay (Gerencianet)
- **Config:** `efiPayClientId`, `efiPayClientSecret`, `efiPayPixKey`, `efiPaySandbox`
- **API:** OAuth2 + REST /v2/cob
- **Certificado:** Upload via `efi-setup` edge function

### MisticPay
- **Config:** `misticPayClientId`, `misticPayClientSecret`
- **API:** REST

## Taxas de Depósito

### Global
Configurado em `system_config`:
- `taxaTipo`: "fixo" ou "percentual"
- `taxaValor`: valor da taxa

### Por Revendedor
Configurado em `reseller_deposit_fees`:
- `fee_type`: "fixo" ou "percentual"
- `fee_value`: valor da taxa

### Prioridade
1. Taxa do revendedor (se existir)
2. Taxa global (fallback)

## Expiração de Depósitos

A edge function `expire-pending-deposits` expira depósitos pendentes há mais de 45 minutos, alterando status para "expired".

## Tabela `transactions`

| Coluna | Descrição |
|--------|-----------|
| `user_id` | Usuário que fez o depósito |
| `amount` | Valor do depósito |
| `type` | "deposit" |
| `status` | pending → completed/expired |
| `payment_id` | ID do gateway |
| `module` | Nome do gateway usado |
| `metadata` | QR code, copia-cola, taxa, etc. |
