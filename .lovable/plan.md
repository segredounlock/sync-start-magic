

## Diagnóstico: Página recarrega ao voltar de outra aba

### Causa raiz

A configuração do **PWA (Service Worker)** no `vite.config.ts` está com:

- `registerType: "autoUpdate"` — recarrega automaticamente quando detecta nova versão
- `skipWaiting: true` + `clientsClaim: true` — ativa o novo SW imediatamente sem esperar

Quando você troca de aba e volta, o navegador verifica se há um novo Service Worker. Como cada deploy gera um novo SW, ele encontra a atualização e **recarrega a página automaticamente** sem perguntar.

### Solução

1. **Mudar `registerType` para `"prompt"`** no `vite.config.ts` — em vez de recarregar sozinho, vai mostrar um aviso discreto ("Nova versão disponível") com um botão para atualizar quando o usuário quiser.

2. **Criar um componente `UpdatePrompt`** que aparece como um toast/banner pequeno no topo quando há atualização disponível, com botão "Atualizar agora".

3. **Remover `skipWaiting: true`** da config do workbox — o novo SW só ativa quando o usuário aceitar.

### Resultado esperado

- Trocar de aba e voltar **não recarrega mais** a página
- Quando houver atualização real, aparece um aviso discreto
- O usuário decide quando atualizar

