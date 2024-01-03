import { registerUser, loginUser } from "../controllers/userControllers"
import { Router } from "express";
const router = Router()
const bodyParser = require('body-parser').json();
import {verify} from "../auth";

	// registration
	router.post('/register',bodyParser, registerUser)

	//login
	router.post("/login",bodyParser,verify, loginUser)

	//logout
	// app.post("/logout", logoutUser)

module.exports = router;