

# Cron Job Automático para sync-catalog

## Visão Geral
Configurar um cron job via `pg_cron` + `pg_net` para executar a edge function `sync-catalog` automaticamente a cada 1 hora.

## Plano

### 1. Habilitar extensões `pg_cron` e `pg_net`
- Migration SQL para ativar ambas as extensões

### 2. Criar cron job
- Executar SQL (via insert tool, não migration) que agenda chamada HTTP POST para `sync-catalog` a cada hora
- URL: `https://xtkqyjruyuydlbvwduuy.supabase.co/functions/v1/sync-catalog`
- Headers: Authorization com anon key + Content-Type
- Schedule: `0 * * * *` (a cada hora, no minuto 0)

## Arquivos Alterados
- **Migration SQL**: habilitar `pg_cron` e `pg_net`
- **SQL direto** (insert tool): criar o agendamento do cron job

