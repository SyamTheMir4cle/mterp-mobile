const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const verifyToken = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.use(verifyToken);

// Perhatikan: upload.single('foto') ditaruh di sini
router.post('/', upload.single('foto'), attendanceController.clockIn);
router.get('/', attendanceController.getLogs);

module.exports = router;
