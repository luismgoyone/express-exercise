const client = require('./connection.js');
const express = require('express');
const bodyParser = require('body-parser');
const date = require("date-and-time")

const app = express();
const port = 3300;

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

function query(sql, values) {
    return new Promise((resolve, reject) => {
        client.query(sql, values, (err, result) => {
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

client.connect();

app.get('/users', (req, res) => {
    client.query(`SELECT * FROM users`, (err, result) => {
        if(!err) {
            res.send(result.rows);
        }
    });

    client.end;
});

app.get('/users/:id', (req, res) => {
    client.query(`SELECT * FROM users WHERE id=${req.params.id}`, (err, result) => {
        if(!err) {
            res.send(result.rows);
        }
    });

    client.end;
});

app.post('/users', (req, res) => {
    const user = req.body;

    client.query(`INSERT INTO users (id, first_name, last_name) 
                    VALUES (${user.id}, '${user.first_name}', '${user.last_name}')`, (err, result) => {
        if(!err) {
            res.send('Inserted data successfully');
        }
        else {
            console.log(err.message);
        }
    });
});

app.post('/register', async (req, res) => {
    try {
        const user = req.body;

        const userQuery = await query(`SELECT * FROM user_logins WHERE username='${user.username}'`);
        if(userQuery.rowCount > 0) {
            return res.send("ERROR: Username already exists.");
        }

        if(user.password.length < 8) {
            return res.send("ERROR: Password should be at least 8 characters.");
        }

        await query(`INSERT INTO users (first_name, last_name)
                        VALUES ('${user.first_name}', '${user.last_name}')`);

        const selectUserIdQuery = await query(`SELECT id FROM users WHERE first_name='${user.first_name}' AND last_name='${user.last_name}'`)
        const userId = selectUserIdQuery.rows[0].id;

        await query(`INSERT INTO user_logins (user_id, token, last_login_at, username, password)
                        VALUES (${userId}, '${generateToken()}', '${date.format(new Date(), 'MM/DD/YYYY HH:mm:ss ZZ')}', '${user.username}', '${user.password}')`);

        res.send("Registered new user.");
    }
    catch (err) {
        console.error("Error during registration: ", err.message);
    }
})