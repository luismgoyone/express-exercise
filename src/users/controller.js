const { getAuthToken } = require('../commons/js/authorization');
const pool = require('../../databasepg');
const queries = require('./queries');

const addUser = async (req, res) => {
  const { first_name, last_name, username, password } = req.body;

  pool.query(queries.validateUsername, [username], (error, results) => {
    if (results.rows.length) {
      res.send('Username already exists');
  try {
    await pool.query('BEGIN');
      // Username already exists, rollback and send response
      await pool.query('ROLLBACK');
    }
    if (password.length < 8) {
      res.send('Password is too short');
      // Password is too short, rollback and send response
      await pool.query('ROLLBACK');
    }
    pool.query(
      queries.insertUserToUsersTable,
      [first_name, last_name],
      (error, userResult) => {
        if (error) throw error;

        const userId = userResult.rows[0].id;

        pool.query(
          queries.insertUserToUserLoginsTable,
          [userId, helper.getAuthToken(), username, password],
          (error) => {
            if (error) throw error;

            pool.query(queries.getRegisteredUser, [userId], (error, result) => {
              if (error) throw error;

              res.status(201).json(result.rows[0]);
            });
          }
        );
    // Commit the transaction
    await pool.query('COMMIT');
      }
    );
  });
  } catch (error) {
    console.error('Error adding user:', error);
    // Rollback on error
    await pool.query('ROLLBACK');
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
  addUser,
  getUsers,
};
