const getUsers = 'SELECT * FROM users';
const registerUser = '';
const validateUsername = 'SELECT u FROM user_logins u WHERE u.username = $1';
const insertUserToUsersTable =
  'INSERT INTO users (first_name, last_name) VALUES ($1, $2) RETURNING id';
const insertUserToUserLoginsTable =
  'INSERT INTO user_logins (user_id, token, last_login_at, username, password) VALUES ($1, $2, CURRENT_TIMESTAMP, $3, $4)';
const getRegisteredUser =
  'SELECT users.id, users.first_name, users.last_name, user_logins.username FROM users INNER JOIN user_logins ON users.id = user_logins.user_id WHERE users.id = $1';
module.exports = {
  getUsers,
  validateUsername,
  insertUserToUsersTable,
  insertUserToUserLoginsTable,
  getRegisteredUser,
};
