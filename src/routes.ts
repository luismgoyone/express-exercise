import { Express } from "express";
import { authenticateToken } from "./middlewares/authenticateToken";
import { loginUser, logoutUser, registerUser } from "./controllers/auth";
import {
  createPost,
  updatePost,
  getAllPosts,
  getUserPosts,
} from "./controllers/post";

export function setupRoutes(app: Express): void {
  app.post("/register", registerUser);

  app.post("/login", loginUser);

  app.post(
    "/logout",
    authenticateToken, // validation inside this middleware (token verification)
    logoutUser
  );

  // get all posts
  app.get("/all-posts", authenticateToken, getAllPosts);

  // get list of user posts
  app.get("/user-posts/:userId", authenticateToken, getUserPosts);

  app.post("/create-post", authenticateToken, createPost);

  app.put("/update-post/:postId", authenticateToken, updatePost);

  app.delete("/delete-post/:postId", authenticateToken, updatePost);
}
