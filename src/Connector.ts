require("dotenv").config();

import knex, { Knex } from "knex";

enum DbClients {
  POSTGRES = "pg",
}

class Connector {
  static getPostgreInstance(): Knex {
    return knex({
      client: DbClients.POSTGRES,
      connection: {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        port: 5432,
      },
    });
  }
}

export default Connector;
