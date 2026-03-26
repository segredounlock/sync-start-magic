

# Inicializar Dados Essenciais no Espelho

## Situação
O espelho tem schema correto (migrations aplicadas) mas tabelas críticas vazias. O sistema não funciona sem `system_config` e `operadoras`.

## Abordagem Recomendada: Restauração Segura

O sistema já tem a funcionalidade de **Restauração Segura** implementada. A forma mais rápida e confiável:

1. **No projeto ORIGEM** (este): Exportar backup completo (botão "Exportar Backup")
2. **No projeto ESPELHO**: Usar "Restauração Segura" com o ZIP exportado

Isso popula automaticamente `system_config`, `operadoras`, `pricing_rules`, `bot_settings` e todas as demais tabelas — sem sobrescrever usuários nem configs já existentes no espelho.

## Alternativa: Script de Inicialização

Caso prefira inserir apenas o mínimo manualmente no espelho, criar um botão **"Inicializar Espelho"** na seção Backup que:

### Step 1 — Inserir configs essenciais
Chama uma edge function que insere as ~15 keys em `system_config` com valores default (usando `ON CONFLICT DO NOTHING`).

### Step 2 — Sincronizar catálogo
Invoca `sync-catalog` para popular `operadoras` + `pricing_rules` via API (requer `apiKey` configurada antes).

### Step 3 — Gerar referral_code do admin
Atualiza o perfil admin existente para ter um `referral_code` se estiver vazio.

## Detalhes Técnicos

### Nova edge function `init-mirror/index.ts`
- Recebe lista de configs default via body ou usa hardcoded
- Insere em `system_config` com `ON CONFLICT (key) DO NOTHING`
- Chama `sync-catalog` internamente se `apiKey` existir
- Gera `referral_code` para perfis sem código

### Alteração em `BackupSection.tsx`
- Novo botão "Inicializar Espelho" na aba GitHub/Mirror
- Visível apenas quando diagnóstico detecta `system_config` vazio
- Chama a edge function e mostra resultado

### Configs default inseridas
| Key | Valor Default |
|-----|--------------|
| siteTitle | Sistema de Recargas |
| activeGateway | none |
| taxaTipo / taxaValor | fixo / 0 |
| masterPin | 1234 |
| maintenanceMode | false |
| chat_enabled | true |
| supportEnabled | true |
| salesToolsEnabled | true |
| requireReferralCode | false |
| defaultMarginEnabled | false |
| defaultMarginType / Value | fixo / 0 |
| chat_new_conv_filter | all |

## Recomendação

**Usar Restauração Segura** é mais completo — traz todos os dados do origem de uma vez. O botão "Inicializar Espelho" seria útil como fallback para configuração mínima sem precisar de um backup.

Qual abordagem prefere?

