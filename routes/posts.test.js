const {
  describe,
  test,
  expect,
} = require('@jest/globals');
const request = require('supertest');
const app = require('../app');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { AUTH_SECRET } = process.env;

const mockToken = jwt.sign(
  {
    username: 'mockusername',
    user_id: '0',
  },
  AUTH_SECRET
);

/*
  TODO: Fix this issue (usually encountered after doing `npm run test` where the Jest script doesn't exit after all tests have been executed):
  Jest did not exit one second after the test run has completed.

  'This usually means that there are asynchronous operations that weren't stopped in your tests. Consider running Jest with `--detectOpenHandles` to troubleshoot this issue.
*/

describe('GET /posts/all', () => {
  test('given a valid token', async () => {
    const response = await request(app)
      .get('/posts/all')
      .set('Authorization', `Bearer ${mockToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBeDefined(); // expects an array
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
    expect(response.body.message).toBe('Invalid token');
  });

  test('given a token with incomplete encoded fields (e.g. no user_id)', async () => {
    const invalidToken = jwt.sign(
      {
        username: 'mockusername',
        // user_id: '0', // no encoded user_id
      },
      AUTH_SECRET
    );

    const response = await request(app)
      .get('/posts/all')
      .set('Authorization', `Bearer ${invalidToken}`);

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe('Invalid decoded auth data');
  });
});
