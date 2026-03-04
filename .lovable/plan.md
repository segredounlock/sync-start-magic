

## PWA Completo — App Instalável para iPhone e Android

O projeto já tem um `manifest.webmanifest` básico e um service worker de push (`sw-push.js`), mas falta a configuração completa de PWA com cache offline, prompt de instalação e ícones adequados.

### O que será feito

1. **Instalar `vite-plugin-pwa`** — Plugin que gera automaticamente o service worker com cache offline, precaching de assets e integração com o manifest.

2. **Configurar `vite.config.ts`** — Adicionar o plugin PWA com:
   - Manifest completo (nome, ícones, cores, display standalone)
   - Workbox para precaching de todos os assets do build
   - `navigateFallbackDenylist` com `/~oauth` para não quebrar autenticação
   - Manter o service worker de push existente (`sw-push.js`) separado

3. **Atualizar `manifest.webmanifest`** — Será gerado automaticamente pelo plugin, mas garantir ícones corretos (192x192 e 512x512) e `"id": "/"` para consistência.

4. **Criar página `/instalar`** — Tela dedicada com instruções visuais para instalar o app:
   - Detectar se já está instalado (display-mode: standalone)
   - Botão de instalar que dispara o `beforeinstallprompt` (Android/Chrome)
   - Instruções para iPhone (Compartilhar → Adicionar à Tela de Início)
   - Mostrar que já está instalado quando aplicável

5. **Registrar ambos service workers** — O SW do vite-plugin-pwa (cache/offline) e o `sw-push.js` (notificações) precisam coexistir. O plugin gerará o SW principal e o push SW será registrado separadamente no `main.tsx`.

6. **Atualizar `index.html`** — Adicionar meta tags mobile otimizadas (`apple-mobile-web-app-capable` já existe, adicionar `apple-touch-startup-image` se necessário).

### Arquivos a criar/editar

| Arquivo | Ação |
|---|---|
| `package.json` | Adicionar `vite-plugin-pwa` |
| `vite.config.ts` | Configurar VitePWA plugin |
| `src/pages/InstallApp.tsx` | Página de instalação com instruções |
| `src/App.tsx` | Adicionar rota `/instalar` |
| `src/main.tsx` | Registrar SW de push separadamente |
| `index.html` | Remover link manual do manifest (plugin gera) |

### Resultado
O app poderá ser instalado na tela inicial de qualquer celular (iPhone ou Android), funcionar offline, e manter as notificações push existentes.

