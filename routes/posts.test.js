const {
  describe,
  test,
  expect,
} = require('@jest/globals');
const request = require('supertest');
const app = require('../app');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const mockToken = jwt.sign(
  {
    username: 'mockusername',
    user_id: '0',
  },
  process.env.AUTH_SECRET
);

describe('GET /posts/all', () => {
  test('given a valid token', async () => {
    const response = await request(app)
      .get('/posts/all')
      .set('Authorization', `Bearer ${mockToken}`);

    expect(response.statusCode).toBe(200);
  });

  test('given an invalid token', async () => {
    const invalidToken = jwt.sign(
      {
        username: 'mockusername',
        user_id: '0',
      },
      'wrong_secret'
    );

    const response = await request(app)
      .get('/posts/all')
      .set('Authorization', `Bearer ${invalidToken}`);

    expect(response.statusCode).toBe(401);
  });

  test('given a token with incomplete encoded fields (e.g. no user_id)', async () => {
    const invalidToken = jwt.sign(
      {
        username: 'mockusername',
        // user_id: '0', // no encoded user_id
      },
      process.env.AUTH_SECRET
    );

    const response = await request(app)
      .get('/posts/all')
      .set('Authorization', `Bearer ${invalidToken}`);

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe('Invalid decoded auth data');
  });
});
