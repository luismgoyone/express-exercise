const validateUsername = 'SELECT u FROM user_logins u WHERE u.username = $1';
const insertUserToUsersTable =
  'INSERT INTO users (first_name, last_name) VALUES ($1, $2) RETURNING id';
const insertUserToUserLoginsTable =
  'INSERT INTO user_logins (user_id, token, last_login_at, username, password) VALUES ($1, null, null, $2, $3)';
const getRegisteredUser =
  'SELECT users.id, users.first_name, users.last_name, user_logins.username FROM users INNER JOIN user_logins ON users.id = user_logins.user_id WHERE users.id = $1';
const validateUser =
  'SELECT * FROM user_logins u WHERE u.username = $1 AND u.password = $2';
const insertToken =
  'UPDATE user_logins SET token = $1, last_login_at = CURRENT_TIMESTAMP WHERE user_id = $2';
const getLoggedInUser =
  'SELECT u.id, u.first_name, u.last_name, ul.username, ul.token FROM users u INNER JOIN user_logins ul ON u.id = ul.user_id WHERE u.id = $1';
const validateToken = 'SELECT * FROM user_logins WHERE user_logins.token = $1';
const updateToken = 'UPDATE user_logins SET token = $1 WHERE user_id = $2';
const getPosts = 'SELECT * FROM posts ORDER BY created_at';
const getUserPosts =
  'SELECT * FROM posts WHERE user_id = $1 ORDER BY created_at';
const addPost =
  'INSERT INTO posts (user_id, content, created_at) VALUES ($1, $2, CURRENT_TIMESTAMP) RETURNING id, content';
const updatePost =
  'UPDATE posts SET content = $1 WHERE id = $2 RETURNING id, content';
const deletePost = 'DELETE FROM posts WHERE id = $1 RETURNING id, content';
const getUsers = 'SELECT * FROM users';

module.exports = {
  validateUsername,
  insertUserToUsersTable,
  insertUserToUserLoginsTable,
  getRegisteredUser,
  validateUser,
  insertToken,
  getLoggedInUser,
  validateToken,
  updateToken,
  getPosts,
  getUserPosts,
  addPost,
  updatePost,
  deletePost,
  getUsers,
};
