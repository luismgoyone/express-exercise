-- REVIEW: Without username check
-- SELECT 
--   ul.user_id AS id, 
--   u.first_name, 
--   u.last_name, 
--   ul.username, 
--   ul.token
--     FROM user_logins ul
--       JOIN users u ON ul.user_id = u.id
--         WHERE username = $1 AND password = $2;

WITH 
  new_login AS (
    UPDATE user_logins
      SET token = $1
        WHERE 
          EXISTS (
            SELECT 1 FROM user_logins WHERE username = $2
          )
          AND password = $3
          RETURNING *
  ),
  SELECT 
    nl.user_id AS id, 
    u.first_name, 
    u.last_name, 
    nl.username, 
    nl.token
    FROM new_login nl
      WHERE 
        EXISTS (
          SELECT 1 FROM user_logins WHERE username = $2 AND password = $3
        )
          JOIN users u ON nl.user_id = u.id