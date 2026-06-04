const router = require('express').Router();
const prisma = require('../lib/prisma');
const { authMiddleware } = require('../middleware/auth');
const { sendRequestAccepted } = require('../lib/email');

// GET /api/requests/daily-status — quantas solicitações o usuário fez hoje
router.get('/daily-status', authMiddleware, async (req, res) => {
  try {
    const DAILY_LIMIT = parseInt(process.env.DAILY_REQUEST_LIMIT || '5', 10);
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const used = await prisma.foodRequest.count({
      where: {
        receiverId: req.userId,
        createdAt: { gte: startOfDay },
        status: { not: 'CANCELLED' },
      },
    });
    res.json({ used, limit: DAILY_LIMIT, remaining: Math.max(0, DAILY_LIMIT - used) });
  } catch (e) {
    res.status(500).json({ error: 'Erro interno.' });
  }
});

// GET /api/requests/my — solicitações feitas pelo receptor logado
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const requests = await prisma.foodRequest.findMany({
      where: { receiverId: req.userId },
      include: {
        donation: {
          select: {
            id: true, title: true, category: true, quantity: true, unit: true,
            pickupLocation: true, deliveryOption: true, status: true,
            donor: { select: { id: true, name: true, city: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(requests);
  } catch (e) {
    res.status(500).json({ error: 'Erro interno.' });
  }
});

// GET /api/requests/received — solicitações recebidas pelo doador logado
router.get('/received', authMiddleware, async (req, res) => {
  try {
    const requests = await prisma.foodRequest.findMany({
      where: { donation: { donorId: req.userId } },
      include: {
        donation: { select: { id: true, title: true, category: true, unit: true } },
        receiver: { select: { id: true, name: true, city: true, showAddress: true, address: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    // Expõe endereço do receptor apenas se ele permitiu e a solicitação foi aceita
    const safe = requests.map(function(r) {
      if (r.receiver) {
        const showAddr = r.status === 'ACCEPTED' && r.receiver.showAddress;
        r.receiver = {
          id:      r.receiver.id,
          name:    r.receiver.name,
          city:    r.receiver.city,
          address: showAddr ? r.receiver.address : null,
        };
      }
      return r;
    });
    res.json(safe);
  } catch (e) {
    res.status(500).json({ error: 'Erro interno.' });
  }
});

// PATCH /api/requests/:id/status — doador altera status
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const DONOR_TRANSITIONS   = ['ACCEPTED', 'REJECTED', 'COMPLETED'];
    const RECEIVER_TRANSITIONS = ['CANCELLED'];
    const allowed = [...DONOR_TRANSITIONS, ...RECEIVER_TRANSITIONS];

    if (!status || !allowed.includes(status.toUpperCase())) {
      return res.status(400).json({ error: 'Status inválido.' });
    }
    const newStatus = status.toUpperCase();

    const request = await prisma.foodRequest.findUnique({
      where: { id: req.params.id },
      include: { donation: true },
    });
    if (!request) return res.status(404).json({ error: 'Solicitação não encontrada.' });

    const isDonor    = request.donation.donorId === req.userId;
    const isReceiver = request.receiverId === req.userId;

    if (!isDonor && !isReceiver) {
      return res.status(403).json({ error: 'Acesso negado.' });
    }
    if (DONOR_TRANSITIONS.includes(newStatus) && !isDonor) {
      return res.status(403).json({ error: 'Apenas o doador pode aceitar, recusar ou finalizar.' });
    }
    if (RECEIVER_TRANSITIONS.includes(newStatus) && !isReceiver) {
      return res.status(403).json({ error: 'Apenas o receptor pode cancelar.' });
    }
    if (newStatus === 'CANCELLED' && request.status !== 'PENDING') {
      return res.status(400).json({ error: 'Só é possível cancelar solicitações pendentes.' });
    }

    const updated = await prisma.foodRequest.update({
      where: { id: req.params.id },
      data: { status: newStatus },
    });

    // Quando aceito: marca doação como RESERVED
    if (newStatus === 'ACCEPTED') {
      await prisma.donation.update({
        where: { id: request.donationId },
        data: { status: 'RESERVED' },
      });
    }
    // Quando finalizado: marca doação como COMPLETED
    if (newStatus === 'COMPLETED') {
      await prisma.donation.update({
        where: { id: request.donationId },
        data: { status: 'COMPLETED' },
      });
    }
    // Quando recusado ou cancelado: doação volta a AVAILABLE se estava RESERVED
    if ((newStatus === 'REJECTED' || newStatus === 'CANCELLED') && request.donation.status === 'RESERVED') {
      const otherAccepted = await prisma.foodRequest.findFirst({
        where: { donationId: request.donationId, status: 'ACCEPTED', id: { not: request.id } },
      });
      if (!otherAccepted) {
        await prisma.donation.update({
          where: { id: request.donationId },
          data: { status: 'AVAILABLE' },
        });
      }
    }

    res.json(updated);

    // Notificações por e-mail (assíncrono — não bloqueia a resposta)
    if (newStatus === 'ACCEPTED') {
      try {
        const receiver = await prisma.user.findUnique({ where: { id: request.receiverId } });
        const donor    = await prisma.user.findUnique({ where: { id: request.donation.donorId } });
        if (receiver && donor) {
          sendRequestAccepted(
            receiver.email, donor.name,
            request.donation.title, request.donation.pickupLocation || ''
          ).catch(function(){});
        }
      } catch(e) {}
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erro interno.' });
  }
});

// DELETE /api/requests/:id — receptor cancela (alias conveniente)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const request = await prisma.foodRequest.findUnique({
      where: { id: req.params.id },
      include: { donation: true },
    });
    if (!request) return res.status(404).json({ error: 'Solicitação não encontrada.' });
    if (request.receiverId !== req.userId) return res.status(403).json({ error: 'Acesso negado.' });
    if (request.status !== 'PENDING') {
      return res.status(400).json({ error: 'Só é possível cancelar solicitações pendentes.' });
    }

    await prisma.foodRequest.update({
      where: { id: req.params.id },
      data: { status: 'CANCELLED' },
    });

    // Volta doação para AVAILABLE se estava RESERVED por esta solicitação
    if (request.donation.status === 'RESERVED') {
      await prisma.donation.update({
        where: { id: request.donationId },
        data: { status: 'AVAILABLE' },
      });
    }

    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Erro interno.' });
  }
});

module.exports = router;
