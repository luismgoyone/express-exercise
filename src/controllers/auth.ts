import { Request, Response } from "express";
import pool from "../db";
import { secretKey } from "../constant/jwt_secret_key";
import jwt from "jsonwebtoken";
import { getUserLoginToken } from "../utils/getUserLoginToken";

// Register user
const registerUser = async (req: Request, res: Response) => {
  try {
    const { first_name, last_name, username, password } = req.body;

    // Validations
    // Check if the username already exists
    const usernameCheck = await pool.query(
      "SELECT user_id, username FROM user_logins WHERE username = $1",
      [username]
    );

    if (usernameCheck.rows.length > 0) {
      return res.status(400).json({ error: "Username already exists." });
    }

    // Validate password length
    if (password.length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters long." });
    }

    // Insert into users table
    const userResult = await pool.query(
      "INSERT INTO users (first_name, last_name) VALUES ($1, $2) RETURNING id, first_name, last_name",
      [first_name, last_name]
    );

    const userId = userResult.rows[0].id;

    // Insert into user_logins table (token and last_login_at should be empty/null cause there's no logging process yet only registration)
    await pool.query(
      "INSERT INTO user_logins (user_id, token, last_login_at, username, password) VALUES ($1, $2, $3, $4, $5)",
      [userId, null, null, username, password]
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
    return res.status(201).json(completeUserRecord); // specific row
    // return res.status(201).json(completeUserResult.rows); // if i want to return the array of rows
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const loginUser = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // Check if the username and password combi is valid
    // TODO: Check if JOIN usage is correct
    const loginResult = await pool.query(
      "SELECT users.id, first_name, last_name, username, token FROM users INNER JOIN user_logins ON users.id = user_logins.user_id WHERE username = $1 AND password = $2",
      [username, password]
    );

    // const checkUsername = await pool.query("SELECT * from user")
    if (!loginResult.rows.length) {
      return res.status(400).json({ error: "Invalid username or password." });
    }

    if (!loginResult.rows.length && !loginResult.rows[0].username.length) {
      return res.status(400).json({ error: "username does not exist" });
    }

    const user = loginResult.rows[0];

    // Create a JWT token with a randomly generated key
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
      },
      secretKey as string,
      { expiresIn: "1h" } // expiration time
    );

    // Update the user_logins table with the new token + update last login
    await pool.query(
      "UPDATE user_logins SET token = $1, last_login_at = CURRENT_TIMESTAMP WHERE user_id = $2",
      [token, user.id]
    );

    const userRecord = {
      id: loginResult.rows[0].id,
      first_name: loginResult.rows[0].first_name,
      last_name: loginResult.rows[0].last_name,
      username: loginResult.rows[0].username,
      token: token,
    };

    console.log("login success!");
    return res.status(200).json(userRecord);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const logoutUser = async (req: Request, res: Response) => {
  try {
    const authorizationHeader = req.headers.authorization; // "Bearer <token>"
    const payloadToken = authorizationHeader?.split(" ")[1]; // "<token>"

    const userLoginToken = await getUserLoginToken(payloadToken);

    const userId = userLoginToken.rows[0].user_id;

    await pool.query("UPDATE user_logins SET token = null WHERE user_id = $1", [
      userId,
    ]);

    const successResponse = {
      success: true,
    };

    return res.status(200).json(successResponse);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export { registerUser, loginUser, logoutUser };
