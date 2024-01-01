const pool = require('../../databasepg');
const queries = require('../commons/queries/queries');

const getPosts = async (req, res) => {
  const { token } = req.headers;

  try {
    const validatedToken = await pool.query(queries.validateToken, [token]);

    if (!validatedToken.rows.length) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid token.' });
    }

    const posts = await pool.query(queries.getPosts);

    res.status(201).json({ data: posts.rows });
  } catch (error) {
    console.error('Error logging in:', error);

    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

const getUserPosts = async (req, res) => {
  const { token } = req.headers;
  const { id } = req.params;

  try {
    const validatedToken = await pool.query(queries.validateToken, [token]);

    if (!validatedToken.rows.length) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid token.' });
    }

    const userPosts = await pool.query(queries.getUserPosts, [id]);

    res.status(201).json({ data: userPosts.rows });
  } catch (error) {
    console.error('Error logging in:', error);

    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

const createPost = async (req, res) => {
  const { token } = req.headers;
  const { id } = req.params;
  const { content } = req.body;

  try {
    const validatedToken = await pool.query(queries.validateToken, [token]);

    if (!validatedToken.rows.length) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid token.' });
    }

    const post = await pool.query(queries.addPost, [id, content]);

    res.status(201).json(post.rows[0]);
  } catch (error) {
    console.error('Error logging in:', error);

    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

const updatePost = async (req, res) => {
  const { token } = req.headers;
  const { content } = req.body;
  const { id } = req.params;

  try {
    const validatedToken = await pool.query(queries.validateToken, [token]);

    if (!validatedToken.rows.length) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid token.' });
    }

    const post = await pool.query(queries.updatePost, [content, id]);

    res.status(201).json(post.rows[0]);
  } catch (error) {
    console.error('Error logging in:', error);

    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

const deletePost = async (req, res) => {
  const { token } = req.headers;
  const { id } = req.params;

  try {
    const validatedToken = await pool.query(queries.validateToken, [token]);

    if (!validatedToken.rows.length) {
      await pool.query('ROLLBACK');
      return res
        .status(401)
        .json({ success: false, message: 'Invalid token.' });
    }

    const post = await pool.query(queries.deletePost, [id]);

    res.status(201).json(post.rows[0]);
  } catch (error) {
    console.error('Error logging in:', error);

    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

module.exports = {
  getPosts,
  getUserPosts,
  createPost,
  updatePost,
  deletePost,
};
