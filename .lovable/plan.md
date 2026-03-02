

## Problema Identificado

O item **"Chat"** existe no menu lateral desktop (`menuItems`, linha 656), mas **não foi adicionado** à lista de itens do `MobileBottomNav` (linhas 1812-1819). Por isso, no mobile, não há como acessar o chat.

## Plano de Correção

### 1. Adicionar "Chat" ao `MobileBottomNav`

No arquivo `src/pages/RevendedorPainel.tsx`, adicionar o item do Chat na lista de itens passada ao `MobileBottomNav` (após "Status", linha 1818):

```
{ key: "chat", label: "Chat", icon: MessageCircle, color: "text-primary", animation: "float" }
```

Isso fará com que o Chat apareça no menu **"Mais"** (bottom sheet) no mobile, já que o `mainCount` é 4 e os itens extras vão para o menu expandido.

### 2. Verificar visibilidade no desktop

O menu lateral desktop já inclui o Chat. Nenhuma alteração necessária.

---

**Resultado**: O botão "Chat" aparecerá no menu "Mais" (⋯) da barra inferior no mobile, e ao tocar nele, abrirá a tela de chat normalmente.

