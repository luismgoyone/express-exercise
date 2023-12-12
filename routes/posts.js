const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');

const knex = require('../db/dbClient');

// imports for middleware
const { verifyAuthorizationHeader } = require('../utils/verifyAuth');

/**
 * TODO: Rewrite in proper JSDoc format
    [
      {
        "id": <post id>,
        "content": <post content>,
        "first_name": <post user first_name>,
        "last_name": <post user last_name>,
        "username": <post user username>,
      },
      ...
    ]
 */
router.get('/all', verifyAuthorizationHeader, async (req, res) => {
  // Retrieval of all posts

  let posts = [];
  try {
    posts = await knex
      .select(
        'posts.id',
        'posts.user_id',
        'posts.content',
        'users.first_name',
        'users.last_name',
        'user_logins.username'
      )
      .from('posts')
      .leftJoin('users', 'users.id', '=', 'posts.user_id')
      .leftJoin('user_logins', 'user_logins.user_id', '=', 'users.id')
      .orderBy('created_at', 'desc');
  } catch(err) {
    console.error(err);
    return res.status(400).json({ error: err });
  }

  posts.map(post => { delete post.user_id; });

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
      .returning(['id', 'content']);

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
      .returning(['id', 'content']);

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

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors });
    }

    const {
      id,
      content,
    } = req.body;

    // Query existing post beforehand

    let existingPost = null;
    try {
      existingPost = await knex('posts')
        .where('id', id)
        .first();
    } catch(err) {
      console.error(err);
      return res.status(400).json({ errors: err });
    }

    if (!existingPost) {
      return res.status(400).json({ errors: err });
    }

    // Validation to allow updating to the post's owner only (via post.user_id and token)
    const decodedUserId = req?.decodedAuthData?.user_id;
    const isOwner = (decodedUserId === existingPost.user_id);

    // TODO: Perform validation of the current token against user_login.token

    if (!isOwner) {
      return res.status(401).json({ message: 'Unauthorized edit access' });
    }

    let updatedPost = null;
    try {
      [updatedPost] = await knex('posts')
        .where({ id })
        .update({ content })
        .returning(['id', 'content']);
    } catch(err) {
      console.error(err);
      return res.status(400).json({ errors: err });
    }

    if (!existingPost) {
      return res.status(400).json({ errors: err });
    }

    res.json(updatedPost);
  }
);

router.delete('/delete',
  verifyAuthorizationHeader,
  [body('id').isInt()],
  async (req, res) => {
    // Deletion of a single post

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors });
    }

    const { id } = req.body;

    // Query existing post beforehand

    let existingPost = null;
    try {
      existingPost = await knex('posts')
        .where('id', id)
        .first();
    } catch(err) {
      console.error(err);
      return res.status(400).json({ errors: err });
    }

    if (!existingPost) {
      return res.status(400).json({ errors: err });
    }

    // Validation to allow updating to the post's owner only (via post.user_id and token)
    const decodedUserId = req?.decodedAuthData?.user_id;
    const isOwner = (decodedUserId === existingPost.user_id);

    // TODO: Perform validation of the current token against user_login.token

    if (!isOwner) {
      return res.status(401).json({ message: 'Unauthorized edit access' });
    }

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
