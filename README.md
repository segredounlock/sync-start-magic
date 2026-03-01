# Plataforma de Revenda - Recarga Express

Uma plataforma completa de revenda de recargas de celular com sistema de saldo virtual e painel administrativo.

## 🚀 Funcionalidades

### Painel Administrativo
- ✅ **Dashboard** - Visualize saldo total, revendedores e estatísticas
- ✅ **Gerenciar Revendedores** - Crie e gerencie contas de revendedores
- ✅ **Adicionar Saldo** - Adicione saldo virtual para revendedores
- ✅ **Histórico de Recargas** - Veja todas as recargas realizadas
- ✅ **Configurações** - Gerencie a API Key e configurações

### Painel Revendedor
- ✅ **Dashboard** - Visualize seu saldo e estatísticas
- ✅ **Catálogo** - Explore operadoras e valores disponíveis
- ✅ **Nova Recarga** - Faça recargas usando seu saldo virtual
- ✅ **Meus Pedidos** - Acompanhe suas recargas

## 🔑 Acesso Inicial

### Administrador
- **Usuário:** `admin`
- **Senha:** `admin123`
- **Tipo:** Administrador

### Criar Revendedores
1. Faça login como administrador
2. Vá em "👥 Revendedores"
3. Clique em "➕ Adicionar Revendedor"
4. Preencha os dados e crie o revendedor
5. Adicione saldo para o revendedor poder fazer recargas

## 📋 Como Funciona

1. **Administrador configura a API Key** (já pré-configurada)
2. **Administrador cria revendedores** através do painel
3. **Administrador adiciona saldo** para cada revendedor
4. **Revendedor faz login** e acessa seu painel
5. **Revendedor faz recargas** usando seu saldo virtual
6. **Sistema debita do saldo** do revendedor e usa a API Key do admin para realizar a recarga

## 🔧 Instalação

1. Clone ou baixe este repositório
2. Abra o arquivo `index.html` em um navegador web
3. Ou configure um servidor web local

### Usando XAMPP (Windows)

1. Copie a pasta do projeto para `C:\xampp\htdocs\`
2. Acesse `http://localhost/plataformaderecarga/` no navegador

### Usando Python

```bash
python -m http.server 8000
# Acesse http://localhost:8000
```

## 🔐 Segurança

- As senhas são armazenadas em texto simples no localStorage (apenas para demonstração)
- Em produção, use hash de senhas e autenticação adequada
- A API Key do administrador é usada para todas as recargas
- Cada revendedor tem saldo virtual independente

## 💾 Armazenamento de Dados

Todos os dados são armazenados no **localStorage** do navegador:
- Usuários (admin e revendedores)
- Saldos virtuais dos revendedores
- Histórico de recargas
- Configurações da API

**Nota:** Os dados são locais ao navegador. Para produção, use um banco de dados real.

## 📊 Sistema de Saldo

- Cada revendedor possui um **saldo virtual** independente
- O administrador adiciona saldo aos revendedores
- Quando um revendedor faz uma recarga:
  - O valor é debitado do saldo virtual do revendedor
  - A recarga é realizada usando a API Key do administrador
  - O custo real é debitado da conta do administrador na API

## 🎯 Fluxo de Recarga

1. Revendedor seleciona operadora e valor
2. Sistema verifica se o revendedor tem saldo suficiente
3. Se tiver saldo, cria a recarga via API
4. Debita o valor do saldo virtual do revendedor
5. Registra a recarga no histórico

## 📱 API Integration

A plataforma usa a API da Recarga Express:
- **Base URL:** `https://express.poeki.dev/api`
- **API Key:** Pré-configurada (pode ser alterada nas configurações)
- Todos os endpoints documentados estão implementados

## 🛠️ Tecnologias

- HTML5
- CSS3 (Design moderno e responsivo)
- JavaScript (ES6+)
- LocalStorage (Banco de dados local)
- Fetch API (Requisições HTTP)

## 📝 Estrutura de Arquivos

```
plataformaderecarga/
├── index.html      # Interface principal
├── styles.css      # Estilos
├── api.js          # Integração com API
├── database.js     # Gerenciamento de dados local
├── app.js          # Lógica da aplicação
└── README.md       # Documentação
```

## 🐛 Solução de Problemas

### Erro ao fazer login
- Verifique se o usuário e senha estão corretos
- Certifique-se de selecionar o tipo correto (admin ou revendedor)

### Saldo insuficiente
- O revendedor precisa ter saldo adicionado pelo administrador
- Verifique o saldo no dashboard do revendedor

### Erro ao criar recarga
- Verifique se a API Key está configurada corretamente
- Confirme se há saldo suficiente na conta da API
- Verifique se o número de telefone está correto

## 💡 Dicas

- **Primeiro acesso:** Use `admin` / `admin123` para entrar como administrador
- **Criar revendedores:** Sempre adicione saldo após criar um revendedor
- **Monitoramento:** Use o dashboard admin para acompanhar todas as recargas
- **Segurança:** Em produção, implemente autenticação adequada e hash de senhas

## 📄 Licença

Este projeto é fornecido como está, para uso pessoal ou comercial.

## 🔗 Links Úteis

- [API Documentation](https://express.poeki.dev/api/docs)
- [Recarga Express](https://express.poeki.store/)

---

Desenvolvido com ❤️ para facilitar a revenda de recargas
