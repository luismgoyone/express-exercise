const client = require('./connection.js');
const express = require('express');
const bodyParser = require('body-parser');
const date = require("date-and-time")

const app = express();
const port = 3300;
const format = 'MM/DD/YYYY HH:mm:ss ZZ';

function generateToken(){
    const length = 24;
    //edit the token allowed characters
    var a = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890".split("");
    var b = [];  
    for (var i=0; i<length; i++) {
        var j = (Math.random() * (a.length-1)).toFixed(0);
        b[i] = a[j];
    }
    return b.join("");
}

async function query(sql, values) {
    const pool = await client.connect();
    
    return new Promise((resolve, reject) => {
        pool.query(sql, values, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

app.listen(port, () => {
    console.log(`Connected to port ${port}`);
});

app.use(bodyParser.json());

app.post('/create-table', async (req, res) => {
    const pool = await client.connect();

    try {
        await query(`CREATE TABLE IF NOT EXISTS 
                        public.posts (
                            id integer NOT NULL DEFAULT nextval('posts_id_seq'::regclass),
                            user_id integer,
                            content text COLLATE pg_catalog."default",
                            created_at timestamp with time zone,
                            CONSTRAINT posts_pkey PRIMARY KEY (id))`);

        await query(`CREATE TABLE IF NOT EXISTS 
                        public.user_logins (
                            user_id integer,
                            token text COLLATE pg_catalog."default",
                            last_login_at timestamp with time zone,
                            username character varying(20) COLLATE pg_catalog."default",
                            password character varying(20) COLLATE pg_catalog."default")`);

        await query(`CREATE TABLE IF NOT EXISTS 
                        public.users(
                            id integer NOT NULL DEFAULT nextval('users_id_seq'::regclass),
                            first_name character varying(20) COLLATE pg_catalog."default",
                            last_name character varying(20) COLLATE pg_catalog."default",
                            CONSTRAINT users_pkey PRIMARY KEY (id))`);
    }
    catch (err) {
        res.status(err.status).send("Error during create-table: ", err.message);
    }
    finally {
        pool.release();
    }
});

app.post('/register', async (req, res) => {
    const pool = await client.connect();

    try {
        const user = req.body;

        if(!user.first_name || !user.last_name || !user.username || !user.password) {
            return res.status(400).send("ERROR: Incomplete details.");
        }

        const userQuery = await query(`SELECT * FROM user_logins WHERE username='${user.username}'`);
        if(userQuery.rowCount > 0) {
            return res.status(400).send("ERROR: Username already exists.");
        }

        if(user.password.length < 8) {
            return res.status(400).send("ERROR: Password should be at least 8 characters.");
        }

        const insertQuery = await query(`INSERT INTO users (first_name, last_name) VALUES ('${user.first_name}', '${user.last_name}') RETURNING id`);

        const userId = insertQuery.rows[0].id;

        // await query(`INSERT INTO user_logins (user_id, username, password)
        //                 VALUES (${userId}, '${generateToken()}', '${formattedDate()}', '${user.username}', '${user.password}')`);

        await query(`INSERT INTO user_logins (user_id, username, password) VALUES (${userId}, '${user.username}', '${user.password}')`);

        const userRecord = await query(`
            SELECT a.id, a.first_name, a.last_name, b.username 
            FROM users a 
            JOIN user_logins b ON a.id = b.user_id
            WHERE a.id = ${userId}`);

        console.log("Registered new user.");
        res.status(200).send(userRecord.rows[0]);
    }
    catch (err) {
        res.status(err.status).send("Error during registration: ", err.message);
    }
    finally {
        pool.release();
    }
});

app.post('/login', async (req, res) => {
    const pool = await client.connect();

    try {
        const user = req.body;

        if(!user.username || !user.password) {
            return res.status(400).send("ERROR: Incomplete details.");
        }

        const userQuery = await query(`SELECT * FROM user_logins WHERE username='${user.username}'`);
        if(userQuery.rowCount === 0) {
            return res.status(404).send("ERROR: User does not exist.");
        }

        if(userQuery.rows[0].password !== user.password) {
            return res.status(400).send("ERROR: Username and password does not match.");
        }

        const token = generateToken();
        await query(`UPDATE user_logins 
                        SET token='${token}', 
                            last_login_at='${date.format(new Date(), format)}' 
                        WHERE user_id=${userQuery.rows[0].user_id}`);

        const userRecord = await query(`
            SELECT a.id, a.first_name, a.last_name, b.username, b.token
            FROM users a 
            JOIN user_logins b ON a.id = b.user_id
            WHERE a.id = ${userQuery.rows[0].user_id}`);

        console.log("Successfully logged in.");
        return res.status(200).send(userRecord.rows[0]);
    }
    catch (err) {
        return res.status(err.status).send("Error during login: ", err.message)
    }
    finally {
        pool.release();
    }
});

app.post('/logout', async (req, res) => {
    const pool = await client.connect();

    const token = req.headers.authorization;

    if(!token) {
        return res.status(401).send("ERROR: Unauthorized token.");
    }

    try {
        await query(`UPDATE user_logins SET token=null WHERE token='${token}'`);

        console.log("Successfully logged out.");
        res.status(200).send({
            success: true
        });
    }
    catch (err) {
        res.status(err.status).send("Error during logout: ", err.message);
    }
    finally {
        pool.release();
    }
});

app.post('/posts/create', async (req, res) => {
    const pool = await client.connect();

    const token = req.headers.authorization;

    if(!token) {
        return res.status(401).send("ERROR: Unauthorized token.");
    }
    
    try {
        const user = req.body;

        if(!user.user_id || !user.content) {
            return res.status(400).send("ERROR: Incomplete details.");
        }

        const insertQuery = await query(`INSERT INTO posts (user_id, content, created_at) 
                                            VALUES (${user.user_id}, '${user.content}', '${date.format(new Date(), format)}')
                                            RETURNING id, content`);

        const recentPost = insertQuery.rows[0];
        

        console.log("Created new post.");
        res.status(200).send({
            id: recentPost.id,
            content: recentPost.content
        });
    }
    catch (err) {
        res.status(err.status).send("Error on post creation: ", err.message);
    }
    finally {
        pool.release();
    }
});

app.post('/posts/update', async (req, res) => {
    const pool = await client.connect();

    const token = req.headers.authorization;

    if(!token) {
        return res.status(401).send("ERROR: Unauthorized token.");
    }

    try {
        const user = req.body;

        if(!user.post_id || !user.content) {
            return res.status(400).send("ERROR: Incomplete details.");
        }

        console.log({query: `SELECT * FROM posts a JOIN user_logins b ON a.user_id = b.user_id WHERE b.token = '${token}' AND a.id = ${user.post_id}`});
        
        const postQuery = await query(`SELECT * FROM posts a 
                                        JOIN user_logins b ON a.user_id = b.user_id 
                                        WHERE b.token = '${token}' AND a.id = '${user.post_id}'`);
        
        if(postQuery.rowCount === 0) {
            return res.status(404).send("ERROR: Post does not exist on user.");
        }

        const updateQuery = await query(`UPDATE posts SET content='${user.content}' WHERE id=${user.post_id} RETURNING id, content`);
        
        const recentPost = updateQuery.rows[0];

        console.log("Updated post.");
        res.status(200).send({
            updated: {
                id: recentPost.id,
                new_content: recentPost.content
            }
        });
    }
    catch (err) {
        res.status(err.status).send("Error on updating post: ", err.message);
    }
    finally {
        pool.release();
    }
});

app.post('/posts/delete', async (req, res) => {
    const pool = await client.connect();

    try {
        const token = req.headers.authorization;
    
        if(!token) {
            return res.status(401).send("ERROR: Unauthorized token.");
        }
        
        const user = req.body;

        if(!user.post_id) {
            return res.status(400).send("ERROR: Incomplete details.");
        }

        const postQuery = await query(`SELECT * FROM posts a 
                                        JOIN user_logins b ON a.user_id = b.user_id 
                                        WHERE b.token = '${token}' AND a.id = ${user.post_id}`);
        
        if(postQuery.rowCount === 0) {
            return res.status(404).send("ERROR: Post does not exist on user.");
        }

        // const postQuery = await query(`SELECT * FROM posts WHERE id=${user.post_id}`);
        // if(postQuery.rowCount === 0) {
        //     return res.status(400).send("ERROR: Post does not exist.");
        // }

        const deleteQuery = await query(`DELETE FROM posts WHERE id=${user.post_id} RETURNING id, content`);
        
        const recentPost = deleteQuery.rows[0];

        console.log("Deleted post.");
        res.status(200).send({
            deleted: {
                success: true,
                id: recentPost.id,
            }
        });
    }
    catch (err) {
        res.status(err.status).send("Error on post deletion: ", err.message);
    }
    finally {
        pool.release();
    }
});

app.post('/posts/all', async (req, res) => {
    const pool = await client.connect();

    try {
        const token = req.headers.authorization;
    
        if(!token) {
            return res.status(401).send("ERROR: Unauthorized token.");
        }

        const allPostsQuery = await query(`SELECT a.id, a.content, b.first_name, b.last_name, c.username, a.created_at
                                            FROM posts a
                                            JOIN users b ON a.user_id = b.id
                                            JOIN user_logins c ON a.user_id = c.user_id
                                            ORDER BY a.created_at DESC`);
        res.status(200).send({
            data: allPostsQuery.rows
        });
    }
    catch (err) {
        res.status(err.status).send("Error on displaying all posts: ", err.message);
    }
    finally {
        pool.release();
    }
});

app.post('/posts/user', async (req, res) => {
    const pool = await client.connect();

    try {
        const token = req.headers.authorization;
        
        if(!token) {
            return res.status(401).send("ERROR: Unauthorized token.");
        }
        
        const user = req.body;
        
        if(!user.user_id) {
            return res.status(400).send("ERROR: Incomplete details.");
        }

        const postQuery = await query(`SELECT a.id, a.content FROM posts a 
                                        JOIN user_logins b ON a.user_id = b.user_id 
                                        WHERE b.token = '${token}' AND a.user_id = ${user.user_id}`);
                                                                            
        if(postQuery.rowCount === 0) {
            return res.status(404).send("ERROR: User has no post/s");
        }

        // const allPostsQuery = await query(`SELECT id, content
        //                                     FROM posts WHERE user_id=${user.user_id}`);
        res.send({
            data: postQuery.rows
        });
    }
    catch (err) {
        res.status(err.status).send("Error on displaying user posts: ", err.message);
    }
    finally {
        pool.release();
    }
});