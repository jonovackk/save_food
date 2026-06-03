const prisma = require('../lib/prisma');

async function adminMiddleware(req, res, next) {
  if (!req.userId) return res.status(401).json({ error: 'Não autenticado.' });
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Acesso restrito a administradores.' });
    }
    req.adminUser = user;
    next();
  } catch (e) {
    res.status(500).json({ error: 'Erro interno.' });
  }
}

module.exports = { adminMiddleware };
