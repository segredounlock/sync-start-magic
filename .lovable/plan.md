

## Diagnóstico

Na tela de "E-mail enviado com sucesso!", o ícone está aparecendo como um **círculo verde vazio** porque o código usa o emoji `✉️` dentro de um `<span>`, que não renderiza bem em todos os dispositivos/navegadores. No seu iPhone, o emoji não está sendo exibido corretamente dentro do container estilizado.

## Correção

Substituir o emoji `✉️` pelo componente `CheckCircle` do Lucide React (já importado no projeto), que renderiza consistentemente em todos os dispositivos.

### Arquivo: `src/pages/Auth.tsx`

**Linha 443** — trocar:
```tsx
<span className="text-2xl">✉️</span>
```

Por:
```tsx
<CheckCircle className="h-6 w-6 text-primary" />
```

Isso garantirá um ícone vetorial SVG que funciona em qualquer dispositivo, com a cor verde primária do tema.

