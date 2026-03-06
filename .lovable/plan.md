

## Analise: Botao "Ver Perfil Publico"

O botao "Ver Perfil Publico" na aba Minha Conta redireciona para a pagina `/perfil/:userId` (UserProfile.tsx), que e uma pagina separada criada anteriormente.

Como o perfil ja esta integrado dentro da aba "Minha Conta" com todas as informacoes (foto, bio, seguidores, stats), a pagina publica separada se torna redundante. O unico uso seria para outros usuarios visitarem o perfil de alguem, mas isso pode ser acessado via links no chat ou em outras partes do app.

### Plano

1. **Remover o botao "Ver Perfil Publico"** do `ProfileTab.tsx` - ja que o usuario esta vendo seu proprio perfil ali, nao faz sentido redirecionar para outra pagina com as mesmas informacoes.

2. **Manter a rota `/perfil/:userId`** funcionando - ela ainda e util quando outros usuarios clicam no nome/avatar de alguem no chat ou na lista de seguidores para ver o perfil dessa pessoa.

Basicamente: remover apenas o botao da aba Minha Conta, pois e desnecessario. A pagina publica continua existindo para quando outros usuarios quiserem ver seu perfil.

### Arquivos alterados
- `src/components/ProfileTab.tsx` - remover o bloco do botao "Ver Perfil Publico" (~5 linhas)

