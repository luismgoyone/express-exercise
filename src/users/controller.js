const { getAuthToken } = require('../commons/js/authorization');
const pool = require('../../databasepg');
const queries = require('./queries');

const registerUser = async (req, res) => {
  const { first_name, last_name, username, password } = req.body;

  try {
    await pool.query('BEGIN');

    const usernameRow = await pool.query(queries.validateUsername, [username]);

    if (usernameRow.rows.length) {
      await pool.query('ROLLBACK');
      return res
        .status(400)
        .json({ success: false, message: 'Username already exists' });
    }

    if (password.length < 8) {
      await pool.query('ROLLBACK');
      return res
        .status(400)
        .json({ success: false, message: 'Password is too short' });
    }

    const userResult = await pool.query(queries.insertUserToUsersTable, [
      first_name,
      last_name,
    ]);

    const userId = userResult.rows[0].id;

    await pool.query(queries.insertUserToUserLoginsTable, [
      userId,
      username,
      password,
    ]);

    await pool.query('COMMIT');

    const result = await pool.query(queries.getRegisteredUser, [userId]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding user:', error);

    await pool.query('ROLLBACK');
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    await pool.query('BEGIN');

    const usernameRow = await pool.query(queries.validateUsername, [username]);

    if (!usernameRow.rows.length) {
      await pool.query('ROLLBACK');
      return res
        .status(404)
        .json({ success: false, message: 'Username does not exist!' });
    }

    const userRow = await pool.query(queries.validateUser, [
      username,
      password,
    ]);

    if (!userRow.rows.length) {
      await pool.query('ROLLBACK');
      return res
        .status(401)
        .json({ success: false, message: 'Incorrect password!' });
    }

    const userId = userRow.rows[0].user_id;
    const authToken = await getAuthToken();

    await pool.query(queries.insertToken, [authToken, userId]);

    await pool.query('COMMIT');

    const loggedInUser = await pool.query(queries.getLoggedInUser, [userId]);

    res.status(201).json(loggedInUser.rows[0]);
  } catch (error) {
    console.error('Error logging in:', error);

    await pool.query('ROLLBACK');
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

const logoutUser = async (req, res) => {
  const { token } = req.headers;

  try {
    await pool.query('BEGIN');

    const validatedToken = await pool.query(queries.validateToken, [token]);

    if (!validatedToken.rows.length) {
      await pool.query('ROLLBACK');
      return res
        .status(401)
        .json({ success: false, message: 'Invalid token.' });
    }

    const userId = validatedToken.rows[0].user_id;

    await pool.query(queries.updateToken, [null, userId]);

    await pool.query('COMMIT');

    res.status(201).json({ success: true });
  } catch (error) {
    console.error('Error logging in:', error);

    await pool.query('ROLLBACK');
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

const getPosts = async (req, res) => {
  const { token } = req.headers;

  try {
    await pool.query('BEGIN');

    const validatedToken = await pool.query(queries.validateToken, [token]);

    if (!validatedToken.rows.length) {
      await pool.query('ROLLBACK');
      return res
        .status(401)
        .json({ success: false, message: 'Invalid token.' });
    }

    const posts = await pool.query(queries.getPosts);

    res.status(201).json(posts.rows[0]);
  } catch (error) {
    console.error('Error logging in:', error);

    await pool.query('ROLLBACK');
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

const getUserPosts = async (req, res) => {
  const { token } = req.headers;
  const { user_id } = req.body;

  try {
    await pool.query('BEGIN');

    const validatedToken = await pool.query(queries.validateToken, [token]);

    if (!validatedToken.rows.length) {
      await pool.query('ROLLBACK');
      return res
        .status(401)
        .json({ success: false, message: 'Invalid token.' });
    }

    const userPosts = await pool.query(queries.getUserPosts, [user_id]);

    res.status(201).json(userPosts.rows[0]);
  } catch (error) {
    console.error('Error logging in:', error);

    await pool.query('ROLLBACK');
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

const createPost = async (req, res) => {
  const { token } = req.headers;
  const { user_id, content } = req.body;

  try {
    await pool.query('BEGIN');

    const validatedToken = await pool.query(queries.validateToken, [token]);

    if (!validatedToken.rows.length) {
      await pool.query('ROLLBACK');
      return res
        .status(401)
        .json({ success: false, message: 'Invalid token.' });
    }

    const post = await pool.query(queries.addPost, [user_id, content]);

    await pool.query('COMMIT');

    res.status(201).json(post.rows[0]);
  } catch (error) {
    console.error('Error logging in:', error);

    await pool.query('ROLLBACK');
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

const updatePost = async (req, res) => {
  const { token } = req.headers;
  const { id, content } = req.body;

  try {
    await pool.query('BEGIN');

    const validatedToken = await pool.query(queries.validateToken, [token]);

    if (!validatedToken.rows.length) {
      await pool.query('ROLLBACK');
      return res
        .status(401)
        .json({ success: false, message: 'Invalid token.' });
    }

    const post = await pool.query(queries.updatePost, [content, id]);

    await pool.query('COMMIT');

    res.status(201).json(post.rows[0]);
  } catch (error) {
    console.error('Error logging in:', error);

    await pool.query('ROLLBACK');
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

const deletePost = async (req, res) => {
  const { token } = req.headers;
  const { id } = req.body;

  try {
    await pool.query('BEGIN');

    const validatedToken = await pool.query(queries.validateToken, [token]);

    if (!validatedToken.rows.length) {
      await pool.query('ROLLBACK');
      return res
        .status(401)
        .json({ success: false, message: 'Invalid token.' });
    }

    const post = await pool.query(queries.deletePost, [id]);

    await pool.query('COMMIT');

    res.status(201).json(post.rows[0]);
  } catch (error) {
    console.error('Error logging in:', error);

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

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getPosts,
  getUserPosts,
  createPost,
  updatePost,
  deletePost,
  getUsers,
};
