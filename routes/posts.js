const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');

const knex = require('../db/dbClient');

require('dotenv').config();
const { AUTH_SECRET } = process.env;

router.get('/all', async (req, res) => {
  // TODO: Implement retrieval of all posts
});

router.get('/:id', async (req, res) => {
  // TODO: Implement retrieval of a single post by id
});

router.get('/user/:user_id', async (req, res) => {
  // TODO: Implement retrieval of a user's posts
});

router.post('/create', async (req, res) => {
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
