const jwt = require('jsonwebtoken');
const secret = "auditale0987654321";

function setUser(userData) {
    return jwt.sign({
        userData
    }, secret, { expiresIn: '7d' });
}

function getUser(token) {
    try {
        return jwt.verify(token, secret);
    } catch (err) {
        return null;
    }
}

module.exports = {
    setUser,
    getUser
}