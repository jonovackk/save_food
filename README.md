# 🌱 Salve Comida — MVP Funcional

Plataforma de doação de alimentos com autenticação, banco de dados real e API REST.

---

## Stack

- **Frontend**: HTML + CSS + Vanilla JS
- **Backend**: Node.js + Express
- **Banco**: SQLite (via Prisma ORM)
- **Auth**: JWT (token salvo no localStorage)
- **Senha**: bcryptjs

---

## Pré-requisitos

- Node.js 12 ou superior
- npm 7 ou superior

---

## Como rodar localmente

### 1. Clone o projeto

```bash
git clone https://github.com/jonovackk/save_food.git
cd save_food
```

### 2. Instale as dependências do backend

```bash
cd backend
npm install
```

### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env
# Edite o .env se quiser mudar a porta ou o JWT_SECRET
```

### 4. Crie o banco de dados

```bash
npx prisma db push
```

### 5. Inicie o servidor

```bash
npm run dev
# ou para produção: npm start
```

### 6. Acesse no browser

```
http://localhost:3000
```

---

## Estrutura de pastas

```
salve_comida/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma       # Modelos do banco
│   ├── src/
│   │   ├── server.js           # Express app principal
│   │   ├── middleware/auth.js  # Verificação do JWT
│   │   ├── lib/prisma.js       # Cliente do Prisma
│   │   └── routes/
│   │       ├── auth.js         # /api/auth/*
│   │       ├── users.js        # /api/users/*
│   │       ├── donations.js    # /api/donations/*
│   │       └── requests.js     # /api/requests/*
│   ├── .env.example
│   └── package.json
├── css/
├── js/
│   ├── api.js                  # Cliente da API (fetch wrapper)
│   └── auth.js                 # Gerenciamento de autenticação
├── index.html
├── login.html
├── cadastro.html
├── doar.html
├── receber.html
├── dashboard.html
├── minhas-doacoes.html
├── minhas-solicitacoes.html
├── solicitacoes-recebidas.html
└── perfil.html
```

---

## Rotas da API

### Auth
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | /api/auth/register | Cadastro de novo usuário |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Usuário autenticado (requer token) |

### Usuários
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /api/users/me | Perfil do usuário logado |
| PATCH | /api/users/me | Atualizar perfil |

### Doações
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /api/donations | Listar disponíveis (filtros: category, city, search) |
| GET | /api/donations/my | Minhas doações |
| GET | /api/donations/:id | Detalhe de uma doação |
| POST | /api/donations | Criar doação |
| PATCH | /api/donations/:id | Editar doação |
| DELETE | /api/donations/:id | Remover doação |
| POST | /api/donations/:id/requests | Solicitar alimento |

### Solicitações
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /api/requests/my | Minhas solicitações (receptor) |
| GET | /api/requests/received | Solicitações recebidas (doador) |
| PATCH | /api/requests/:id/status | Aceitar/recusar/finalizar |
| DELETE | /api/requests/:id | Cancelar solicitação |

---

## Como testar o sistema

1. **Criar conta** → acesse `http://localhost:3000/cadastro.html`
2. **Login** → acesse `http://localhost:3000/login.html`
3. **Cadastrar doação** → `http://localhost:3000/doar.html`
4. **Ver doações disponíveis** → `http://localhost:3000/receber.html`
5. **Solicitar alimento** → clique em "Solicitar" em qualquer card
6. **Ver solicitações recebidas** → `http://localhost:3000/solicitacoes-recebidas.html`
7. **Aceitar/recusar** → botões na página de solicitações recebidas
8. **Acompanhar pedido** → `http://localhost:3000/minhas-solicitacoes.html`

---

## Variáveis de ambiente (backend/.env)

```env
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="sua_string_secreta_aqui"
PORT=3000
NODE_ENV="development"
```
