CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(20),
  last_name VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS user_logins (
  user_id INT REFERENCES users(id),
  token TEXT,
  last_login_at TIMESTAMP,
  username VARCHAR(20),
  password VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  content TEXT,
  created_at TIMESTAMP
);
