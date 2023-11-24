import express, { Router, Request, Response } from "express";

import User from "../types/user";
import { validateRegisterPayload } from "../middlewares/validation";
import Connector from "../database/connector";

export const router: Router = express.Router();

const connector = Connector.getInstance();

// validation middleware
router.use("/register", validateRegisterPayload(connector));

router.post("/register", async (req: Request, res: Response) => {
  const body: Partial<User> = req.body;
  const { first_name, last_name, username, password } = body ?? {};

  try {
    await connector.raw(
      `
            INSERT INTO users (first_name, last_name)
            VALUES (?, ?);
        `,
      [first_name, last_name]
    );
    await connector.raw(
      `
            INSERT INTO user_logins (user_id, username, password)
            VALUES (currval('users_id_seq'), ?, ?);
        `,
      [username, password]
    );

    const query = await connector.raw(
      `
            SELECT
                u.id AS id,
                u.first_name AS first_name,
                u.last_name AS last_name,
                u_log.username AS username
            FROM users AS u
            INNER JOIN user_logins AS u_log
            ON u_log.user_id = u.id
            WHERE username = ?
            LIMIT 1;
        `,
      [username]
    );

    const user: Partial<User> = query.rows[0];

    res.status(200).json({ message: "User has been registered!", user });
  } catch (e) {
    res
      .status(404)
      .json({ errors: `Something went wrong with the query, ${e}` });
  }
});
