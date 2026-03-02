

## Plano: Simplificar animação pós-login — usar apenas Splash Screen

### O que muda

Remover toda a sequência complexa de fases (`success` → `card-exit` → `logo-exit` → `done`) e substituir por uma transição simples:

1. Login bem-sucedido → exibir o **SplashScreen** (que já existe com logo + dots animados + "Carregando...")
2. Após ~1.5s no splash → redirecionar para o destino

### Alterações em `src/pages/Auth.tsx`

- **Simplificar `LoginPhase`** para apenas `"form" | "forgot" | "splash" | "done"`
- **No `handleSubmit`**: após login com sucesso, setar `phase = "splash"` em vez de `"success"`
- **Adicionar timer**: após 1.5s na fase `"splash"`, setar `phase = "done"` que faz o `Navigate`
- **Remover**: todo o bloco de `AnimatePresence` do logo com rotação 720°, o overlay de success com checkmark, e as transições `card-exit`/`logo-exit`
- **Na fase `"splash"`**: renderizar o componente `<SplashScreen />` já existente (tela cheia com logo, dots e "Carregando...")

### Resultado

Login → card desaparece suavemente → tela de splash com logo centralizado e animação de pontos → redirecionamento. Mais limpo e moderno.

