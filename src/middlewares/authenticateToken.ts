import { NextFunction, Request, Response } from "express";
import { getUserLoginToken } from "../utils/getUserLoginToken";
import jwt from "jsonwebtoken";
import { secretKey } from "../constant/jwt_secret_key";

export const authenticateToken = async (
  req: Request | any,
  res: Response,
  next: NextFunction // bc it's a middleware lol
) => {
  const authorizationHeader = req.headers.authorization; // "Bearer [token]"
  const payloadToken = authorizationHeader?.split(" ")[1]; // "[token]"

  if (!payloadToken) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Token is missing.",
    });
  }

  const userLoginToken = await getUserLoginToken(payloadToken);

  // empty user login token from user_logins
  if (!userLoginToken.rows[0]?.token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: You've already been logged out",
    });
  }

  if (!userLoginToken.rows.length) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized: Invalid token." });
  }

  jwt.verify(payloadToken, secretKey as string, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};
