const config = require('../config/env');

const swaggerAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Swagger API Documentation"');
    return res.status(401).send('Authentication Required');
  }

  try {
    const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    const user = auth[0];
    const pass = auth[1];

    const expectedUser = config.swagger?.user;
    const expectedPass = config.swagger?.password;
    if (!expectedUser || !expectedPass) {
      return res.status(503).send('Swagger auth not configured.');
    }

    if (user === expectedUser && pass === expectedPass) {
      return next();
    }
  } catch (err) {
    // If decoding or split fails, treat as unauthorized
  }

  res.setHeader('WWW-Authenticate', 'Basic realm="Swagger API Documentation"');
  return res.status(401).send('Authentication Required');
};

module.exports = swaggerAuth;
