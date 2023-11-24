require("dotenv").config();

import express, { Express } from "express";
import bodyParser from "body-parser";

import { router as RegisterRouter } from "./routes/register";

const app: Express = express();
const PORT: number = Number(process.env.PORT) ?? 3001;

app.use(bodyParser());

app.use("/api/user", RegisterRouter);

app.listen(PORT, () => console.log("Connected to server"));
