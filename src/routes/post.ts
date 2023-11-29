import express, { Router, Request, Response } from "express";

import Post from "../types/post";
import { validateToken } from "../middlewares/validation";
import Connector from "../database/connector";

export const router: Router = express.Router();
const connector = Connector.getInstance();

// validate x-user-token in req headers
router.use("/post", validateToken);

router.get("/post", async (req: Request, res: Response) => {
  try {
    const query = await connector.raw(
      `
            SELECT
                p.id AS id,
                p.content AS content,
                u.first_name AS first_name,
                u.last_name AS last_name,
                u_log.username AS username
            FROM users AS u
            INNER JOIN user_logins AS u_log
            ON u.id = u_log.user_id
            INNER JOIN posts AS p
            ON u_log.user_id = p.user_id;
        `
    );

    const posts = query.rows;

    res.status(200).json({ data: posts });
  } catch (e) {
    res
      .status(404)
      .json({ errors: `Something went wrong with the query, ${e}` });
  }
});

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

router.get("/post/:userId", async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const query = await connector.raw(
      `
              SELECT
                  id,
                  content
              FROM posts
              WHERE user_id = ?
          `,
      [userId]
    );

    const posts = query.rows;

    res.status(200).json({ data: posts });
  } catch (e) {
    res
      .status(404)
      .json({ errors: `Something went wrong with the query, ${e}` });
  }
});

router.put("/post/:postId", async (req: Request, res: Response) => {
  const { postId } = req.params;
  const body: Partial<Post> = req.body;
  const { content } = body;

  if (!content) {
    res.status(400).json({ errors: "Content payload is required." });
    return;
  }

  try {
    const query = await connector.raw(
      `
          UPDATE posts
          SET content = ?
          WHERE id = ?
          RETURNING id, content;
      `,
      [content, postId]
    );

    const [post] = query.rows;

    res.status(200).json(post);
  } catch (e) {
    res
      .status(404)
      .json({ errors: `Something went wrong with the query, ${e}` });
  }
});

router.delete("/post/:postId", async (req: Request, res: Response) => {
  const { postId } = req.params;

  try {
    const query = await connector.raw(
      `
          DELETE FROM posts
          WHERE id = ?
          RETURNING id, content;
      `,
      [postId]
    );

    const [post] = query.rows;

    res.status(200).json(post);
  } catch (e) {
    res
      .status(404)
      .json({ errors: `Something went wrong with the query, ${e}` });
  }
});
