const express = require('express');
const router = express.Router();
const authRoutes = require('./auth.routes');
const githubRoutes = require('./github.routes');
const linkedinRoutes = require('./linkedin.routes');

router.get('/', (req, res) => {
  res.json({ message: 'DevBrand AI API v1' });
});

router.use('/auth', authRoutes);
router.use('/auth/github', githubRoutes);
router.use('/auth/linkedin', linkedinRoutes);

module.exports = router;
