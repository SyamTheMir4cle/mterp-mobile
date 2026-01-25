const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const verifyToken = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.use(verifyToken);

// Konfigurasi Upload File Project
const projectUploads = upload.fields([
    { name: 'perencanaan', maxCount: 1 },
    { name: 'rab', maxCount: 1 },
    { name: 'gambarKerja', maxCount: 1 },
    { name: 'rencanaMaterial', maxCount: 1 },
    { name: 'rencanaAlat', maxCount: 1 }
]);

// --- DEFINISI ROUTE ---

// 1. Create & List
router.post('/', projectUploads, projectController.createProject);
router.get('/', projectController.getProjects);

// 2. Detail Project (PENTING: Taruh :id di bawah route static lainnya jika ada)
router.get('/:id', projectController.getProjectById); 

// 3. Update & Delete
router.put('/:id/progress', projectController.updateProgress);
router.delete('/:id', projectController.deleteProject);

// 4. Features (Daily Report & S-Curve)
router.post('/:id/updates', upload.single('foto'), projectController.createDailyUpdate);
router.get('/:id/scurve', projectController.getSCurveData);

module.exports = router;
