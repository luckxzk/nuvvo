# NUVVO

Rede social full-stack (React + Vite + Node/Express + MongoDB).

## Requisitos

- Node.js 18+
- MongoDB (local ou Atlas)

## Instalação

Na raiz do projeto:

```bash
npm install
```

Isso instala as dependências da raiz, do `client` e do `server` automaticamente.

## Configuração

Crie um arquivo `server/.env` (copie de `.env.example`, que está na raiz do projeto):

```bash
cp .env.example server/.env
```

Depois edite `server/.env` com seus valores:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/nuvvo
JWT_SECRET=troque_por_um_segredo_forte
PORT=5000
CLIENT_URL=http://localhost:5173
```

- **MongoDB local:** instale o MongoDB Community Server e rode-o (`mongod`). A URI padrão acima já funciona.
- **MongoDB Atlas:** crie um cluster gratuito, copie a connection string e cole em `MONGODB_URI`.

## Executar

```bash
npm run dev
```

Isso inicia o backend (porta 5000) e o frontend (porta 5173) ao mesmo tempo. Acesse:

```
http://localhost:5173
```

## O que fazer manualmente

1. Instalar Node.js.
2. Configurar o MongoDB (local ou Atlas).
3. Criar o arquivo `server/.env` com `MONGODB_URI`, `JWT_SECRET`, `PORT`, `CLIENT_URL`.
4. Executar `npm install` na raiz.
5. Executar `npm run dev`.

## Estrutura

```
NUVVO/
├── client/   (React + Vite)
├── server/   (Node + Express + MongoDB)
├── .env.example
└── package.json
```

## Funcionalidades

Cadastro, login, logout, sessão persistente (JWT), edição de perfil (nome, username, bio, avatar), publicações (foto, vídeo, texto), curtidas, comentários, seguir/deixar de seguir, feed, explorar, pesquisa de usuários, notificações (novo seguidor, curtida, comentário), edição/exclusão de publicações e comentários próprios, responsividade completa e identidade visual preta/cinza com logo em asterisco geométrico de 6 pontas.
