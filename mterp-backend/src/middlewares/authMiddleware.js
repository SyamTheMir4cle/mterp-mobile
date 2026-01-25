const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'rahasia_mterp_2025';

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ msg: 'Token Diperlukan' });
    try {
        const bearer = token.split(" ")[1];
        const decoded = jwt.verify(bearer, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token Tidak Valid' });
    }
};

module.exports = verifyToken;
