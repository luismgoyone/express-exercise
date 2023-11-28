import express, { Router, Request, Response } from "express";

import { validateToken } from "../middlewares/validation";
import Connector from "../database/connector";

export const router: Router = express.Router();
const connector = Connector.getInstance();

// validate x-user-token in req headers
router.use("/logout", validateToken);

router.put("/logout", async (req: Request, res: Response) => {
  try {
    res.json({ message: "Ok" });
  } catch (e) {}
});
