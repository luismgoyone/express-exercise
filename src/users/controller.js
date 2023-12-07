const pool = require('../../databasepg');
const queries = require('./queries');

const addUser = (req, res) => {
  const { first_name, last_name, username, password } = req.body;

  pool.query(queries.validateUsername, [username], (error, results) => {
    if (results.rows.length) {
      res.send('Username already exists');
    }
    if (password.length < 8) {
      res.send('Password is too short');
    }
    pool.query(
      queries.insertUserToUsersTable,
      [first_name, last_name],
      (error, userResult) => {
        if (error) throw error;

        const userId = userResult.rows[0].id;

        pool.query(
          queries.insertUserToUserLoginsTable,
          [userId, '', username, password],
          (error) => {
            if (error) throw error;

            pool.query(queries.getRegisteredUser, [userId], (error, result) => {
              if (error) throw error;

              res.status(201).json(result.rows[0]);
            });
          }
        );
      }
    );
  });
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
