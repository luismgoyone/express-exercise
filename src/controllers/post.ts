import { Request, Response } from "express";
import pool from "../db";
import { getUserLoginToken } from "../utils/getUserLoginToken";

const createPost = async (req: Request, res: Response) => {
  try {
    const authorizationHeader = req.headers.authorization; // "Bearer <token>"
    const payloadToken = authorizationHeader?.split(" ")[1]; // "<token>"

    const userLoginToken = await getUserLoginToken(payloadToken);

    const userId = userLoginToken.rows[0].user_id;
    const { content } = req.body;

    // insert into the posts table
    const postResult = await pool.query(
      "INSERT INTO posts (user_id, content, created_at) VALUES ($1, $2, CURRENT_TIMESTAMP) RETURNING id, content",
      [userId, content]
    );

    const createdPost = postResult.rows[0];

    return res.status(201).json(createdPost);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const updatePost = async (req: Request, res: Response) => {
  try {
    const authorizationHeader = req.headers.authorization; // "Bearer <token>"
    const payloadToken = authorizationHeader?.split(" ")[1]; // "<token>"

    const userLoginToken = await getUserLoginToken(payloadToken);
    const userId = userLoginToken.rows[0].user_id;

    const postId = req.params.postId;
    const { content } = req.body;

    // check if the user is the owner of the post
    const postOwnerResult = await pool.query(
      "SELECT user_id FROM posts WHERE id = $1",
      [postId]
    );

    if (
      !postOwnerResult.rows.length ||
      postOwnerResult.rows[0].user_id !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You don't have permission to update this post.",
      });
    }

    // uipdate post
    const updateResult = await pool.query(
      "UPDATE posts SET content = $1 WHERE id = $2 RETURNING id, content",
      [content, postId]
    );

    const updatedPost = updateResult.rows[0];

    return res.status(200).json(updatedPost);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const deletePost = async (req: Request | any, res: Response) => {
  try {
    const authorizationHeader = req.headers.authorization; // "Bearer <token>"
    const payloadToken = authorizationHeader?.split(" ")[1]; // "<token>"

    const userLoginToken = await getUserLoginToken(payloadToken);
    const userId = userLoginToken.rows[0].user_id;

    const postId = req.params.postId;

    // check if the user is the owner of the post
    const postOwnerResult = await pool.query(
      "SELECT user_id FROM posts WHERE id = $1",
      [postId]
    );

    if (
      !postOwnerResult.rows.length ||
      postOwnerResult.rows[0].user_id !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You don't have permission to delete this post.",
      });
    }

    // delete post
    const deleteResult = await pool.query(
      "DELETE FROM posts WHERE id = $1 RETURNING id, content",
      [postId]
    );

    const deletedPost = deleteResult.rows[0];

    return res.status(200).json(deletedPost);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const getUserPosts = async (req: Request, res: Response) => {
  try {
    const authorizationHeader = req.headers.authorization; // "Bearer <token>"
    const payloadToken = authorizationHeader?.split(" ")[1]; // "<token>"

    const userLoginToken = await getUserLoginToken(payloadToken);
    const userId = userLoginToken.rows[0].user_id;

    const userIdParam = req.params.userId; // extracting user id from the URL parameter

    // validate if the authenticated user is the same as the requested user id
    if (userId !== parseInt(userIdParam, 10)) {
      return res.status(403).json({
        success: false,
        message:
          "Forbidden: You do not have permission to access this resource.",
      });
    }

    // fetch posts for the authenticated user
    const postsResult = await pool.query(
      "SELECT id, content FROM posts WHERE user_id = $1",
      [userId]
    );

    const userPosts = postsResult.rows.map((post) => ({
      id: post.id,
      content: post.content,
    }));

    return res.status(200).json({ data: userPosts });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const getAllPosts = async (req: Request, res: Response) => {
  try {
    // ffetch all posts sorted by most recent created_at
    const postsResult = await pool.query(`
        SELECT posts.id, content, first_name, last_name, user_logins.username
        FROM posts
        INNER JOIN users ON posts.user_id = users.id
        INNER JOIN user_logins ON users.id = user_logins.user_id
        ORDER BY created_at DESC
  `);

    const allPosts = postsResult.rows.map((post) => ({
      id: post.id,
      content: post.content,
      first_name: post.first_name,
      last_name: post.last_name,
      username: post.username,
    }));

    return res.status(200).json({ data: allPosts });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export { createPost, updatePost, deletePost, getUserPosts, getAllPosts };
