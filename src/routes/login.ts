require("dotenv").config();

import express, { Router, Request, Response } from "express";

import User from "../types/user";
import { validateLoginPayload } from "../middlewares/validation";
import Connector from "../database/connector";

export const router: Router = express.Router();
const connector = Connector.getInstance();

const jwt = require("jsonwebtoken");

// validation middleware
router.use("/login", validateLoginPayload(connector));

router.put("/login", async (req: Request, res: Response) => {
  const body: Partial<User> = req.body;
  const { username } = body;

  const token = jwt.sign({ username }, process.env.SECRET_KEY);
  const date = new Intl.DateTimeFormat("en-PH", {
    dateStyle: "full",
    timeStyle: "long",
  }).format(Date.now());

  try {
    await connector.raw(
      `
            UPDATE user_logins
            SET
              token = ?,
              last_login_at = ?
            WHERE
              username = ?;
      `,
      [token, date, username]
    );

    const query = await connector.raw(
      `
            SELECT
                u.id AS id,
                u.first_name AS first_name,
                u.last_name AS last_name,
                u_log.username AS username,
                u_log.token AS token
            FROM users AS u
            INNER JOIN user_logins AS u_log
            ON u.id = u_log.user_id
            WHERE u_log.username = ?
            LIMIT 1;
        `,
      [username]
    );

    const user = query.rows[0];

    res.status(200).json({ user });
  } catch (e) {
    res
      .status(404)
      .json({ errors: `Something went wrong with the query, ${e}` });
  }
});
