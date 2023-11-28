require("dotenv").config();

import { Request, Response, NextFunction } from "express";
import { Knex } from "knex";

import User from "../types/user";
import { LogoutHeaders } from "../types/headers";

export const validateRegisterPayload =
  (connector: Knex) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const body: Partial<User> = req.body;
    const { first_name, last_name, username, password } = body ?? {};

    try {
      if (first_name && last_name && username && password) {
        if (password.length < 8) {
          res
            .status(400)
            .json({ message: "Password must at least be 8 characters long." });
          return;
        }

        const query = await connector.raw(
          `
              SELECT username
              FROM users AS u
              INNER JOIN user_logins AS u_log
              ON u_log.user_id = u.id
              WHERE username = ?;
          `,
          [username]
        );

        if (query.rows.length > 0) {
          res.status(400).json({ message: "User already exists!" });
          return;
        }
      } else {
        res.status(400).json({ message: "Incorrect payload type." });
        return;
      }
    } catch (e) {
      res
        .status(404)
        .json({ errors: `Something went wrong with the query, ${e}` });
      return;
    }

    next();
  };

export const validateLoginPayload =
  (connector: Knex) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body: Partial<User> = req.body;
      const { username, password } = body;

      if (username && password) {
        const query = await connector.raw(
          `
                SELECT
                    u_log.user_id AS id,
                    u_log.username AS username,
                    u_log.password AS password
                FROM users AS u
                INNER JOIN user_logins AS u_log
                ON u.id = u_log.user_id
                WHERE u_log.username = ?
                LIMIT 1;
            `,
          [username]
        );

        const user: Partial<User> = query.rows[0];

        if (query.rows.length == 0 || user.password !== password) {
          res
            .status(400)
            .json({ message: "Invalid User credentials. Please try again." });
          return;
        }

        res.locals.userId = user.id;
      } else {
        res.status(400).json({ message: "Incorrect payload type." });
        return;
      }
    } catch (e) {
      res
        .status(404)
        .json({ errors: `Something went wrong with the query, ${e}` });
      return;
    }

    next();
  };

export const validateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const headers: LogoutHeaders = req.headers;
  const userToken = headers["x-user-token"];
  const userId = headers["x-user-id"];

  if (!userToken && !userId) {
    res
      .status(400)
      .send({ message: "No x-user-token found in request headers" });
    return;
  }

  const jwt = require("jsonwebtoken");

  try {
    const decoded: Partial<User> = jwt.verify(
      userToken,
      process.env.SECRET_KEY
    );

    if (!decoded.id || decoded.id !== userId) {
      res.status(400).json({ message: "Invalid Token" });
      return;
    }

    res.locals.userId = decoded.id;
  } catch (e) {
    res.status(404).json({ errors: `Something went wrong ${e}` });
    return;
  }
  next();
};
