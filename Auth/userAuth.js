const jwt = require('jsonwebtoken');
const secret = "auditale1234567890";

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