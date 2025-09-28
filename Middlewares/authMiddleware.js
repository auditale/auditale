const { getUser } = require('../Auth/userAuth');

async function handleAuthUser(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: "Authorization token missing or malformed" });
    }

    const token = authHeader.split(' ')[1];
    const userData = getUser(token);

    if (!userData) {
        return res.status(401).json({ error: "Invalid or expired token" });
    }

    req.user = userData; // available in protected routes
    next();
}

module.exports = {
    handleAuthUser
}