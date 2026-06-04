const router   = require('express').Router();
const ImageKit = require('imagekit');
const multer   = require('multer');
const { authMiddleware } = require('../middleware/auth');

const imagekit = new ImageKit({
  publicKey:   process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey:  process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: function(req, file, cb) {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Apenas imagens são permitidas.'));
    }
    cb(null, true);
  },
});

router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Nenhuma imagem enviada.' });

  if (!process.env.IMAGEKIT_PRIVATE_KEY) {
    return res.status(503).json({ error: 'Upload de imagens não configurado.' });
  }

  try {
    const result = await imagekit.upload({
      file:     req.file.buffer,
      fileName: `${Date.now()}-${req.file.originalname}`,
      folder:   '/salvecomida',
    });
    res.json({ url: result.url });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erro ao fazer upload da imagem.' });
  }
});

module.exports = router;
