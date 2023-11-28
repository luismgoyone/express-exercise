const express = require('express');
const { Pool } = require('pg');
const { generateToken } = require('./utils');

const app = express();
const port = 3000;

const pool = new Pool({
    host: "localhost",
    user: "postgres",
    password: "booky123",
    port: "5432",
    database: "exercise"
});


app.use(express.json());

app.post('/register', async(request, response) => {
    const { firstName, lastName, username, password } = request.body;

    //check if password is at least 8 characters long
    if(password.length < 8) {
        return response.status(400).json({
            error: `Password must be at least 8 characters long`
        });
    }

    const client = await pool.connect();
    
    try {
        //check if username already exists
        const usernameExists = await client.query(`
            SELECT * 
            FROM user_logins 
            WHERE username = $1
        `, [username]);

        if(usernameExists.rows.length > 0) {
            return response.status(400).json({
                error: `The username [${username}] already exists`
            });
        }
        //insert new user to users table
        const userResult = await client.query(`
            INSERT INTO users (first_name, last_name)
            VALUES ($1, $2) 
            RETURNING id
        `, [firstName, lastName]);

        const userID = userResult.rows[0].id;

        //insert new user login information to user_logins table
        await client.query(`
            INSERT INTO user_logins (user_id, username, password)
            VALUES ($1, $2, $3) 
            RETURNING *
        `, [userID, username, password]);

        //get user record and send it
        const userRecord = await client.query(`
            SELECT u.id, u.first_name, u.last_name, ul.username 
            FROM users u 
            JOIN user_logins ul ON u.id = ul.user_id 
            WHERE u.id = $1
        `, [userID]);

        response.status(200).json({
            status: 'success',
            message: 'User registered successfully',
            user: userRecord.rows[0]
        });

    } catch (error) {
        console.log(`An error occurred: ${error}`);
        response.status(500).json({
            error: 'Internal Server Error'
        });
    } finally {
        client.release();
    }
});

app.post('/login', async(request, response) => {
    const { username, password } = request.body;

    const client = await pool.connect();

    try {
        //get user login credentials
        const userLoginResult = await client.query(`
            SELECT * 
            FROM user_logins
            WHERE username = $1
        `, [username]); 

        //check if username exists
        if(userLoginResult.rows.length === 0) {
            return response.status(401).json({
                error: 'Username does not exists'
            });
        }

        const userLogin = userLoginResult.rows[0];

        //check if username and password is valid
        if(username !== userLogin.username || password !== userLogin.password) {
            return response.status(401).json({
               error: 'Invalid username or password' 
            });
        }

        //create token, timestamp and update user_logins
        const token = generateToken(16);
        const currentTime = new Date().toISOString();
        await client.query(`
            UPDATE user_logins
            SET token = $1, last_login_at = $2
            WHERE username = $3
        `, [token, currentTime ,username]);

        //get user info
        const userLoginInfo = await client.query(`
            SELECT u.id, u.first_name, u.last_name, ul.username, ul.token 
            FROM users u 
            JOIN user_logins ul ON u.id = ul.user_id 
            WHERE ul.username = $1
        `, [username]);

        response.status(200).json({
            status: 'success',
            message: 'User logged in successfully',
            user: userLoginInfo.rows[0]
        });

    } catch (error) {
        console.log(`An error occurred: ${error}`);
        response.status(500).json({
            error: 'Internal Server Error'
        });
    } finally {
        client.release();
    }
});

app.post('/logout', async(request, response) => {
    const token = request.headers.authorization;
    
    // check if there is token 
    if(!token) {
        return response.status(401).json({
            error: 'Unauthorized: Token is missing'
        });
    }

    const client = await pool.connect();
    
    try {
        // update token to null
        await client.query(`
            UPDATE user_logins
            SET token = null
            WHERE token = $1
        `, [token]);

        response.status(200).json({
            success: true
        });

    } catch (error) {
        console.log(`An error occurred: ${error}`);
        response.status(500).json({
            error: 'Internal Server Error'
        });
    } finally {
        client.release();
    }
});

app.post('/posts', async(request, response) => {
    const token = request.headers.authorization;

    // check if there is token
    if(!token) {
        return response.status(401).json({
            error: 'Unauthorized: Token is missing'
        });
    }

    const client = await pool.connect();

    try {
        // get token in database
        const tokenResult = await client.query(`
            SELECT * 
            FROM user_logins
            WHERE token = $1
        `, [token]);

        const user = tokenResult.rows[0];

        // check if token is in database
        if(user.token !== token) {
            return response.status(401).json({
                error: 'Unauthorized: Token is not in database'
            });
        }

        // get all posts
        const postsResult = await client.query(`
            SELECT p.id, p.content, u.first_name, u.last_name, ul.username
            FROM posts p
            JOIN users u ON p.user_id = u.id
            JOIN user_logins ul ON u.id = ul.user_id
            ORDER BY created_at ASC
        `);

        response.status(200).json({
            data: postsResult.rows
        });

    } catch (error) {
        console.log(`An error occurred: ${error}`);
        response.status(500).json({
            error: 'Internal Server Error'
        });
    } finally {
        client.release();
    }
});

app.post('/posts/user', async(request, response) => {
    const token = request.headers.authorization;
    const user_id = request.body.user_id;
    
    // check if there is token
    if(!token) {
        return response.status(401).json({
            error: 'Unauthorized: Token is missing'
        });
    }

    // check if there is user id
    if(!user_id) {
        return response.status(401).json({
            error: 'user_id field is missing'
        });
    }

    const client = await pool.connect();

    try {
        // get token in database
        const tokenResult = await client.query(`
            SELECT * 
            FROM user_logins
            WHERE token = $1
        `, [token]);

        const user = tokenResult.rows[0];
        
        // check if token is in database
        if(user.token !== token) {
            return response.status(401).json({
                error: 'Unauthorized: Token is not in database'
            });
        }

        // check if user_id is in database
        if (user.user_id !== user_id) {
            return response.status(401).json({
                error: 'Unauthorized: Invalid user id' 
             });
        }

        // get all posts from user 
        const userPostsResult = await client.query(`
            SELECT id, content 
            FROM posts
            WHERE user_id = $1
        `, [user_id]); 

        response.status(200).json({
            data: userPostsResult.rows
        });

    } catch (error) {
        console.log(`An error occurred: ${error}`);
        response.status(500).json({
            error: 'Internal Server Error'
        });
    } finally {
        client.release();
    }
});

app.post('/posts/create', async(request, response) => {
    const token = request.headers.authorization;
    const { user_id, content } = request.body;

    // check if there is token
    if(!token) {
        return response.status(401).json({
            error: 'Unauthorized: Token is missing'
        });
    }

    // check if there is user id
    if(!user_id) {
        return response.status(401).json({
            error: 'user_id field is missing'
        });
    }

    const client = await pool.connect();

    try {
        // get token in database
        const tokenResult = await client.query(`
            SELECT * 
            FROM user_logins
            WHERE token = $1
        `, [token]);

        const user = tokenResult.rows[0];

        // check if token is in database
        if(user.token !== token) {
            return response.status(401).json({
                error: 'Unauthorized: Token is not in database'
            });
        }

        // check if user_id is in database
        if (user.user_id !== user_id) {
            return response.status(401).json({
                error: 'Invalid user id' 
             });
        }

        // create post
        const currentTime = new Date().toISOString();

        const createPostResult = await client.query(`
            INSERT INTO posts (user_id, content, created_at)
            VALUES ($1, $2, $3) 
            RETURNING id, content
        `, [user_id, content, currentTime]);

        response.status(200).json({
            id: createPostResult.rows[0].id,
            content: createPostResult.rows[0].content
        });
    } catch (error) {
        console.log(`An error occurred: ${error}`);
        response.status(500).json({
            error: 'Internal Server Error'
        });
    } finally {
        client.release();
    }
});

app.post('/posts/update', async(request, response) => {
    const token = request.headers.authorization;
    const { post_id, content } = request.body;

    // check if there is token
    if(!token) {
        return response.status(401).json({
            error: 'Unauthorized: Token is missing'
        });
    }

    // check if there is post id
    if(!post_id) {
        return response.status(401).json({
            error: 'post field is missing'
        });
    }

    const client = await pool.connect();

    try {
        // get token in database
        const tokenResult = await client.query(`
            SELECT ul.token, ul.user_id, p.id
            FROM user_logins ul
            JOIN posts p ON p.user_id = ul.user_id
            WHERE ul.token = $1
        `, [token]);

        const post = tokenResult.rows[0];
        
        // check if token is in database
        if(post.token !== token) {
            return response.status(401).json({
                error: 'Unauthorized: Token is not in database'
            });
        }

        // check if post_id is in database
        if (post.id !== post_id) {
            return response.status(401).json({
                error: 'Invalid post id' 
             });
        }

        // update post
        const updatePostResult = await client.query(`
            UPDATE posts
            SET content = $1
            WHERE id = $2 AND user_id = $3
            RETURNING id, content
        `, [content, post_id, post.user_id]);

        if(updatePostResult.rows.length === 0) {
            return response.status(401).json({
                error: 'id field is missing or you are not the owner'
            });
        }

        response.status(200).json({
            id: updatePostResult.rows[0].id,
            content: updatePostResult.rows[0].content
        });
    } catch (error) {
        console.log(`An error occurred: ${error}`);
        response.status(500).json({
            error: 'Internal Server Error'
        });
    } finally {
        client.release();
    }
});

app.post('/posts/delete', async(request, response) => {
    const token = request.headers.authorization;
    const post_id = request.body.post_id;

    // check if there is token
    if(!token) {
        return response.status(401).json({
            error: 'Unauthorized: Token is missing'
        });
    }

    // check if there is post id
    if(!post_id) {
        return response.status(401).json({
            error: 'post field is missing'
        });
    }

    const client = await pool.connect();

    try {
        // get token in database
        const tokenResult = await client.query(`
            SELECT ul.token, ul.user_id, p.id
            FROM user_logins ul
            JOIN posts p ON p.user_id = ul.user_id
            WHERE ul.token = $1 AND p.id = $2
        `, [token, post_id]);

        const post = tokenResult.rows[0];
        
        // check if token is in database
        if(post.token !== token) {
            return response.status(401).json({
                error: 'Unauthorized: Token is not in database'
            });
        }

        // check if post_id is in database
        if (post.id !== post_id) {
            return response.status(401).json({
                error: 'Invalid post id' 
             });
        }

        // delete post if user is the owner
        const deletePostResult = await client.query(`
            DELETE FROM posts
            WHERE id = $1 AND user_id = $2
            RETURNING id, content
        `, [post_id, post.user_id]);

        if(deletePostResult.rows.length === 0) {
            return response.status(401).json({
                error: 'post field is missing or you are not the owner'
            });
        }

        response.status(200).json({
            id: deletePostResult.rows[0].id,
            content: deletePostResult.rows[0].content
        });
    } catch (error) {
        console.log(`An error occurred: ${error}`);
        response.status(500).json({
            error: 'Internal Server Error'
        });
    } finally {
        client.release();
    }
});

app.listen(port, () => {
    console.log('server started')
});
