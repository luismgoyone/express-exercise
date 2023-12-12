require('dotenv').config();

const knexConfig = require('../knexfile');
const ENV = process.env.ENV || 'dev';

class Connector {
  static getInstance() {
    return require('knex')(knexConfig[ENV]);
  }
}

// TODO: Determine in which parts of the code to call knex.destroy();

module.exports = Connector;
