const validateUsername = 'SELECT u FROM user_logins u WHERE u.username = $1';
const insertUserToUsersTable =
  'INSERT INTO users (first_name, last_name) VALUES ($1, $2) RETURNING id';
const insertUserToUserLoginsTable =
  'INSERT INTO user_logins (user_id, token, last_login_at, username, password) VALUES ($1, null, null, $2, $3)';
const getRegisteredUser =
  'SELECT users.id, users.first_name, users.last_name, user_logins.username FROM users INNER JOIN user_logins ON users.id = user_logins.user_id WHERE users.id = $1';
const validateUser =
  'SELECT * FROM user_logins u WHERE u.username = $1 AND u.password = $2';
const getUsers = 'SELECT * FROM users';
const getLoggedInUser =
  'SELECT u.id, u.first_name, u.last_name, ul.username, ul.token FROM users u INNER JOIN user_logins ul ON u.id = ul.user_id WHERE u.id = $1';
module.exports = {
  validateUsername,
  insertUserToUsersTable,
  insertUserToUserLoginsTable,
  getRegisteredUser,
  validateUser,
  getUsers,
  getLoggedInUser,
};
