import { fail } from 'assert';
import { describe, it, expect, vi, afterAll } from 'vitest';

const url = process.env.URL || "http://localhost:3000";

describe('exercise-express-pg api test', () => {
  it('should be up / return 200 on root access', async () => {
    const response = await fetch(`${url}/api/status`);

    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      message: 'Server up!',
    })
  })

  const mockUser: {
    first_name: string,
    last_name: string,
    username: string,
    password: string,
    token?: string
    id?: number,
  } = {
    first_name: 'sukuna',
    last_name: 'ryomen',
    username: Math.random().toString(36).substring(2, 10),
    password: 'shrine666',
  }

  const mockUserWithInvalidPassword = {
    first_name: 'satoru',
    last_name: 'gojo',
    username: 'limitless',
    password: 'sixeyes', // less than 8 characters
  }

  describe('Register User', () => {
    it('should register new user', async () => {
      const {
        first_name,
        last_name,
        username,
      } = mockUser;

      if (!first_name) {
        fail('first_name should be provided!');
      }
      if (!last_name) {
        fail('last_name should be provided!');
      }
      if (!username) {
        fail('username should be provided!');
      }

      const response = await fetch(`${url}/api/auth`, {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify(mockUser),
      })

      const { status } = response;
      const body = await response.json();

      expect(status).toBe(201);

      expect(body).toEqual({
        data: expect.objectContaining({
          id: expect.any(Number),
          first_name,
          last_name,
          username
        })
      })
    })

    it('should return error if existing user', async () => {
      const {
        first_name,
        last_name,
        username,
        password,
      } = mockUser;

      if (!first_name) {
        fail('first_name should be provided!');
      }
      if (!last_name) {
        fail('last_name should be provided!');
      }
      if (!username) {
        fail('username should be provided!');
      }
      if (!password) {
        fail('password should be provided!');
      }

      const response = await fetch(`${url}/api/auth`, {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
          first_name,
          last_name,
          username,
          password,
        }),
      })

      const { status } = response
      const body = await response.json()

      expect(status).toBe(409)
      expect(body).toEqual({
        message: 'User already exists!'
      })
    })

    it('should return error if password is less than 8 characters', async () => {
      const { 
        first_name,
        last_name,
        username,
        password,
      } = mockUserWithInvalidPassword;

      if (!first_name) {
        fail('first_name should be provided!');
      }
      if (!last_name) {
        fail('last_name should be provided!');
      }
      if (!username) {
        fail('username should be provided!');
      }
      if (!password) {
        fail('password should be provided!');
      }
      
      const response = await fetch(`${url}/api/auth`, {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
          first_name,
          last_name,
          username,
          password,
        }),
      })

      const { status } = response;
      const body = await response.json();

      expect(status).toBe(400);
      expect(body).toEqual({
        message: 'Password should be 8 characters or above!',
      })
    })
  })

  // describe('Login User', () => {
  //   it('should login existing user', async () => {
  //     const {
  //       username,
  //       password,
  //       first_name,
  //       last_name,
  //     } = mockUser;

  //     if (!username) {
  //       fail('username should be provided!');
  //     }
  //     if (!password) {
  //       fail('password should be provided!');
  //     }

  //     const response = await fetch(`${url}/api/auth`, {
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       method: 'POST',
  //       body: JSON.stringify({
  //         username,
  //         password,
  //       }),
  //     })

  //     const { status } = response;
  //     const body = await response.json();

  //     expect(status).toBe(200);
  //     expect(body).toEqual({
  //       data: expect.objectContaining({
  //         id: expect.any(Number),
  //         first_name,
  //         last_name,
  //         username,
  //         token: expect.any(String),
  //       })
  //     })

  //     // NOTE: Prep for authenticated request tests
  //     mockUser.token = body.data.token; 
  //     mockUser.id = body.data.id;
  //   })

  //   it('should return error if malformed content', async () => {
  //     const response = await fetch(`${url}/api/auth`, {
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       method: 'POST',
  //       body: JSON.stringify({}),
  //     })

  //     const { status } = response;
  //     const body = await response.json();

  //     expect(status).toBe(400)
  //     expect(body).toEqual({        
  //       message: 'Malformed content!',
  //     })
  //   })

  //   it('should return error if username and password does not match', async () => {
  //     const userCredentials = {
  //       username: mockUser.username,
  //       password: 'notmatchingpassword',
  //     }

  //     const response = await fetch(`${url}/api/auth`, {
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       method: 'POST',
  //       body: JSON.stringify(userCredentials),
  //     })

  //     const { status } = response;
  //     const body = await response.json();

  //     expect(status).toBe(404);
  //     expect(body).toEqual({
  //       message: 'Username and password does not match!'
  //     });
  //   })
  // })

  // describe('Logout User', () => {
  //   it('should logout', async () => {
  //     const {
  //       token, 
  //       username,
  //       id,
  //     } = mockUser;

  //     if (!token || !id || !username) {
  //       fail('Token supposed to exist!');
  //     }

  //     const response = await fetch(`${url}/api/auth/${id}`, {
  //       headers: {
  //         'Content-Type': 'application/json',
  //         token,
  //       },
  //       method: 'POST',
  //       body: JSON.stringify({
  //         username,
  //       }),
  //     });

  //     const { status } = response;
  //     expect(status).toBe(205);
  //   })

  //   it('should return error if invalid token', async () => {
  //     const { id } = mockUser

  //     const response = await fetch(`${url}/api/auth/${id}`, {
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       method: 'POST',
  //     });

  //     const { status } = response;
  //     const body = await response.json();
      
  //     expect(status).toBe(401);
  //     expect(body).toEqual({
  //       message: 'Unauthorized!',
  //     })
  //   })
  // })

  // describe('Create Post', () => {
  //   it('should create posts', async () => {
  //     const { id, token } = mockUser;
  //     const content = 'searching for someone to blame is such a pain.';

  //     if (!token) {
  //       fail('Token supposed to exist!')
  //     }

  //     const response = await fetch(`${url}/api/posts/${id}`, {
  //       headers: {
  //         'Content-Type': 'application/json',
  //         token,
  //       },
  //       method: 'POST',
  //       body: JSON.stringify({
  //         content,
  //       }),
  //     });

  //     const { status } = response;
  //     const body = await response.json();

  //     expect(status).toBe(201);
  //     expect(body).toEqual({
  //       data: {
  //         id: expect.any(Number),
  //         content,
  //       }
  //     })      
  //   })

  //   // it('should return error if invalid token', async () => {
  //   //   const content = 'searching for someone to blame is such a pain.';

  //   //   // NOTE: No token case. TODO: Add token mismatch case
  //   //   const response = await fetch(`${url}/api/posts/1`, {
  //   //     headers: {
  //   //       'Content-Type': 'application/json',
  //   //     },
  //   //     method: 'POST',
  //   //     body: JSON.stringify({
  //   //       content,
  //   //     }),
  //   //   });

  //   //   const { status } = response;
  //   //   const body = await response.json();

  //   //   expect(status).toBe(401);
  //   //   expect(body).toEqual({
  //   //     message: 'Unauthorized post creation!',
  //   //   })      
  //   // })

  //   // it('should return error if malformed request body', async () => {
  //   //   const response = await fetch(`${url}/api/posts/1`, {
  //   //     headers: {
  //   //       'Content-Type': 'application/json',
  //   //       token: 'domainexpansion',
  //   //     },
  //   //     method: 'POST',
  //   //     body: JSON.stringify({
  //   //       random: 'value'
  //   //     }),
  //   //   });

  //   //   const { status } = response;
  //   //   const body = await response.json();

  //   //   expect(status).toBe(400);
  //   //   expect(body).toEqual({
  //   //     message: 'Malformed request!',
  //   //   })      
  //   // })
  // })

  // describe('Read All Posts', () => {
  //   it('should return all posts sorted by most recent created_at', async () => {
  //     const response = await fetch(`${url}/api/posts`, {
  //       headers: {
  //         'Content-Type': 'application/json',
  //         token: 'domainexpansion',
  //       },
  //       method: 'GET',
  //     });

  //     const { status } = response;
  //     const body = await response.json();

  //     expect(status).toBe(200);
  //     expect(body).toEqual({
  //       data: expect.arrayContaining([expect.objectContaining({
  //         id: expect.any(Number),
  //         content: expect.any(String),
  //         first_name: expect.any(String),
  //         last_name: expect.any(String),
  //         username: expect.any(String),
  //         created_at: expect.any(String),
  //       })])
  //     });

  //     const unsorted = body.data
  //     const sorted = body.data.toSorted((a, b) => 
  //     (a.created_at < b.created_at) ? -1 : ((a.created_at > b.created_at) ? 1 : 0))

  //     expect(unsorted).toStrictEqual(sorted)
  //   })

  //   it('should return error if invalid token', async () => {
  //     const response = await fetch(`${url}/api/posts`, {
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       method: 'GET',
  //     });

  //     const { status } = response;
  //     const body = await response.json();

  //     expect(status).toBe(401); 
  //     expect(body).toEqual({
  //       message: 'Unauthorized post access!',
  //     })
  //   })
  // })

  // describe('Read User Posts', () => {
  //   it('should return user posts sorted by most recent created_at', async () => {
  //     const response = await fetch(`${url}/api/posts/3`, {
  //       headers: {
  //         'Content-Type': 'application/json',
  //         token: 'domainexpansion',
  //       },
  //       method: 'GET',
  //     });

  //     const { status } = response;
  //     const body = await response.json();

  //     expect(status).toBe(200);

  //     expect(body).toEqual(
  //       expect.objectContaining({
  //         data: expect.arrayContaining([
  //           expect.objectContaining({
  //             id: expect.any(Number),
  //             content: expect.any(String),
  //           })
  //         ]),
  //       })
  //     );
      
  //     const filteredData = body.data.map(post => ({
  //         id: post.id,
  //         content: post.content,
  //       }
  //     ))

  //     expect(body.data).toStrictEqual(filteredData)

  //     const unsorted = body.data
  //     const sorted = body.data.toSorted((a, b) => 
  //     (a.created_at < b.created_at) ? -1 : ((a.created_at > b.created_at) ? 1 : 0))

  //     expect(unsorted).toStrictEqual(sorted)
  //   })

  //   it('should return error if invalid token', async () => {
  //     const response = await fetch(`${url}/api/posts/3`, {
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       method: 'GET',
  //     });

  //     const { status } = response;
  //     const body = await response.json();

  //     expect(status).toBe(401); 
  //     expect(body).toEqual({
  //       message: 'Unauthorized post access!'
  //     })
  //   })
  // })
  
  // describe('Update Post', () => {
  //   it('should update post', async () => {
  //     const payload = {
  //       id: 2,
  //       content: 'you’re lucky if you can die a normal death...',
  //     }

  //     const response = await fetch(`${url}/api/posts/1`, {
  //       headers: {
  //         'Content-Type': 'application/json',
  //         token: 'domainexpansion',
  //       },
  //       method: 'PATCH',
  //       body: JSON.stringify(payload),
  //     });

  //     const { status } = response;
  //     const body = await response.json();

  //     expect(status).toBe(200);
  //     expect(body.data).toEqual(payload)
  //   })

  //   it('should return error if invalid token', async () => {
  //     const payload = {
  //       id: 2,
  //       content: 'you’re lucky if you can die a normal death...',
  //     }

  //     const response = await fetch(`${url}/api/posts/1`, {
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       method: 'PATCH',
  //       body: JSON.stringify(payload),
  //     });

  //     const { status } = response;
  //     const body = await response.json();

  //     expect(status).toBe(401);
  //     expect(body).toEqual({
  //       message: 'Unauthorized post update!',
  //     })
  //   })

  //   it('should return error if malformed request body', async () => {
  //     const response = await fetch(`${url}/api/posts/1`, {
  //       headers: {
  //         'Content-Type': 'application/json',
  //         token: 'domainexpansion',
  //       },
  //       method: 'PATCH',
  //       body: JSON.stringify({
  //         random: 'value'
  //       }),
  //     });

  //     const { status } = response;
  //     const body = await response.json();

  //     expect(status).toBe(400);
  //     expect(body).toEqual({
  //       message: 'Malformed request!',
  //     })       
  //   })
  // })

  // describe('Delete Post', () => {
  //   it('should delete post', async () => {
  //     const response = await fetch(`${url}/api/posts/1`, {
  //       headers: {
  //         'Content-Type': 'application/json',
  //         token: 'domainexpansion',
  //       },
  //       method: 'DELETE',
  //     });

  //     const { status } = response;

  //     expect(status).toBe(204);
  //   })

  //   it('should return error if invalid token', async () => {
  //     const response = await fetch(`${url}/api/posts/1`, {
  //       headers: {
  //         'Content-Type': 'application/json',
  //         token: 'domainexpansion',
  //       },
  //       method: 'DELETE',
  //     });

  //     const { status } = response;

  //     expect(status).toBe(204);
  //   })
  // })
})
