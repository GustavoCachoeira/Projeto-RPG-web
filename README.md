# Projeto-RPG-web
Este é um sistema web para gerenciamento de lobbies de RPG, permitindo que mestres criem lobbies, convidem jogadores e gerenciem fichas de personagens. Os jogadores podem visualizar e editar apenas suas próprias fichas, enquanto o mestre tem acesso a todas.

Funcionalidades 🚀🎯🛡️

*Autenticação de Usuário: Registro e login utilizando JWT.

*Criação de Lobbies: Mestres podem criar lobbies e convidar jogadores.

*Gerenciamento de Fichas: Cada jogador pode criar, editar e visualizar apenas sua própria ficha.

*Visualização pelo Mestre: O mestre do lobby pode ver todas as fichas de personagens.

*Sistema de Convites: Jogadores podem ser convidados para lobbies.


Tecnologias Utilizadas 🖥️🛠️🔗

Front-end

*React.js

*Tailwind CSS

*React Router


Back-end

*Node.js com Express.js (API REST)

*Prisma ORM (para interação com o banco de dados)

*JSON Web Token (JWT) para autenticação


Banco de Dados

*PostgreSQL

*SQLite (testes)


Estrutura do Projeto 📂📌📜

/rpg-lobby-system

│── /client (Front-end React)

│── /server (Back-end Node.js)

│── /database (Configuração do Prisma e esquemas)

│── .env (Configuração de variáveis de ambiente)

│── README.md


Como Rodar o Projeto 🏗️⚙️🚀

Requisitos 🖥️📦✅

Antes de começar, certifique-se de ter os seguintes itens instalados no seu sistema:

- **Node.js** (versão 16 ou superior): [Baixe aqui](https://nodejs.org/)
- **npm** (geralmente instalado junto com o Node.js)
- **PostgreSQL** (versão 12 ou superior): [Baixe aqui](https://www.postgresql.org/download/)
- **Git**: Para clonar o repositório (opcional, se você baixar o código manualmente)


Passos 🏃💨🛠️

1.Clone o repositório

Se você tiver o Git instalado, clone o repositório com o seguinte comando:

```bash
git clone <URL_DO_REPOSITORIO>
cd rpg-lobby
```


2.Crie um Banco de Dados
Abra o terminal do PostgreSQL e crie um banco de dados chamado rpg_lobby_db

```sql
CREATE DATABASE rpg_lobby_db;
```
Configure o Usuário e a Senha
O projeto está configurado para usar o usuário tester com a senha 123456. Crie este usuário no PostgreSQL
```sql
CREATE USER tester WITH PASSWORD '123456';
GRANT ALL PRIVILEGES ON DATABASE rpg_lobby_db TO tester;
```

Atualize o Arquivo de Configuração:
No diretório rpg-lobby-backend, renomeie o arquivo .env.example para .env e verifique se ele contém as seguintes configurações:
```env
DATABASE_URL="postgresql://tester:123456@localhost:6060/rpg_lobby_db?schema=public"
JWT_SECRET="minha-chave-secreta-123"
```
Se o seu PostgreSQL usa a porta padrão (5432), ajuste o DATABASE_URL


3.Configurar o Back-end

```
cd rpg-lobby-backend
```

```
npm install
```

```
npx prisma migrate dev --name init
```

```
node index.js
```

4.Configurar o Front-end

```
cd rpg-lobby-frontend
```

```
npm install
```

```
npm start
```


5.Testando o App
Acesse a Aplicação: Abra o navegador e vá para http://localhost:3000. Você verá a página de login.

Registre Usuários:
*Clique em "Registrar" e crie um usuário mestre:
*Nome: Mestre
*Email: mestre@example.com
*Senha: 123456
*Função: Mestre

Crie também um usuário jogador:
*Nome: Jogador
*Email: jogador@example.com
*Senha: 123456
*Função: Jogador

Faça login como mestre, crie um lobby e convide a conta de jogador
Faça login como jogador, aceite o convite, saia do lobby

Em breve mais atualizações

Erro de Dependências:
Se houver erros ao executar npm install, tente deletar a pasta node_modules e o arquivo package-lock.json em ambos os diretórios (rpg-lobby-backend e rpg-lobby-frontend), e então execute npm install novamente.


Planejamento do CRUD e Transação 🔄🗂️🔐

CRUD

Fichas de Personagens: Criar, ler, atualizar e deletar fichas associadas a um jogador.

Lobbies: Criar e excluir lobbies (apenas pelo mestre).


Transação

Sistema de Convites: O mestre pode convidar jogadores, e a entrada no lobby será processada como uma transação segura no banco de dados.


Melhorias Futuras 🚀✨📈

Integração com chat via WebSocket.

Permissões adicionais para cargos dentro do lobby.

Exportação de fichas para PDF.

Melhorias no design e usabilidade.
