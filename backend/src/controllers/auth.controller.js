const getPrisma = require('../lib/prisma');
const { createAuthHandlers } = require('./auth.handlers');

module.exports = createAuthHandlers(getPrisma);
