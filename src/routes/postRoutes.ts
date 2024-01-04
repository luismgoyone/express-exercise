import { Router } from "express";
const router = Router()
import {verify} from "../auth";
import { getAllPosts, createPost } from "../controllers/postControllers";


    // view all
    router.get('/all-posts',verify, getAllPosts)

	// create post
	router.post('/create-post',verify, createPost)

	// //Update post
	// router.post("/update-post/",verify, loginUser)

	// //delete post
	// router.post("/logout",verify, logoutUser)

module.exports = router;