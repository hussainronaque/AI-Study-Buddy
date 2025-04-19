const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            return res.status(401).json({ message: 'No authentication token, access denied' });
        }

        const token = authHeader.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ message: 'Invalid token format' });
        }

        try {
            const verified = jwt.verify(token, process.env.JWT_SECRET_KEY);
            req.user = { id: verified.id };
            next();
        } catch (verifyError) {
            console.error('Token verification failed:', verifyError);
            return res.status(401).json({ message: 'Token verification failed, authorization denied' });
        }
    } catch (err) {
        console.error('Auth middleware error:', err);
        res.status(500).json({ message: 'Internal server error in auth middleware' });
    }
};