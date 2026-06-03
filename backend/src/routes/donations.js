const router = require('express').Router();
const prisma = require('../lib/prisma');
const { authMiddleware } = require('../middleware/auth');

const VALID_CATEGORIES = ['FRUITS','BREADS','MEALS','CANNED','DAIRY','DRINKS','OTHER'];
const VALID_DELIVERY   = ['PICKUP_ONLY','CAN_DELIVER','TO_AGREE'];

// GET /api/donations/my  — deve vir ANTES de /:id
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const donations = await prisma.donation.findMany({
      where: { donorId: req.userId },
      include: {
        donor: { select: { id: true, name: true, city: true, region: true, phone: true } },
        requests: { select: { id: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(donations);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erro interno.' });
  }
});

// GET /api/donations  — listagem pública com filtros
router.get('/', async (req, res) => {
  try {
    const { category, city, search, delivery } = req.query;
    const where = { status: 'AVAILABLE' };
    if (category) where.category = category.toUpperCase();
    if (delivery) where.deliveryOption = delivery.toUpperCase();
    if (city) where.donor = { city: { contains: city } };
    if (search) where.title = { contains: search };

    const donations = await prisma.donation.findMany({
      where,
      include: {
        donor: { select: { id: true, name: true, city: true, region: true } },
        requests: { select: { id: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(donations);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erro interno.' });
  }
});

// GET /api/donations/:id
router.get('/:id', async (req, res) => {
  try {
    const donation = await prisma.donation.findUnique({
      where: { id: req.params.id },
      include: {
        donor: { select: { id: true, name: true, city: true, region: true, phone: true } },
        requests: { select: { id: true, status: true, quantity: true, receiverId: true } },
      },
    });
    if (!donation) return res.status(404).json({ error: 'Doação não encontrada.' });
    res.json(donation);
  } catch (e) {
    res.status(500).json({ error: 'Erro interno.' });
  }
});

// POST /api/donations
router.post('/', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (user.role === 'RECEIVER') {
      return res.status(403).json({ error: 'Receptores não podem cadastrar doações. Altere seu tipo de conta para "Ambos" no perfil.' });
    }

    const { title, description, category, quantity, unit, expirationDate,
            pickupLocation, deliveryOption, imageUrl } = req.body;

    if (!title || !description || !category || !quantity || !unit || !pickupLocation) {
      return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
    }
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({ error: 'A quantidade deve ser maior que zero.' });
    }
    const cat = category.toUpperCase();
    if (!VALID_CATEGORIES.includes(cat)) {
      return res.status(400).json({ error: 'Categoria inválida.' });
    }
    const del = (deliveryOption || 'PICKUP_ONLY').toUpperCase();
    if (!VALID_DELIVERY.includes(del)) {
      return res.status(400).json({ error: 'Opção de entrega inválida.' });
    }

    const donation = await prisma.donation.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        category: cat,
        quantity: qty,
        unit: unit.trim(),
        expirationDate: expirationDate || null,
        pickupLocation: pickupLocation.trim(),
        deliveryOption: del,
        imageUrl: imageUrl || null,
        donorId: req.userId,
      },
      include: { donor: { select: { id: true, name: true, city: true, region: true } } },
    });
    res.status(201).json(donation);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erro interno.' });
  }
});

// PATCH /api/donations/:id
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const donation = await prisma.donation.findUnique({ where: { id: req.params.id } });
    if (!donation) return res.status(404).json({ error: 'Doação não encontrada.' });
    if (donation.donorId !== req.userId) return res.status(403).json({ error: 'Acesso negado.' });

    const { title, description, category, quantity, unit, expirationDate,
            pickupLocation, deliveryOption, imageUrl, status } = req.body;
    const data = {};
    if (title) data.title = title.trim();
    if (description) data.description = description.trim();
    if (category) data.category = category.toUpperCase();
    if (quantity) data.quantity = parseInt(quantity, 10);
    if (unit) data.unit = unit.trim();
    if (expirationDate !== undefined) data.expirationDate = expirationDate || null;
    if (pickupLocation) data.pickupLocation = pickupLocation.trim();
    if (deliveryOption) data.deliveryOption = deliveryOption.toUpperCase();
    if (imageUrl !== undefined) data.imageUrl = imageUrl || null;
    if (status) data.status = status.toUpperCase();

    const updated = await prisma.donation.update({
      where: { id: req.params.id }, data,
      include: { donor: { select: { id: true, name: true, city: true } } },
    });
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: 'Erro interno.' });
  }
});

// DELETE /api/donations/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const donation = await prisma.donation.findUnique({ where: { id: req.params.id } });
    if (!donation) return res.status(404).json({ error: 'Doação não encontrada.' });
    if (donation.donorId !== req.userId) return res.status(403).json({ error: 'Acesso negado.' });

    // remove solicitações vinculadas primeiro
    await prisma.foodRequest.deleteMany({ where: { donationId: req.params.id } });
    await prisma.donation.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Erro interno.' });
  }
});

// POST /api/donations/:id/requests — criar solicitação
router.post('/:id/requests', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (user.role === 'DONOR') {
      return res.status(403).json({ error: 'Doadores não podem solicitar alimentos. Altere seu tipo de conta para "Ambos" no perfil.' });
    }

    const donation = await prisma.donation.findUnique({
      where: { id: req.params.id },
      include: { requests: true },
    });
    if (!donation) return res.status(404).json({ error: 'Doação não encontrada.' });
    if (donation.status !== 'AVAILABLE') {
      return res.status(400).json({ error: 'Esta doação não está mais disponível.' });
    }
    if (donation.donorId === req.userId) {
      return res.status(400).json({ error: 'Você não pode solicitar a própria doação.' });
    }

    const existing = donation.requests.find(r => r.receiverId === req.userId && r.status === 'PENDING');
    if (existing) {
      return res.status(409).json({ error: 'Você já possui uma solicitação pendente para esta doação.' });
    }

    const { quantity, message } = req.body;
    const qty = parseInt(quantity || 1, 10);

    const request = await prisma.foodRequest.create({
      data: {
        quantity: qty,
        message: message || null,
        donationId: req.params.id,
        receiverId: req.userId,
      },
      include: {
        donation: { select: { id: true, title: true, status: true } },
        receiver: { select: { id: true, name: true, phone: true, email: true } },
      },
    });
    res.status(201).json(request);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erro interno.' });
  }
});

module.exports = router;
