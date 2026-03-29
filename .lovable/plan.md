

## Corrigir splash travando em 0% no preview (React StrictMode)

### Causa raiz
O `React.StrictMode` (em `main.tsx`) desmonta e remonta componentes no dev/preview. Quando o `SplashScreen` remonta, o `useState(0)` e o `useEffect` do progresso reiniciam do zero, criando loop infinito de 0%.

### Solução
Usar **variáveis no escopo do módulo** (fora do componente) que sobrevivem ao remount do StrictMode.

### Mudanças em `src/components/SplashScreen.tsx`

1. Adicionar no topo do arquivo (fora do componente, após os imports):
```ts
let moduleProgress = 0;
let moduleStarted = false;
let moduleDisintegrated = false;
```

2. Alterar os `useState` para usar os valores do módulo:
```ts
const [progress, setProgress] = useState(moduleProgress);
const [disintegrating, setDisintegrating] = useState(moduleDisintegrated);
```

3. No `useEffect` do progresso (linhas 99-116), adicionar guard com `moduleStarted`:
```ts
useEffect(() => {
  if (moduleStarted) return; // Não reiniciar se já rodou
  moduleStarted = true;
  const DURATION = 10_000; const INTERVAL = 150;
  const TOTAL = DURATION / INTERVAL; let tick = 0;
  const iv = setInterval(() => {
    tick++;
    const eased = 1 - Math.pow(1 - tick / TOTAL, 2.5);
    const value = Math.min(100, eased * 100);
    moduleProgress = value; // Salvar no módulo
    setProgress(value);
    if (value >= 99.9 && !moduleDisintegrated) {
      moduleDisintegrated = true;
      setDisintegrating(true);
    }
    if (tick >= TOTAL) clearInterval(iv);
  }, INTERVAL);
  return () => clearInterval(iv);
}, []);
```

### Resultado
- No preview (StrictMode): progresso não reseta, splash funciona normalmente
- No site publicado: sem mudança de comportamento
- Explosão de partículas continua sincronizada com 100%

