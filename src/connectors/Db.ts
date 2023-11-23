import knex, { Knex } from 'knex'

class Database {
  static connector: Knex
  constructor() {
    Database.connector = knex({
      client: process.env.DATABASE_CLIENT,
      connection: {
        database: process.env.DATABASE_NAME,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASS,
        host: process.env.DATABASE_HOST,
        port: 5432,
      },
    })
  }
}

export default Database