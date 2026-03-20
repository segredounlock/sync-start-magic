

# Organizar Log de Auditoria

## Problema
O componente `AuditTab.tsx` está incompleto — faltam labels para muitas ações do sistema (antifraude, saques, chat, badges, etc.) e os detalhes são exibidos como JSON bruto sem formatação.

## Plano

### 1. Adicionar todas as ações faltantes ao ACTION_LABELS
Ações que faltam no mapa atual:
- `new_device_detected` — Novo Dispositivo (azul/info)
- `banned_device_login_blocked` — Login Bloqueado (vermelho)
- `rate_limited_login` — Rate Limit (laranja)
- `ban_user_devices` — Banir Dispositivos (vermelho)
- `ban_device` — Banir Device (vermelho)
- `unban_device` — Desbanir Device (verde)
- `reban_device` — Rebanir Device (amarelo)
- `delete_ban` — Excluir Ban (cinza)
- `saque_approved` / `saque_rejected` — Saque Aprovado/Rejeitado
- `set_badge` / `remove_badge` — já existem
- `saldo_add` / `saldo_remove` / `saldo_set` — Saldo
- `block_room` / `unblock_room` — já existem
- `set_room_public` / `set_room_private` — Privacidade de Sala
- `auto_collect_debt` — Cobrança Automática

Adicionar também ao TARGET_LABELS:
- `antifraud`, `device`, `chat_conversation`, `user_role`, `transaction`

### 2. Formatar detalhes de forma legível
Em vez de exibir o JSON bruto, criar uma função que formata os campos com labels amigáveis:
- `user_nome` → "Usuário"
- `ip_address` → "IP"
- `fingerprint_hash` → "Fingerprint"
- `reason` → "Motivo"
- `email` → "E-mail"
- `platform` → "Plataforma"
- `anterior` → "Antes"
- `novo` → "Depois"
- Ocultar campos muito longos (user_agent truncado)

### 3. Adicionar ícones por categoria
Usar ícones diferentes para cada tipo de ação (Shield para segurança, DollarSign para saldo, MessageSquare para chat, etc.)

## Arquivo alterado
- `src/components/AuditTab.tsx` — expandir labels, formatar detalhes, adicionar ícones

