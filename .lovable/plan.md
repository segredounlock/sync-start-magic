

# Plano: Templates de Broadcast por Operadora Lenta

## O que será feito
Adicionar templates individuais de aviso de lentidão para cada operadora (TIM, CLARO, VIVO) na lista de templates do `BroadcastForm.tsx`, permitindo notificar rapidamente os usuários quando uma operadora específica estiver com processamento lento.

## Alterações

### `src/components/BroadcastForm.tsx`
Adicionar 3 novos templates ao array `TEMPLATES`:

- **TIM Lenta** — cor vermelha (`bg-red-600/80`), emoji ⏳, mensagem informando lentidão específica da TIM
- **CLARO Lenta** — cor vermelha (`bg-red-600/80`), emoji ⏳, mensagem informando lentidão específica da CLARO  
- **VIVO Lenta** — cor purple (`bg-purple-600/80`), emoji ⏳, mensagem informando lentidão específica da VIVO

Cada template terá uma mensagem padrão como:
```
⏳ A operadora [NOME] está apresentando lentidão no processamento das recargas.

⚠️ Suas recargas serão processadas normalmente, porém com um tempo maior que o habitual.

🔄 Estamos monitorando a situação e atualizaremos assim que normalizar.

📞 Em caso de dúvidas, entre em contato com o suporte.
```

O grid de templates passará de `grid-cols-2` para acomodar os novos itens mantendo o layout responsivo.

### Arquivo alterado
- `src/components/BroadcastForm.tsx`

