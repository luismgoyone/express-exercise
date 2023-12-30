
import { registerUser } from "../controllers/userControllers"
import { Express } from "express";

export const routes = (app: Express):void => {

	// registration
	app.post('/register',registerUser)

	//login
	// app.post("/login", loginUser)

	//logout
	// app.post("/logout", logoutUser)
	
} 