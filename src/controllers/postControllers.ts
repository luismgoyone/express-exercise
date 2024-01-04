import { Request, Response } from "express";
import pool from "../database";


const getAllPosts = async (req:Request, res:Response) => {
    try {
        const allPostQuery = await pool.query("SELECT posts.id, content, first_name,last_name, user_logins.username from posts INNER JOIN users ON posts.user_id = users.id INNER JOIN user_logins ON users.id = user_logins.user_id ORDER BY created_at DESC")
        
        if(allPostQuery.rows.length === 0)
        {
            return res.status(200).json({ message: 'No Post' });
        }

        const AllPostsList = allPostQuery.rows.map((post) => ({ 
            id: post.id,
            content: post.content,
            first_name:post.first_name,
            last_name: post.last_name,
            username: post.username
        }));

        return res.status(200).json({ data: AllPostsList });


    } catch (error) {
        return res.status(500).json({ error: 'Error getting All Post' });
    }
}
const createPost = async (req:Request, res:Response) => {

    try {
   
        const { content,user_id } = req.body

        const createPostResult = await pool.query("INSERT INTO posts (user_id, content, created_at) VALUES ($1, $2, CURRENT_TIMESTAMP) RETURNING id, content", [user_id,content,]);


        const postResponse = { content: createPostResult.rows[0].content };
    return res.status(201).json({ message: 'Post created successfully', post: postResponse });

    } catch (error) {
        return res.status(500).json({ error: 'Error creating post' });
    }

}

const getUserPost = async  (req:Request, res:Response) => {
    try {

    const {user_id} = req.params

    const getUserPostResult = await pool.query("SELECT id,content from posts where user_id = $1",[user_id])

    if(getUserPostResult.rows.length === 0){
        return res.status(200).json({ message: 'No User Post' });
    }

    const userPosts = getUserPostResult.rows.map((post) => ({ 
        id: post.id,
        content: post.content
    }));

    return res.status(200).json({ data: userPosts });

    } catch (error) {
        return res.status(500).json({ error: 'Error getting user posts' });
    }
}


export {getAllPosts, createPost, getUserPost}