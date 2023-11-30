import { Express, Request, Response } from "express";
import pool from "./db";
import crypto from "crypto";

export function setupRoutes(app: Express): void {
  // Register user
  app.post("/register", async (req: Request, res: Response) => {
    try {
      const { first_name, last_name, username, password } = req.body;

      // Validate password length
      if (password.length < 8) {
        return res
          .status(400)
          .json({ error: "Password must be at least 8 characters long." });
      }

      // Check if the username already exists
      const usernameCheck = await pool.query(
        "SELECT user_id, username FROM user_logins WHERE username = $1",
        [username]
      );

      if (usernameCheck.rows.length > 0) {
        return res.status(400).json({ error: "Username already exists." });
      }

      // TODO: validate all fields

      // Insert into users table
      const userResult = await pool.query(
        "INSERT INTO users (first_name, last_name) VALUES ($1, $2) RETURNING id, first_name, last_name",
        [first_name, last_name]
      );

      const userId = userResult.rows[0].id;

      const generatedToken = crypto.randomBytes(32).toString("hex");
      // Insert into user_logins table
      await pool.query(
        "INSERT INTO user_logins (user_id, token, last_login_at, username, password) VALUES ($1, $2, CURRENT_TIMESTAMP, $3, $4) RETURNING user_id, token, username",
        [userId, generatedToken, username, password]
      );

      // Join users and user_logins tables to get a complete user record
      const completeUserResult = await pool.query(
        "SELECT users.id, first_name, last_name, username FROM users INNER JOIN user_logins ON users.id = user_logins.user_id WHERE users.id = $1",
        [userId]
      );

      const completeUserRecord = {
        id: completeUserResult.rows[0].id,
        first_name: completeUserResult.rows[0].first_name,
        last_name: completeUserResult.rows[0].last_name,
        username: completeUserResult.rows[0].username,
      };

      console.log("success hehe!");
      return res.status(201).json(completeUserRecord);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // -----------------------------------------------------------------

  // Login user
  app.post("/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;

      // Check if the username exists
      const userResult = await pool.query(
        "SELECT * FROM user_logins WHERE username = $1",
        [username]
      );

      if (userResult.rows.length === 0) {
        return res.status(400).json({ error: "Invalid username or password." });
      }

      const userId = userResult.rows[0].id;

      // Check if the username and password combination is valid
      const loginResult = await pool.query(
        "SELECT * FROM user_logins WHERE username = $1 AND password = $2",
        [username, password]
      );

      if (loginResult.rows.length === 0) {
        return res.status(400).json({ error: "Invalid username or password." });
      }

      const userRecord = {
        id: userId,
        first_name: userResult.rows[0].first_name,
        last_name: userResult.rows[0].last_name,
        username: username,
        token: loginResult.rows[0].token,
      };

      console.log("login success!");
      return res.status(200).json(userRecord);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  });
}
