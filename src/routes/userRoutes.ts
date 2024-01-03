import { registerUser, loginUser, logoutUser } from "../controllers/userControllers"
import { Router } from "express";
const router = Router()
const bodyParser = require('body-parser').json();
import {verify} from "../auth";

	// registration
	router.post('/register',bodyParser, registerUser)

	//login
	router.post("/login",bodyParser,verify, loginUser)

	//logout
	router.post("/logout",verify, logoutUser)

module.exports = router;