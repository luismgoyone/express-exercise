require('dotenv').config();

const knexConfig = require('../knexfile');
const ENV = process.env.ENV || 'dev';

class Connector {
  static getInstance() {
    return require('knex')(knexConfig[ENV]);
  }
}

module.exports = Connector;
