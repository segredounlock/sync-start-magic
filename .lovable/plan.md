

## Plano: Remover referências ao Lovable

Encontrei referências apenas no `index.html` — as URLs das imagens de preview (og:image e twitter:image) contêm "lovable.app" no path.

### Alteração

**`index.html`** — Substituir as URLs de og:image e twitter:image por uma imagem hospedada no seu próprio domínio ou remover as tags temporariamente até ter uma imagem própria hospedada em `recargasbrasill.com`.

Opções:
1. Gerar um screenshot/banner e hospedar no domínio próprio
2. Remover as meta tags de imagem por enquanto (perde preview em redes sociais)
3. Manter a URL do R2 (CDN) que já não expõe "lovable" de forma visível ao usuário final — o "lovable.app" aparece apenas no nome do arquivo interno do CDN

Além disso, você deve desativar o badge "Edit in Lovable" nas configurações do projeto: **Settings → Hide 'Lovable' Badge**.

### Detalhes Técnicos

As URLs atuais usam o CDN `pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev` com um nome de arquivo que contém `lovable.app`. A solução mais limpa é substituir por uma imagem própria hospedada no seu domínio. Posso gerar uma imagem de preview e atualizar as meta tags.

