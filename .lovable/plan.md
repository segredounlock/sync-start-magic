

# Suporte a Tema Claro no Telegram Mini App com Toggle

## O que será feito

Adicionar um toggle de tema (claro/escuro) na seção **Conta** do Mini App, similar ao toggle do site (imagem de referência), permitindo ao usuário alternar manualmente entre os temas. O tema escolhido será salvo no `localStorage`.

## Mudanças

### 1. Refatorar `useTelegramTheme` para aceitar override manual

Atualmente o hook detecta o tema do Telegram automaticamente. Será convertido para:
- Aceitar um parâmetro `themeOverride: "light" | "dark" | "auto"`
- Quando `"auto"`, usar a lógica atual (detectar do Telegram)
- Quando `"light"` ou `"dark"`, forçar o tema escolhido
- Persistir a escolha em `localStorage` com chave `tg-theme-preference`

### 2. Adicionar estado de tema no componente principal

No `TelegramMiniApp`, adicionar:
- Estado `themePreference` (`"auto" | "light" | "dark"`) inicializado do `localStorage`
- Função `toggleTheme` que alterna entre `light` ↔ `dark`
- Passar o override para `useTelegramTheme`

### 3. Criar toggle inline na seção Conta

Adicionar um toggle estilo switch (como o da imagem de referência com Sun/Moon) entre o card de "Telegram Vinculado" e os saldos, usando os tokens semânticos `st.*` existentes. Ícones: `Sun` e `Moon` do lucide-react (já importável).

### 4. Atualizar `useTelegramTheme` para retornar o `isDark` atual

Para que o toggle saiba qual ícone mostrar.

## Arquivos alterados

- `src/pages/TelegramMiniApp.tsx` — refatorar hook, adicionar estado + toggle na seção Conta

