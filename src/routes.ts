import { Express, Request, Response } from "express";
import pool from "./db";

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

      // Insert into user_logins table
      const loginResult = await pool.query(
        "INSERT INTO user_logins (user_id, token, last_login_at, username, password) VALUES ($1, $2, CURRENT_TIMESTAMP, $3, $4) RETURNING user_id, token, username",
        [userId, "your_generated_token", username, password]
      );

      const userRecord = {
        id: loginResult.rows[0].user_id,
        first_name: userResult.rows[0].first_name,
        last_name: userResult.rows[0].last_name,
        username: loginResult.rows[0].username,
      };

      console.log("success hehe!");
      return res.status(201).json(userRecord);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  });
}