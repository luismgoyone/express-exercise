import { Request, Response } from "express";
import pool from "../database";

export const registerUser = async (req:Request, res:Response) => {

    try{
        const {first_name,last_name,username,password} = req.body

        console.log(req.body)
        console.log(999999,first_name,last_name,username,password)

        // const userValidation = await pool.query('SELECT u FROM user_logins u WHERE u.username = $1', [username]);

        // console.log(userValidation)
        // if(userValidation.rows.length > 0){
        //     return res.status(400).json({error:'username exist'})
        // }

        // // if (password.length < 8) {
        // //     return res
        // //       .status(400)
        // //       .json({ error: 'password too short, password must be at least 8 characters' });
        // //   }

        
        //   const userResult = await pool.query(
        //     "INSERT INTO users (first_name, last_name) VALUES ($1, $2) RETURNING id, first_name, last_name",
        //     [first_name, last_name]
        //   );
      
        //   const userId = userResult.rows[0].id;

        //   await pool.query(
        //     "INSERT INTO user_logins (user_id, token, last_login_at, username, password) VALUES ($1, $2, $3, $4, $5)",
        //     [userId, null, null, username, password]
        //   );

        // res.status(201).json({ message: 'Registration successful', username });

    }
    catch(error){
        console.error('Error during registration:', error);
        return res.status(500).json({ error: 'Internal server error' });

    }
}

// const loginUser = () => {

// }

// const logoutUser = () => {

// }


