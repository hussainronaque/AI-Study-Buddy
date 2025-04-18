const jwt = require('jsonwebtoken');
require('dotenv').config({ path: './Database/connection_string.env' });

module.exports = (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ message: 'No authentication token, access denied' });
        }

        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { id: verified.id };
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token verification failed, authorization denied' });
    }
}; 