const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const { authMiddleware } = require('../middleware/auth');

const VALID_ROLES = ['DONOR', 'RECEIVER', 'BOTH'];

function makeToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, role, city, region, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nome, e-mail e senha são obrigatórios.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres.' });
    }
    const userRole = (role || 'BOTH').toUpperCase();
    if (!VALID_ROLES.includes(userRole)) {
      return res.status(400).json({ error: 'Tipo de usuário inválido.' });
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existing) {
      return res.status(409).json({ error: 'Este e-mail já está cadastrado.' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashed,
        phone: phone || null,
        role: userRole,
        city: city || null,
        region: region || null,
        address: address || null,
      },
    });

    const token = makeToken(user.id);
    res.status(201).json({ token, user: safeUser(user) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erro interno. Tente novamente.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user) {
      return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
    }

    const token = makeToken(user.id);
    res.json({ token, user: safeUser(user) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erro interno. Tente novamente.' });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
    res.json(safeUser(user));
  } catch (e) {
    res.status(500).json({ error: 'Erro interno.' });
  }
});

function safeUser(u) {
  return {
    id: u.id, name: u.name, email: u.email,
    phone: u.phone, role: u.role, city: u.city,
    region: u.region, address: u.address, createdAt: u.createdAt,
  };
}

module.exports = router;
