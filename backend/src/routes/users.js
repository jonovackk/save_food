const router = require('express').Router();
const prisma = require('../lib/prisma');
const { authMiddleware } = require('../middleware/auth');

// GET /api/users/me
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
    res.json(safeUser(user));
  } catch (e) {
    res.status(500).json({ error: 'Erro interno.' });
  }
});

// PATCH /api/users/me
router.patch('/me', authMiddleware, async (req, res) => {
  try {
    const { name, phone, state, city, region, address, role, showAddress } = req.body;
    const VALID_ROLES = ['DONOR', 'RECEIVER', 'BOTH'];
    const data = {};
    if (name) data.name = name.trim();
    if (phone !== undefined) data.phone = phone || null;
    if (state !== undefined) data.state = state || null;
    if (city !== undefined) data.city = city || null;
    if (region !== undefined) data.region = region || null;
    if (address !== undefined) data.address = address || null;
    if (showAddress !== undefined) data.showAddress = !!showAddress;
    if (role && VALID_ROLES.includes(role.toUpperCase())) data.role = role.toUpperCase();

    const user = await prisma.user.update({ where: { id: req.userId }, data });
    res.json(safeUser(user));
  } catch (e) {
    res.status(500).json({ error: 'Erro interno.' });
  }
});

function safeUser(u) {
  return {
    id: u.id, name: u.name, email: u.email,
    phone: u.phone, role: u.role,
    state: u.state, city: u.city,
    region: u.region, address: u.address,
    showAddress: u.showAddress, createdAt: u.createdAt,
  };
}

module.exports = router;
