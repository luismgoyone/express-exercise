const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
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

router.get('/:id', async (req, res) => {
  // Retrieval of a single post by id

  const { id } = req.params;

  // TODO: Use express-validator middleware in validating req.params.id;
  if (!id) {
    return res.status(422).json({ message: 'No `id` param provided' });
  }

  const [post] = await knex('posts')
    .where({ id })
    .returning('*');

  res.json(post);
});

router.get('/user/:user_id', verifyAuthorizationHeader, async (req, res) => {
  // Retrieval of a user's posts

  const { user_id } = req.params;

  // TODO: Use express-validator middleware in validating req.params.user_id;
  if (!user_id) {
    return res.status(422).json({ message: 'No `user_id` param provided' });
  }

  const posts = await knex('posts')
    .where({ user_id })
    .returning('*');

  res.json(posts);
});

router.post('/create', verifyAuthorizationHeader, async (req, res) => {
  // Creation of a single post

  const authorizationHeader = req.headers['Authorization'] || req.headers['authorization'];

  if (!authorizationHeader) {
    return res.status(401).json({ message: 'No `authorization` header provided' });
  }

  const {
    user_id,
    content,
  } = req.body;

  // TODO: Perform validations (using express-validator middleware)

  const [newPost] = await knex('posts')
    .insert({
      user_id,
      content: content.trim(),
      created_at: knex.fn.now(),
    })
    .returning('*');

  res.json(newPost);
});

router.put('/update/:id', async (req, res) => {
  // TODO: Implement updating of a single post
});

router.delete('/delete/:id', async (req, res) => {
  // TODO: Implement deletion of a single post
});

module.exports = router;
