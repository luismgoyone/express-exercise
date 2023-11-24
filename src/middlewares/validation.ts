import { Request, Response, NextFunction } from "express";
import { Knex } from "knex";
import User from "../types/user";

export const validatePayload =
  (connector: Knex) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const body: User = req.body;
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
