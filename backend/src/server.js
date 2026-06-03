require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const path      = require('path');
const rateLimit = require('express-rate-limit');
const cron      = require('node-cron');

const authRoutes      = require('./routes/auth');
const usersRoutes     = require('./routes/users');
const donationsRoutes = require('./routes/donations');
const requestsRoutes  = require('./routes/requests');
const uploadRoutes    = require('./routes/upload');
const prisma          = require('./lib/prisma');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middlewares
const ALLOWED_ORIGINS = ['http://localhost:3000'];
if (process.env.RENDER_EXTERNAL_URL) ALLOWED_ORIGINS.push(process.env.RENDER_EXTERNAL_URL);
if (process.env.ALLOWED_ORIGINS) {
  process.env.ALLOWED_ORIGINS.split(',').forEach(function(o) {
    var t = o.trim(); if (t) ALLOWED_ORIGINS.push(t);
  });
}
app.use(cors({
  origin: function(origin, cb) {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    cb(new Error('Origem não permitida pelo CORS'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Bloqueia acesso direto à pasta backend pelo navegador
app.use('/backend', (req, res) => res.status(403).end());

// ── Serve os arquivos do frontend (HTML, CSS, JS) da raiz do projeto
app.use(express.static(path.join(__dirname, '../..')));

// ── Rate limiting: máx 10 tentativas de login por IP a cada 15 min
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Muitas tentativas. Aguarde 15 minutos e tente novamente.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Rotas da API
app.use('/api/auth/login',    loginLimiter);
app.use('/api/auth/register', loginLimiter);
app.use('/api/auth',      authRoutes);
app.use('/api/users',     usersRoutes);
app.use('/api/donations', donationsRoutes);
app.use('/api/requests',  requestsRoutes);
app.use('/api/upload',    uploadRoutes);

// ── 404 para rotas /api/* desconhecidas
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Rota não encontrada.' });
});

// ── Fallback: serve index.html para todas as outras rotas
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../index.html'));
});

// ── Job: expira doações vencidas (roda ao iniciar + todo dia à meia-noite)
async function expireOldDonations() {
  const today = new Date().toISOString().split('T')[0];
  try {
    const { count } = await prisma.donation.updateMany({
      where: { status: 'AVAILABLE', expirationDate: { lt: today } },
      data:  { status: 'CANCELLED' },
    });
    if (count > 0) console.log(`[cron] ${count} doação(ões) expirada(s).`);
  } catch (e) { console.error('[cron] erro ao expirar doações:', e.message); }
}
expireOldDonations();
cron.schedule('0 0 * * *', expireOldDonations);

// ── Inicia servidor
app.listen(PORT, () => {
  console.log('');
  console.log('  🌱 Salve Comida — servidor rodando!');
  console.log('  ┌─────────────────────────────────────────┐');
  console.log('  │  http://localhost:' + PORT + '                      │');
  console.log('  └─────────────────────────────────────────┘');
  console.log('');
});
