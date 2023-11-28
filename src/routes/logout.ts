import express, { Router, Request, Response } from "express";

import { validateToken } from "../middlewares/validation";
import Connector from "../database/connector";
import User from "../types/user";

export const router: Router = express.Router();
const connector = Connector.getInstance();

// validate x-user-token in req headers
router.use("/logout", validateToken);

router.put("/logout", async (req: Request, res: Response) => {
  const body: Partial<User> = req.body;
  const { username } = body;

  try {
    await connector.raw(
      `
            UPDATE user_logins
            SET
                token = null
            WHERE
                username = ?
        `,
      [username]
    );

    res.status(200).json({ message: "success" });
  } catch (e) {
    res
      .status(404)
      .json({ errors: `Something went wrong with the query, ${e}` });
  }
});
