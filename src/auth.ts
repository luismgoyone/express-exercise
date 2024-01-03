import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from "express";
import pool from './database';
require("dotenv").config();

const secret = process.env.JWT_SECRET_KEY
const verify = async (req:Request | any, res:Response, next: NextFunction) => {

    const tokenHeader = req.headers.authorization
    const token = tokenHeader?.slice(7, tokenHeader.length)

    if(!token){
        return res.status(401).json({ message: 'Failed: no Token' });
    }

      jwt.verify(token, secret as string, (err: any, decodedToken: any) => {
        if (err) return res.sendStatus(403);
        req.user = decodedToken;
        next();
});
}

export { verify }
