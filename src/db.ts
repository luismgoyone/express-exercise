require("dotenv").config();
import { Pool } from "pg";

const user = process.env.DB_USER;
const host = process.env.DB_HOST;
const database = process.env.DB_DATABASE;
const password = process.env.DB_PASSWORD;
const db_port = process.env.DB_PORT;

//database connection pool
const pool = new Pool({
  user,
  host,
  database,
  password,
  port: Number(db_port),
});

export default pool;
