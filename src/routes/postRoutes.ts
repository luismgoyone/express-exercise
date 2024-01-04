import { Router } from "express";
const router = Router()
import {verify} from "../auth";
import { getAllPosts, createPost, getUserPost, updatePost } from "../controllers/postControllers";


    // view all
    router.get('/all-posts',verify, getAllPosts)

	// create post
	router.post('/create-post',verify, createPost)

    //get user posts
    router.get('/user-post/:user_id',verify,getUserPost)

	//Update post
	router.put("/update-post/:post_id",verify, updatePost)

	// //delete post
	// router.post("/logout",verify, logoutUser)

module.exports = router;