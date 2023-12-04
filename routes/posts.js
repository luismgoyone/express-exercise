const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');

const knex = require('../db/dbClient');

require('dotenv').config();
const { AUTH_SECRET } = process.env;

// imports for middleware
const { verifyAuthorizationHeader } = require('../utils/verifyAuth');

router.get('/all', verifyAuthorizationHeader, async (req, res) => {
  // Retrieval of all posts

  const posts = await knex('posts')
    .returning('*');

  res.json(posts);
});

router.get('/:id',
  [param('id').isInt()],
  async (req, res) => {
    // Retrieval of a single post by id

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors });
    }

    const { id } = req.params;

    if (!id) {
      const message = 'No `id` param provided';
      console.error(message);
      return res.status(422).json({ message });
    }

    const [post] = await knex('posts')
      .where({ id })
      .returning('*');

    res.json(post);
  }
);

router.get('/user/:user_id',
  [param('user_id').isInt()],
  verifyAuthorizationHeader,
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors });
    }

    // Retrieval of a user's posts

    const { user_id } = req.params;

    if (!user_id) {
      const message = 'No `user_id` param provided';
      console.error(message);
      return res.status(422).json({ message });
    }

    const posts = await knex('posts')
      .where({ user_id })
      .returning('*');

    res.json(posts);
  }
);

router.post('/create',
  verifyAuthorizationHeader,
  [
    body('user_id')
      .isInt()
      .withMessage('`user_id` must be an integer'),
    body('content')
      .isString()
      .withMessage('`content` must be a string')
      .isLength({ min: 1 })
      .withMessage('String `content` cannot be an empty string')
  ],
  async (req, res) => {
    // Creation of a single post

    const authorizationHeader = req.headers['Authorization'] || req.headers['authorization'];

    if (!authorizationHeader) {
      return res.status(401).json({ message: 'No `authorization` header provided' });
    }

    const {
      user_id,
      content,
    } = req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.error(errors);
      return res.status(400).json({ errors });
    }

    const [newPost] = await knex('posts')
      .insert({
        user_id,
        content: content.trim(),
        created_at: knex.fn.now(),
      })
      .returning('*');

    res.json(newPost);
  }
);

router.put('/update',
  verifyAuthorizationHeader,
  [
    body('id').isInt(),
    body('content').isString().isLength({ min: 1 })
  ],
  async (req, res) => {
    // Updating of a single post

    // TODO: Add validation to allow updating to the post's owner only (via post.user_id and token)

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors });
    }

    const {
      id,
      content,
    } = req.body;

    const [updatedPost] = await knex('posts')
      .where({ id })
      .update({ content })
      .returning(['id', 'content']);

    res.json(updatedPost);
  }
);

router.delete('/delete',
  verifyAuthorizationHeader,
  [body('id').isInt()],
  async (req, res) => {
    // Deletion of a single post

    // TODO: Add validation to allow updating to the post's owner only (via post.user_id and token)

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors });
    }

    const { id } = req.body;

    const [deletedPost] = await knex('posts')
      .where({ id })
      .del()
      .returning(['id', 'content']);

    if (!deletedPost) {
      return res.status(400).json({ message: `Post with id ${id} not found` });
    }

    res.json(deletedPost);
  }
);

module.exports = router;
