const { getAuthToken } = require('../commons/js/authorization');
const pool = require('../../databasepg');
const queries = require('./queries');

const registerUser = async (req, res) => {
  const { first_name, last_name, username, password } = req.body;

  try {
    await pool.query('BEGIN');
    // Validate username case-insensitively
    const usernameRow = await pool.query(queries.validateUsername, [username]);

    if (usernameRow.rows.length) {
      // Username already exists, rollback and send response
      await pool.query('ROLLBACK');
      return res.status(400).send('Username already exists');
    }

    if (password.length < 8) {
      // Password is too short, rollback and send response
      await pool.query('ROLLBACK');
      return res.status(400).send('Password is too short');
    }

    // Insert into users table
    const userResult = await pool.query(queries.insertUserToUsersTable, [
      first_name,
      last_name,
    ]);

    const userId = userResult.rows[0].id;

    // Insert into user_logins table
    await pool.query(queries.insertUserToUserLoginsTable, [
      userId,
      username,
      password,
    ]);
    // Commit the transaction
    await pool.query('COMMIT');

    // Fetch registered user information
    const result = await pool.query(queries.getRegisteredUser, [userId]);
    // Send the registered user information in the response
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding user:', error);
    // Rollback on error
    await pool.query('ROLLBACK');
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const usernameRow = await pool.query(queries.validateUsername, [username]);

    if (!usernameRow.rows.length) {
      // Username already exists, rollback and send response
      await pool.query('ROLLBACK');
      return res.send('Username does not exist!');
    }

    const userRow = await pool.query(queries.validateUser, [
      username,
      password,
    ]);

    if (!userRow.rows.length) {
      await pool.query('ROLLBACK');
      return res.send('Incorrect password!');
    }

    const userId = userRow.rows[0].user_id;

    const loggedInUser = await pool.query(queries.getLoggedInUser, [userId]);

    res.status(201).json(loggedInUser.rows[0]);
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
const getUsers = (req, res) => {
  pool.query(queries.getUsers, (error, results) => {
    if (error) throw error;
    res.status(200).json(results.rows);
  });
};

// const regiserUser = (req, res) => {
//   pool.post()
// }

module.exports = {
  registerUser,
  loginUser,
  getUsers,
};
