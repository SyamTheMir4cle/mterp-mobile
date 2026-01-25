const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const verifyToken = require('../middlewares/authMiddleware');

router.use(verifyToken);

router.get('/', inventoryController.getInventory);

// --- Public Access (All Logged In Users) ---
// Dashboard: Melihat semua alat (Gudang & Terpakai di Proyek)
router.get('/dashboard', inventoryController.getToolDashboard);

// Laporan: Melihat alat spesifik di satu proyek
router.get('/project/:projectId', inventoryController.getProjectTools);


// --- Restricted Access (Asset Admin Only) ---
// 1. Assign alat dari Gudang -> Project
router.post('/assign', inventoryController.assignToolToProject);

// 2. Tag siapa yang pakai alat hari ini
router.post('/usage', inventoryController.tagToolUsage);

// 3. Kembalikan alat Project -> Gudang
router.post('/return-warehouse', inventoryController.returnToolToWarehouse);

router.get('/stats', inventoryController.getInventoryStats);

module.exports = router;
