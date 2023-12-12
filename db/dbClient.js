require('dotenv').config();

const knexConfig = require('./knexfile');
const ENV = process.env.ENV || 'dev';

const knex = require('knex')(knexConfig[ENV]);

module.exports = knex;
