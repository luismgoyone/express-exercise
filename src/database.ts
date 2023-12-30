
require("dotenv").config();
import { Pool } from "pg";



//database connection pool
const pool = new Pool({
    user: process.env.DATABASE_USER,
    host: process.env.DATABASE_HOST,
    database: process.env.DATABASE_DATABASE,
    password: process.env.DATABASE_PASSWORD,
    port: Number(process.env.DATABASE_PORT)
  });

export default pool;