// import pkg from 'pg';
// const { Client } = pkg;
const { Client } = require('pg');

const client = new Client({
    host: "localhost",
    user: "postgres",
    port: 5432,
    password: "admin",
    database: "exercise1"
});

module.exports = client;