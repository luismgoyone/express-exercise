import express, { Express, Request, Response } from "express";
require("dotenv").config();
import { json } from "body-parser";
import { Pool } from "pg";

const port = process.env.PORT;
const user = process.env.DB_USER;
const host = process.env.DB_HOST;
const database = process.env.DB_DATABASE;
const password = process.env.DB_PASSWORD;
const db_port = process.env.DB_PORT;
const app = express();

app.use(json());

//database connection pool
const pool = new Pool({
  user,
  host,
  database,
  password,
  port: Number(db_port),
});

// test connect
pool.connect((err, client, done) => {
  if (err) {
    console.error("Error connecting to PostgreSQL:", err.message);
    return;
  }

  console.log("Connected to PostgreSQL database:", pool);

  // Release the client back to the pool
  done();
});

// test query
pool.query("SELECT * FROM posts", (err, result) => {
  if (err) {
    console.error("Error executing query", err);
  } else {
    console.log("Query result:", result.rows);
  }
});

// try endpoints implementation here...
app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server 😀✅");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
