const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const verifyToken = require('../middlewares/authMiddleware');

router.use(verifyToken);

router.post('/', requestController.createRequest);
router.put('/:id/approve', requestController.approveRequest);

module.exports = router;
