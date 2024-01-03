
import { registerUser } from "../controllers/userControllers"
import { Router } from "express";
const router = Router()
const bodyParser = require('body-parser').json();

	// registration
	router.post('/register',bodyParser, registerUser)

	//login
	// app.post("/login", loginUser)

	//logout
	// app.post("/logout", logoutUser)
	



module.exports = router;