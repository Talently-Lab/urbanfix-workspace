const unavailableCodes = new Set([
  'DATABASE_URL_MISSING',
  'DATABASE_URL_INVALID',
  'P1000',
  'P1001',
  'P1002',
  'P1003',
  'P1008',
  'P1010',
  'P1011',
  'P1013',
  'P1017',
  'ECONNREFUSED',
  'ECONNRESET',
  'ENOTFOUND',
  'ETIMEDOUT'
]);

function isServiceUnavailable(error) {
  let current = error;
  while (current) {
    if (
      unavailableCodes.has(current.code) ||
      unavailableCodes.has(current.errorCode) ||
      current.name === 'PrismaClientInitializationError'
    ) {
      return true;
    }

    current = current.cause;
  }

  return false;
}

function respondWithDatabaseError(res, error, context, unavailableMessage) {
  console.error(context, error);
  const unavailable = isServiceUnavailable(error);

  return res.status(unavailable ? 503 : 500).json({
    error: unavailable ? unavailableMessage : 'Error interno del servidor'
  });
}

module.exports = { isServiceUnavailable, respondWithDatabaseError };
