const router     = require('express').Router();
const cloudinary = require('cloudinary').v2;
const multer     = require('multer');
const { authMiddleware } = require('../middleware/auth');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload  = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: function(req, file, cb) {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Apenas imagens são permitidas.'));
    }
    cb(null, true);
  },
});

// POST /api/upload — faz upload de imagem para o Cloudinary
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Nenhuma imagem enviada.' });

  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    return res.status(503).json({ error: 'Upload de imagens não configurado.' });
  }

  try {
    const result = await new Promise(function(resolve, reject) {
      cloudinary.uploader.upload_stream(
        { folder: 'salvecomida', transformation: [{ width: 800, crop: 'limit' }, { quality: 'auto' }] },
        function(err, result) { if (err) reject(err); else resolve(result); }
      ).end(req.file.buffer);
    });
    res.json({ url: result.secure_url });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erro ao fazer upload da imagem.' });
  }
});

module.exports = router;
