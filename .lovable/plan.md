

## Corrigir NaN% e adicionar efeito de desintegração na logo

### Problema do NaN%
O `Math.round(progress)` está mostrando NaN. Isso pode acontecer se o estado `progress` receber um valor `NaN` durante o cálculo. Vou adicionar uma proteção `|| 0` para garantir que nunca mostre NaN.

### Efeito de desintegração da logo (Canvas + JS)
A ideia é criar um efeito estilo "Thanos snap" onde a logo se desintegra em partículas:

1. Quando a logo carrega, ela é desenhada num canvas oculto
2. Os pixels da imagem são amostrados e convertidos em partículas coloridas
3. Após uns 7 segundos, as partículas começam a se dispersar/desintegrar
4. As partículas voam para fora com física realista (gravidade, vento, fade)

### Mudanças

**Arquivo:** `src/components/SplashScreen.tsx`

- Corrigir o NaN: `Math.round(progress || 0)`
- Adicionar um segundo canvas dedicado ao efeito de desintegração
- Quando `logoLoaded = true`, desenhar a imagem num canvas offscreen, amostrar pixels em grid (ex: cada 3px), criar partículas com a cor real de cada pixel
- Nos primeiros ~7s: partículas ficam na posição original (logo visível como mosaico)
- Aos ~7s: trigger da desintegração — partículas ganham velocidade aleatória e se dispersam com fade out
- A logo `<img>` original fica escondida quando o canvas de partículas está ativo

### Resultado
- Sem NaN% na tela
- Logo aparece normalmente, depois se desintegra em partículas coloridas de forma cinematográfica
- Tudo feito com Canvas API + requestAnimationFrame, sem libs extras

