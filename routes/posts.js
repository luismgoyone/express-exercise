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
  // TODO: Implement creation of a single post
});

router.put('/update/:id', async (req, res) => {
  // TODO: Implement updating of a single post
});

router.delete('/delete/:id', async (req, res) => {
  // TODO: Implement deletion of a single post
});

module.exports = router;
