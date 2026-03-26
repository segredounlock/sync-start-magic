

# Proteger menu Antifraude com PIN de 4 dígitos

## Problema
O menu "Antifraude" no Painel Principal está acessível sem proteção adicional. Dados forenses sensíveis (fingerprints, selfies, IPs) devem exigir PIN.

## Solução
Envolver o `<AntifraudSection />` com o componente `<PinProtection>` que já existe no sistema — o mesmo usado para proteger outras áreas sensíveis.

## Alteração

**`src/pages/Principal.tsx`** — linha ~4945:

```tsx
// De:
{view === "antifraude" && <Suspense fallback={<SkeletonCard />}><AntifraudSection /></Suspense>}

// Para:
{view === "antifraude" && (
  <Suspense fallback={<SkeletonCard />}>
    <PinProtection configKey="adminPin">
      <AntifraudSection />
    </PinProtection>
  </Suspense>
)}
```

Adicionar import do `PinProtection` no topo do arquivo (se ainda não existir).

## Resultado
- Ao clicar em "Antifraude", o sistema pede o PIN de 4 dígitos antes de mostrar os dados
- Usa o mesmo PIN já configurado (`adminPin` no `system_config`)
- Sem mudança no fluxo — após digitar o PIN correto, o conteúdo aparece normalmente

