import express, { Router, Request, Response } from "express";

export const router: Router = express.Router();

router.get("/register", async (req: Request, res: Response) => {
  res.send("Working");
});
