import { describe, it, expect, vi } from 'vitest';

const url = process.env.URL || "http://localhost:3000";

describe('exercise-express-pg api test', () => {
  describe ('Initialization', () => {
    it('should be up / return 200 on root access', async () => {
      const response = await fetch(`${url}/api`);
  
      expect(response.status).toBe(200);
    })
  })

  describe('User Registration', () => {
    // TODO: Use only one user mock to sequentially test:
    // 1. creation of new user
    // 2. checking of existing user

    it('should register new user', async () => {
      const newUser = {
        first_name: 'sukuna',
        last_name: 'ryomen',
        username: 'malevolent',
        password: 'shrine666',
      }

      const response = await fetch(`${url}/api/auth/register`, {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify(newUser),
      })

      const { status } = response;
      const body = await response.json();

      expect(status).toBe(201);

      const { password, ...userDetails } = newUser
      expect(body).toEqual({
        data: expect.objectContaining({
          id: expect.any(Number),
          ...userDetails,
        })
      })
    })

    it('should return error if registering existing user', async () => {
      const existingUser = {
        first_name: 'gojo',
        last_name: 'satoru',
        username: 'limitless',
        password: 'sixeyes',
      }

      const response = await fetch(`${url}/api/auth/register`, {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify(existingUser),
      })

      const { status } = response
      const body = await response.json()

      expect(status).toBe(409)
      expect(body).toEqual({
        message: 'User already exists!'
      })
    })

    it('should return error if password is less than 8 characters', async () => {
      const newUser = {
        first_name: 'sukuna',
        last_name: 'ryomen',
        username: 'malevolent',
        password: 'shrine', // less than 8 characters
      }
      
      const response = await fetch(`${url}/api/auth/register`, {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify(newUser),
      })

      const { status } = response;
      const body = await response.json();

      expect(status).toBe(400);
      expect(body).toEqual({
        message: 'Password should be 8 characters or above!',
      })
    })
  })

  describe('User Login', () => {
    it('should login existing user', async () => {
      const existingUser = {
        first_name: 'gojo',
        last_name: 'satoru',
        username: 'limitless',
        password: 'sixeyes',
      }

      const userCredentials = {
        username: 'limitless',
        password: 'sixeyes',
      }

      const response = await fetch(`${url}/api/auth/login`, {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify(userCredentials),
      })

      const { status } = response;
      const body = await response.json();

      expect(status).toBe(200);

      const { password: excluded, ...userDetails } = existingUser
      expect(body).toEqual({
        data: expect.objectContaining({
          id: expect.any(Number),
          ...userDetails,
          token: expect.any(String),
        })
      })
    })

    it('should return error if username does not exist', async () => {
      const userCredentials = {
        username: 'panda',
        password: 'gorilla',
      }

      const response = await fetch(`${url}/api/auth/login`, {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify(userCredentials),
      })

      const { status } = response;
      const body = await response.json();

      expect(status).toBe(404)

      expect(body).toEqual({        
        message: 'Username and password does not match!'
      })
    })

    it('should return error if username and password does not match', async () => {
      const userCredentials = {
        username: 'limitless',
        password: 'prison',
      }

      const response = await fetch(`${url}/api/auth/login`, {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify(userCredentials),
      })

      const { status } = response;
      const body = await response.json();

      expect(status).toBe(404);
      expect(body).toEqual({
        message: 'Username and password does not match!'
      });
    })
  })

  describe('User Logout', () => {
    it('should logout successfully with right params', async () => {
      const response = await fetch(`${url}/api/auth/logout`, {
        headers: {
          'Content-Type': 'application/json',
          token: 'domainexpansion',
        },
        method: 'POST',
        body: JSON.stringify({
          username: 'satoru',
        }),
      });

      const { status } = response;
      expect(status).toBe(205);
    })

    it('should not logout successfully if without username', async () => {
      const response = await fetch(`${url}/api/auth/logout`, {
        headers: {
          'Content-Type': 'application/json',
          token: 'domainexpansion',
        },
        method: 'POST',
      });

      const { status } = response;      
      expect(status).toBe(400);
    })

    it('should not logout successfully if without token', async () => {
      const response = await fetch(`${url}/api/auth/logout`, {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });

      const { status } = response;      
      expect(status).toBe(400);
    })
  })

  describe('All Posts', () => {
    it('should return all posts sorted by most recent created_at', async () => {
      const response = await fetch(`${url}/api/posts`, {
        headers: {
          'Content-Type': 'application/json',
          token: 'domainexpansion',
        },
        method: 'GET',
      });

      const { status } = response;
      const body = await response.json();

      expect(status).toBe(200);
      expect(body).toEqual({
        data: expect.arrayContaining([expect.objectContaining({
          id: expect.any(Number),
          content: expect.any(String),
          first_name: expect.any(String),
          last_name: expect.any(String),
          username: expect.any(String),
          created_at: expect.any(String),
        })])
      });

      const unsorted = body.data
      const sorted = body.data.toSorted((a, b) => 
      (a.created_at < b.created_at) ? -1 : ((a.created_at > b.created_at) ? 1 : 0))

      expect(unsorted).toStrictEqual(sorted)
    })

    it('should return error if token is invalid', async () => {
      const response = await fetch(`${url}/api/posts`, {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'GET',
      });

      const { status } = response;
      const body = await response.json();

      expect(status).toBe(401); 
      expect(body).toEqual({
        message: 'Unauthorized post access!',
      })
    })
  })

  describe('User Posts', () => {
    it('should return user posts sorted by most recent created_at', async () => {
      const response = await fetch(`${url}/api/posts/3`, {
        headers: {
          'Content-Type': 'application/json',
          token: 'domainexpansion',
        },
        method: 'GET',
      });

      const { status } = response;
      const body = await response.json();

      expect(status).toBe(200);

      expect(body).toEqual(
        expect.objectContaining({
          data: expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(Number),
              content: expect.any(String),
            })
          ]),
        })
      );
      
      const filteredData = body.data.map(post => ({
          id: post.id,
          content: post.content,
        }
      ))

      expect(body.data).toStrictEqual(filteredData)

      const unsorted = body.data
      const sorted = body.data.toSorted((a, b) => 
      (a.created_at < b.created_at) ? -1 : ((a.created_at > b.created_at) ? 1 : 0))

      expect(unsorted).toStrictEqual(sorted)
    })

    it.todo('should return error if token is invalid', async () => {
      const response = await fetch(`${url}/api/posts/3`, {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'GET',
      });

      const { status } = response;
      const body = await response.json();

      expect(status).toBe(401); 
      expect(body).toEqual({
        message: 'Unauthorized post access!'
      })
    })
  })

  describe('Create Post', () => {
    it('should create post', async () => {
      const content = 'searching for someone to blame is such a pain.';

      const response = await fetch(`${url}/api/posts/1`, {
        headers: {
          'Content-Type': 'application/json',
          token: 'domainexpansion',
        },
        method: 'POST',
        body: JSON.stringify({
          content,
        }),
      });

      const { status } = response;
      const body = await response.json();

      expect(status).toBe(201);
      expect(body).toEqual({
        data: {
          id: expect.any(Number),
          content,
        }
      })      
    })

    it('should return error if invalid token', async () => {
      const content = 'searching for someone to blame is such a pain.';

      // NOTE: No token case. TODO: Add token mismatch case
      const response = await fetch(`${url}/api/posts/1`, {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
          content,
        }),
      });

      const { status } = response;
      const body = await response.json();

      expect(status).toBe(401);
      expect(body).toEqual({
        message: 'Unauthorized post creation!',
      })      
    })

    it('should return error if malformed request body', async () => {
      const response = await fetch(`${url}/api/posts/1`, {
        headers: {
          'Content-Type': 'application/json',
          token: 'domainexpansion',
        },
        method: 'POST',
        body: JSON.stringify({
          random: 'value'
        }),
      });

      const { status } = response;
      const body = await response.json();

      expect(status).toBe(400);
      expect(body).toEqual({
        message: 'Malformed request!',
      })      
    })
  })
  
  describe('Update Post', () => {
    it('should update post', async () => {
      const payload = {
        id: 2,
        content: 'you’re lucky if you can die a normal death...',
      }

      const response = await fetch(`${url}/api/posts/1`, {
        headers: {
          'Content-Type': 'application/json',
          token: 'domainexpansion',
        },
        method: 'PATCH',
        body: JSON.stringify(payload),
      });

      const { status } = response;
      const body = await response.json();

      expect(status).toBe(200);
      expect(body.data).toEqual(payload)
    })

    it('should return error if invalid token', async () => {
      const payload = {
        id: 2,
        content: 'you’re lucky if you can die a normal death...',
      }

      const response = await fetch(`${url}/api/posts/1`, {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'PATCH',
        body: JSON.stringify(payload),
      });

      const { status } = response;
      const body = await response.json();

      expect(status).toBe(401);
      expect(body).toEqual({
        message: 'Unauthorized post update!',
      })
    })

    it('should return error if malformed request body', async () => {
      const response = await fetch(`${url}/api/posts/1`, {
        headers: {
          'Content-Type': 'application/json',
          token: 'domainexpansion',
        },
        method: 'PATCH',
        body: JSON.stringify({
          random: 'value'
        }),
      });

      const { status } = response;
      const body = await response.json();

      expect(status).toBe(400);
      expect(body).toEqual({
        message: 'Malformed request!',
      })       
    })
  })

  describe('Delete Post', () => {
    it('should delete post', async () => {
      const response = await fetch(`${url}/api/posts/1`, {
        headers: {
          'Content-Type': 'application/json',
          token: 'domainexpansion',
        },
        method: 'DELETE',
      });

      const { status } = response;

      expect(status).toBe(204);
    })

    it('should return error if invalid token', async () => {
      const response = await fetch(`${url}/api/posts/1`, {
        headers: {
          'Content-Type': 'application/json',
          token: 'domainexpansion',
        },
        method: 'DELETE',
      });

      const { status } = response;

      expect(status).toBe(204);
    })
  })
})
