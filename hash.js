let crypto = require('crypto');

module.exports.salt = () => crypto.randomBytes(128).toString('base64');

module.exports.hash = (pass, salt) => {
    return crypto.promise.pbkdf2(pass, salt, 4096, 512)
}