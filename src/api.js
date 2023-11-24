const client = require('./connection.js');
const express = require('express');
const bodyParser = require('body-parser');

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

app.post('/register', (req, res) => {
    const user = req.body;

    client.query(`SELECT * FROM user_logins WHERE username=${user.username}`, (err, result) => {
        if(!err) {
            if(result.rowCount > 0) {
                console.log("ERROR: Username already exists");
            }
        }
        // else {
        //     console.log(err.message);
        // }
    });

    if(user.password.length < 8) {
        // console.log("ERROR: Password should be at least 8 characters");
        res.send("ERROR: Password should be at least 8 characters");
        client.end;
    }
    else {
        client.query(`INSERT INTO users (first_name, last_name)
                        VALUES ('${user.first_name}', '${user.last_name}')`, (err, result) => {

            if(!err) {
                client.query(`SELECT id FROM users WHERE first_name='${user.first_name}' AND last_name='${user.last_name}'`, (err, result2) => {
                    const id = result2.rows[0].id;
                    if(!err) {
                        client.query(`INSERT INTO user_logins (user_id, token, last_login_at, username, password)
                                        VALUES (${id}, '${generateToken()}', '${new Date()}', '${user.username}', '${user.password}')`, (err, result) => {
                            if(!err) {
                                res.send('Registered new user.');
                            }
                            else {
                                res.send(err.message);
                                client.end;
                            }
                        });
                    }
                    else {
                        res.send(err.message);
                        client.end;
                    }
                });
            }
            else {
                res.send(err.message);
                client.end;
            }

        });
    }
    client.end;
})