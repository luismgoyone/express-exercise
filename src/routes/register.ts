import express, { Router, Request, Response, NextFunction } from "express";

import User from "../types/user";
import { validateRegisterPayload } from "../middlewares/validation";
import Connector from "../database/connector";

export const router: Router = express.Router();

const connector = Connector.getInstance();

// validation middleware
router.use(validateRegisterPayload(connector));

router.post("/", async (req: Request, res: Response) => {
  const body: User = req.body;
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

    res.status(200).json({ message: "User has been registered!" });
  } catch (e) {
    res
      .status(404)
      .json({ errors: `Something went wrong with the query, ${e}` });
  }
});
