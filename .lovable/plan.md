

## Problema

O texto do título e subtítulo nos banners usa `flex flex-wrap` com emojis em `<span>` separados, o que causa quebras de linha indesejadas — cada emoji e texto vira um item flex separado, quebrando em linhas diferentes.

## Solução

Simplificar o layout do texto removendo o `flex` e colocando os emojis inline diretamente no texto, sem spans separados. Isso mantém tudo na mesma linha naturalmente.

### Mudanças em `src/components/PromoBanner.tsx`:

- **Título (h3)**: Remover `flex items-center gap-1.5 flex-wrap` e renderizar como texto simples: `🤖 {title} 🚀`
- **Subtítulo (p)**: Remover `flex items-center gap-1 flex-wrap` e renderizar como texto simples: `📱 {subtitle} ⚡💬`
- Ambos passam a ser texto corrido normal, sem quebras forçadas

### Mudanças em `src/components/PopupBanner.tsx`:

- Verificar se o mesmo problema existe no popup e corrigir se necessário (o popup atual já usa texto simples, sem flex nos textos)

