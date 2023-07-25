const {
    createJWT,
    isTokenValid,
    attachCookiesToResponse,
} = require("./jwt.js");

const createTokenUser = require("./createTokenUser.js");
const checkPermissions = require("./checkPermissions.js");

module.exports = {
    createJWT,
    isTokenValid,
    attachCookiesToResponse,
    createTokenUser,
    checkPermissions,
};
