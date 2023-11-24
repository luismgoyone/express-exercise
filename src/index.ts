require("dotenv").config();

import express, { Express } from "express";

import { router as RegisterRouter } from "./routes/register";
import { router as LoginRouter } from "./routes/login";

const app: Express = express();
const PORT: number = Number(process.env.PORT) ?? 3001;
const prefix = "/api/user";

app.use(express.json());

app.use(prefix, RegisterRouter);
app.use(prefix, LoginRouter);

app.listen(PORT, () => console.log("Connected to server"));
