import express, { Router, Request, Response, NextFunction } from "express";

import User from "../types/user";
import Connector from "../database/connector";

export const router: Router = express.Router();

const connector = Connector.getInstance();

// validation middleware
router.use(async (req: Request, res: Response, next: NextFunction) => {
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
            FROM users
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
});

router.get("/register", async (req: Request, res: Response) => {
  const body: User = req.body;

  try {
    await connector.raw(
      `
            INSERT INTO users (first_name, last_name, username, password)
            VALUES (?, ?, ?, ?);
      `,
      [body.first_name, body.last_name, body.username, body.password]
    );

    res.status(200).json({ message: "User has been registered!" });
  } catch (e) {
    res
      .status(404)
      .json({ errors: `Something went wrong with the query, ${e}` });
  }
});
