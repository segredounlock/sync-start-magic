

# Corrigir Nome do App PWA + Forçar Atualização

## Problema identificado

1. **Nome errado no manifest**: O `vite.config.ts` tem `name: "Sistema de Recargas"` e `short_name: "Recargas"` — deveria ser `"Recargas Brasil"` em ambos
2. **Logo com erro de digitação na imagem**: A imagem do ícone do app (screenshot) mostra "Reecargas" com dois "e" — isso é da imagem/favicon, não do código. Preciso verificar o `favicon.png`
3. **Atualização para quem já instalou**: O Service Worker precisa forçar a atualização do manifest para que o nome mude em dispositivos que já instalaram

## Alterações

### 1. `vite.config.ts` — Corrigir nome no manifest
```
name: "Recargas Brasil"
short_name: "Recargas Brasil"  
description: "Sistema de recargas de celular para revendedores"
```

### 2. `index.html` — Corrigir título e meta tags
- `<title>Recargas Brasil</title>`
- `og:title` → "Recargas Brasil"
- `twitter:title` → "Recargas Brasil"

### 3. `public/sw-push.js` — Forçar atualização do manifest
- Adicionar lógica no `activate` event para limpar caches antigos e forçar o navegador a re-processar o manifest atualizado
- Usar `self.skipWaiting()` + `clients.claim()` para aplicar imediatamente

### 4. Favicon/Ícone
- O ícone mostrado no screenshot com "Reecargas" (dois e) parece ser a imagem do `favicon.png`. Verificar e, se necessário, o usuário precisará fornecer uma imagem corrigida, pois não é possível editar imagens PNG pelo código

## Limitação importante
- **iOS**: O nome do ícone na home screen é definido no momento da instalação e **não atualiza automaticamente** mesmo com novo manifest — o usuário precisaria remover e reinstalar
- **Android/Chrome**: O nome pode ser atualizado automaticamente pelo Chrome quando detecta mudança no manifest (WebAPK update)

