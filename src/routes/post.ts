import express, { Router, Request, Response } from "express";

import Post from "../types/post";
import { validateToken } from "../middlewares/validation";
import Connector from "../database/connector";

export const router: Router = express.Router();
const connector = Connector.getInstance();

// validate x-user-token in req headers
router.use("/post", validateToken);

router.post("/post", async (req: Request, res: Response) => {
  const body: Post = req.body;
  const { user_id, content } = body;

  try {
    const query = await connector.raw(
      `
            INSERT INTO posts (user_id, content)
            VALUES (?, ?)
            RETURNING *; 
        `,
      [user_id, content]
    );

    const [post] = query.rows;

    res.status(200).json({ post });
  } catch (e) {
    res
      .status(404)
      .json({ errors: `Something went wrong with the query, ${e}` });
  }
});
