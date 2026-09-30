const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');
const config = require('./env');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Messages (Cloudflared)',
      version: '1.0.0',
      description: 'API de gestion de messages avec base de données PostgreSQL',
    },
    servers: [
      {
        url: config.server.url,
        description: `Serveur (${config.env})`,
      },
    ],
  },
  // We point apis to the routes file where the JSDoc is written
  apis: [path.join(__dirname, '../routes/*.js')],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

module.exports = swaggerSpec;
