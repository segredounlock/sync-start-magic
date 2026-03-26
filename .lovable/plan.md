
# Corrigir 404 no Espelho Publicado

## Diagnóstico
O problema não parece ser `window.location.origin` nem o reconhecimento de domínio.

Pelo código e pela verificação da rota atual:
- o app usa `BrowserRouter`
- existe rota para `/`, `/login`, `/painel`, `/admin`, etc.
- **não existe rota `/index`**
- quando o espelho/publicação abre em `/index`, o React cai no `NotFound` e mostra exatamente a tela do print

Ou seja: o espelho está chegando na aplicação por uma URL legada/inválida (`/index`) e o app hoje trata isso como 404.

## Implementação proposta

### 1. Adicionar redirecionamento de compatibilidade
No `src/AppRoot.tsx`:
- criar uma rota explícita `path="/index"` redirecionando para `/`
- opcionalmente também adicionar alias antigo `path="/auth"` redirecionando para `/login`, para evitar outros links quebrados

Exemplo de comportamento:
```text
/index  -> /
/auth   -> /login
```

### 2. Normalizar entrada por links antigos
Ainda no roteamento principal:
- manter `/` como rota canônica
- garantir que links antigos, bookmarks e URLs do espelho não parem em 404 se forem apenas aliases históricos

### 3. Revisar pontos que possam gerar URLs antigas
Fazer uma varredura rápida em:
- redirects
- links públicos
- qualquer lugar que monte URL manualmente

Objetivo:
- evitar que o sistema continue emitindo `/index` em algum fluxo antigo

### 4. Validar no espelho publicado
Depois da implementação, testar estes cenários:
- abrir domínio do espelho em `/`
- abrir manualmente `/index`
- abrir `/login`
- verificar que `/index` redireciona corretamente e não mostra mais 404

## Arquivos
- `src/AppRoot.tsx` — adicionar aliases/redirecionamentos
- revisão pontual de links/URLs legadas, se houver referência indireta a `/index`

## Resultado esperado
- o espelho deixa de mostrar 404 ao abrir em `/index`
- links antigos continuam funcionando
- o domínio dinâmico continua normal; o problema é de rota, não de `window.location`
