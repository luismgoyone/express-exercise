import { Express } from "express";
import { authenticateToken } from "./middlewares/authenticateToken";
import { loginUser, logoutUser, registerUser } from "./controllers/auth";

export function setupRoutes(app: Express): void {
  // Register user
  app.post("/register", registerUser);

  // Login user
  app.post("/login", loginUser);

  // Logout user
  app.post(
    "/logout",
    authenticateToken, // validation inside this middleware,
    logoutUser
  );
}
