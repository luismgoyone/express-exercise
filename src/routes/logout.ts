import express, { Router, Request, Response } from "express";

import User from "../types/user";
import { validateToken } from "../middlewares/validation";
import Connector from "../database/connector";

export const router: Router = express.Router();
const connector = Connector.getInstance();

// validate x-user-token in req headers
router.use("/logout", validateToken);

router.put("/logout", async (req: Request, res: Response) => {
  const { userId } = res.locals;

  if (!userId) {
    res.status(400).json({ message: "Something went wrong!" });
    return;
  }

  try {
    await connector.raw(
      `
            UPDATE user_logins
            SET
                token = null
            WHERE
                user_id = ?
        `,
      [userId]
    );

    res.status(200).json({ message: "success" });
  } catch (e) {
    res
      .status(404)
      .json({ errors: `Something went wrong with the query, ${e}` });
  }
});
