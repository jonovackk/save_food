# Tutorial de Deploy — Salve Comida

Guia completo para colocar o site no ar usando Render (hospedagem gratuita).

---

## Pré-requisitos

Crie contas gratuitas em:

- [render.com](https://render.com) — hospedagem do backend
- [resend.com](https://resend.com) — envio de e-mails
- [cloudinary.com](https://cloudinary.com) — upload de fotos

---

## Passo 1 — Subir o backend no Render

1. No Render, clique em **New → Web Service**
2. Conecte seu repositório GitHub (`save_food`)
3. Configure:
   - **Name:** `save-food` (ou o nome que preferir)
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npx prisma generate && npx prisma db push`
   - **Start Command:** `node server.js`
   - **Instance Type:** Free

---

## Passo 2 — Variáveis de ambiente no Render

Vá em **Environment → Add Environment Variable** e adicione:

| Variável | Valor | Onde obter |
|---|---|---|
| `JWT_SECRET` | qualquer texto longo e aleatório | Ex: `minha-chave-super-secreta-2024` |
| `ADMIN_SECRET` | senha para criar admins | Ex: `admin123` (guarde bem) |
| `RESEND_API_KEY` | chave da API do Resend | [resend.com → API Keys](https://resend.com/api-keys) |
| `EMAIL_FROM` | e-mail remetente | Ex: `noreply@seudominio.com` |
| `CLOUDINARY_CLOUD_NAME` | nome do cloud | Painel do Cloudinary → Dashboard |
| `CLOUDINARY_API_KEY` | chave da API | Painel do Cloudinary → Dashboard |
| `CLOUDINARY_API_SECRET` | segredo da API | Painel do Cloudinary → Dashboard |
| `ALLOWED_ORIGINS` | URL do frontend | Ex: `https://save-food.vercel.app` |
| `APP_URL` | URL do backend | Gerada pelo Render após deploy |

> `DATABASE_URL` não é necessária — o Render usa SQLite local automaticamente.

---

## Passo 3 — Subir o frontend no Vercel (opcional)

O frontend são arquivos HTML estáticos e pode ser hospedado em qualquer lugar.

**Opção A — Vercel (recomendado):**
1. Acesse [vercel.com](https://vercel.com) e importe o repositório
2. Deixe a raiz como `/` (não `backend`)
3. Clique em Deploy

**Opção B — GitHub Pages:**
1. Repositório → Settings → Pages
2. Source: `Deploy from a branch` → `main` → `/ (root)`

Depois do deploy, copie a URL e adicione em `ALLOWED_ORIGINS` no Render.

---

## Passo 4 — Atualizar a URL do backend no frontend

Nos arquivos JS do frontend, a URL do backend está em `js/api.js` ou similar.
Certifique-se de que aponta para a URL correta do Render.

```javascript
const API_URL = 'https://save-food-xxxx.onrender.com';
```

---

## Passo 5 — Criar o primeiro admin

Após o deploy estar no ar, crie sua conta normalmente pelo site e depois promova-a a admin:

```bash
curl -X POST https://SEU-APP.onrender.com/api/admin/make-admin \
  -H "Content-Type: application/json" \
  -d '{"email":"SEU_EMAIL@gmail.com","secret":"VALOR_DO_ADMIN_SECRET"}'
```

Resposta esperada:
```json
{"ok": true, "message": "Seu Nome agora é ADMIN."}
```

Depois acesse: `https://SEU-FRONTEND/admin.html`

---

## Observações

- **Plano gratuito do Render:** o servidor "dorme" após 15 minutos sem requisições — a primeira visita do dia pode demorar ~30 segundos para acordar.
- **Banco de dados:** o SQLite no Render é volátil — os dados são apagados a cada novo deploy. Para produção real, considere migrar para PostgreSQL (o Render oferece um plano gratuito).
- **Re-deploy:** a cada `git push` para `main`, o Render faz deploy automático se estiver conectado ao GitHub.
