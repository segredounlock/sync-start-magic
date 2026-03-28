

# Melhorias no Step 2 do InstallWizard — Informar sobre Admin Master

## O que muda
O passo "Criar Administrador" (step 2) precisa deixar claro que este usuario sera o **Admin Master** do sistema, com acesso total e irrevogavel.

## Alteracoes em `src/components/InstallWizard.tsx`

### 1. Titulo e descricao mais claros
- Titulo: "Criar Administrador" → **"Criar Admin Master"**
- Subtitulo: informar que este sera o administrador principal com acesso total e irrevogavel ao sistema
- Icone: trocar `User` por `Shield` (ja importado) para reforcar autoridade

### 2. Card informativo abaixo dos campos
Adicionar um box informativo (estilo similar ao box "Protecao ativa" do step 3) explicando:
- Este usuario tera acesso total ao sistema
- Sera o unico com acesso ao Painel Principal
- O cargo nao pode ser removido por nenhum outro administrador
- Guarde o e-mail e senha em local seguro

### 3. Icone do step indicator
Atualizar para usar icone de escudo em vez de usuario generico

## Resultado
- O usuario entende claramente que esta criando a conta mais importante do sistema
- Alinhado com a hierarquia documentada em `AUTENTICACAO.md`
- Nenhuma mudanca funcional, apenas visual/informativa

