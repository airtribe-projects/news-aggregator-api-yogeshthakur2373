const jwt = require('jsonwebtoken');
const JWT_SECRET = 'sadfghjk,lkutjrheawrtyjkuhl.';

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    // Ensure the header starts with "Bearer "
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) return res.status(401).json({ message: 'Token required.' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        req.user = user;
        next();
    });
}

module.exports = { authenticateToken };