const Request = require('../models/Request');

// 1. Buat Request Baru
exports.createRequest = async (req, res) => {
    try {
        const newReq = await Request.create({
            ...req.body,
            userId: req.user.id
        });
        res.json(newReq);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

// 2. Approval Request (Khusus Direktur/Owner)
exports.approveRequest = async (req, res) => {
    if (!['director', 'owner'].includes(req.user.role)) {
        return res.status(403).json({ msg: 'Hanya Direktur yang boleh approve' });
    }
    try {
        const updatedReq = await Request.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status, approvedBy: req.user.id },
            { new: true }
        );
        res.json(updatedReq);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};
