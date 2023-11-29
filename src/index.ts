import express, { Request, Response } from "express";
require("dotenv").config();
import { json } from "body-parser";
import pool from "./db";
import { setupRoutes } from "./routes";

const port = process.env.PORT;

const app = express();

app.use(json());

// test db connection
//-------------------------------------------------------------------
pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
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
//-------------------------------------------------------------------

// try endpoints implementation here...
app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server 😀✅");
});

//----------------------------------------------------------------------
// Setup routes
setupRoutes(app);
//----------------------------------------------------------------------

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
