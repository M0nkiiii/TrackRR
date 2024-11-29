const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        console.error('Access token missing');
        return res.status(401).json({ error: 'Access token missing' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.error('Invalid token:', err.message);
            return res.status(403).json({ error: 'Invalid token' });
        }

        console.log('Authenticated user:', user); // Debugging
        req.user = user; // Attach decoded payload (id) to request
        next();
    });
};

module.exports = authenticateToken;
