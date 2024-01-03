import { Request, Response } from "express";
import pool from "../database";
import jwt from 'jsonwebtoken';

const registerUser = async (req:Request, res:Response) => {

    try{
        const {first_name,last_name,username,password} = req.body
        const userValidation = await pool.query('SELECT u FROM user_logins u WHERE u.username = $1', [username]);

        if(userValidation.rows.length > 0){
            return res.status(400).json({error:'username exist'})
        }

        if (password.length < 8) {
            return res
              .status(400)
              .json({ error: 'password too short, password must be at least 8 characters' });
          }

          const userResult = await pool.query(
            "INSERT INTO users (first_name, last_name) VALUES ($1, $2) RETURNING id, first_name, last_name",
            [first_name, last_name]
          );

          const userId = userResult.rows[0].id;

          await pool.query(
            "INSERT INTO user_logins (user_id, username, password) VALUES ($1, $2, $3)",
            [userId, username, password]
          );

        return res.status(201).json({ message: 'Registration successful', username });

    }
    catch(error){
        console.error('Error during registration:', error);
        return res.status(500).json({ error: 'Internal server error' });

    }

}

const loginUser = async (req:Request, res:Response) => {

  const secret = process.env.JWT_SECRET_KEY

  const {username,password} = req.body

  const loginUserResult = await pool.query(
    "SELECT username, password FROM user_logins WHERE username = $1 AND password = $2",
    [username, password]
  );

  if (!loginUserResult.rows.length) {
    return res.status(400).json({ error: "Invalid username or password." });
  }

  const user = loginUserResult.rows[0]
  const token = jwt.sign({ userId: user.id, username: user.username }, secret as string);

  res.json({ token });
  
  await pool.query(
    "UPDATE user_logins SET token= $2, last_login_at = CURRENT_TIMESTAMP WHERE username = $1",
    [username,token]
  );

  return res.status(201).json({ message: 'Welcome back!', username });

}
export { registerUser, loginUser };


// const logoutUser = () => {

// }


