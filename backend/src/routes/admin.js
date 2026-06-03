const router = require('express').Router();
const prisma  = require('../lib/prisma');
const bcrypt  = require('bcryptjs');
const { authMiddleware }  = require('../middleware/auth');
const { adminMiddleware } = require('../middleware/admin');

const auth  = [authMiddleware, adminMiddleware];

// GET /api/admin/stats — resumo geral
router.get('/stats', auth, async (req, res) => {
  try {
    const [users, donations, requests] = await Promise.all([
      prisma.user.count(),
      prisma.donation.count(),
      prisma.foodRequest.count(),
    ]);
    const byStatus = await prisma.donation.groupBy({
      by: ['status'], _count: { id: true },
    });
    res.json({ users, donations, requests, byStatus });
  } catch (e) { res.status(500).json({ error: 'Erro interno.' }); }
});

// GET /api/admin/users — listar usuários
router.get('/users', auth, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, city: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users);
  } catch (e) { res.status(500).json({ error: 'Erro interno.' }); }
});

// PATCH /api/admin/users/:id — alterar role ou bloquear
router.patch('/users/:id', auth, async (req, res) => {
  try {
    const { role } = req.body;
    const valid = ['DONOR', 'RECEIVER', 'BOTH', 'ADMIN', 'BLOCKED'];
    if (!role || !valid.includes(role.toUpperCase())) {
      return res.status(400).json({ error: 'Role inválido.' });
    }
    if (req.params.id === req.userId) {
      return res.status(400).json({ error: 'Não é possível alterar o próprio role.' });
    }
    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data:  { role: role.toUpperCase() },
      select: { id: true, name: true, email: true, role: true },
    });
    res.json(updated);
  } catch (e) { res.status(500).json({ error: 'Erro interno.' }); }
});

// GET /api/admin/donations — todas as doações (qualquer status)
router.get('/donations', auth, async (req, res) => {
  try {
    const donations = await prisma.donation.findMany({
      include: {
        donor:    { select: { id: true, name: true, email: true } },
        requests: { select: { id: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(donations);
  } catch (e) { res.status(500).json({ error: 'Erro interno.' }); }
});

// DELETE /api/admin/donations/:id — remover doação por admin
router.delete('/donations/:id', auth, async (req, res) => {
  try {
    await prisma.foodRequest.deleteMany({ where: { donationId: req.params.id } });
    await prisma.donation.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: 'Erro interno.' }); }
});

// PATCH /api/admin/donations/:id/status — alterar status de qualquer doação
router.patch('/donations/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ['AVAILABLE', 'RESERVED', 'COMPLETED', 'CANCELLED'];
    if (!status || !valid.includes(status.toUpperCase())) {
      return res.status(400).json({ error: 'Status inválido.' });
    }
    const updated = await prisma.donation.update({
      where: { id: req.params.id },
      data:  { status: status.toUpperCase() },
    });
    res.json(updated);
  } catch (e) { res.status(500).json({ error: 'Erro interno.' }); }
});

// POST /api/admin/make-admin — promove usuário por e-mail (requer ADMIN_SECRET)
router.post('/make-admin', async (req, res) => {
  try {
    const { email, secret } = req.body;
    if (!secret || secret !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ error: 'Segredo inválido.' });
    }
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
    await prisma.user.update({ where: { id: user.id }, data: { role: 'ADMIN' } });
    res.json({ ok: true, message: `${user.name} agora é ADMIN.` });
  } catch (e) { res.status(500).json({ error: 'Erro interno.' }); }
});

module.exports = router;
