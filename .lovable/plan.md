

# Testar sync com push

## O que fazer
Fazer uma alteração mínima no código para disparar um push ao GitHub, que ativará o workflow de sync para o `UPDATERECARGASBRASIL`.

## Alteração
Adicionar um comentário com timestamp no arquivo `.github/workflows/sync-mirror.yml` para forçar um commit e testar o pipeline.

## Resultado esperado
1. Push vai para `recargas-brasil-v2`
2. GitHub Action dispara automaticamente
3. Código é espelhado para `UPDATERECARGASBRASIL`
4. Verificar em `github.com/segredounlock/recargas-brasil-v2/actions` se passou ✅

