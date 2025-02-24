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

*Node.js e npm instalados

*PostgreSQL configurado (ou SQLite para testes)


Passos 🏃💨🛠️

1.Clone o repositório
git clone https://github.com/GustavoCachoeira/Projeto-RPG-web.git


2.Instale as dependências
cd server
npm install
cd ../client
npm install


3.Configure as variáveis de ambiente
Crie um arquivo .env na raiz do backend e defina as credenciais do banco de dados e chave JWT


4.Rode o backend
cd server
npm run dev


5.Rode o frontend
cd client
npm run dev


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
