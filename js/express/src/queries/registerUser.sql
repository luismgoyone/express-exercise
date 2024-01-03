DROP FUNCTION register_user(TEXT, TEXT, TEXT, TEXT);

CREATE OR REPLACE FUNCTION register_user (
  p_first_name TEXT, 
  p_last_name TEXT,
  p_username TEXT,
  p_password TEXT
) RETURNS TABLE (
  id INT,
  first_name VARCHAR(20),
  last_name VARCHAR(20),
  username VARCHAR(20)  
) AS $$
  BEGIN
    IF EXISTS (SELECT 1 FROM user_logins WHERE user_logins.username = p_username) THEN
      RETURN;
    ELSE
      RETURN QUERY
        WITH 
          new_user AS (
            INSERT INTO users (first_name, last_name) 
              VALUES (p_first_name, p_last_name)
                RETURNING users.id, users.first_name, users.last_name
          ), 
          new_login AS (
            INSERT INTO user_logins (user_id, username, password)
              VALUES ((SELECT new_user.id FROM new_user), p_username, p_password)
                RETURNING user_logins.username
          ) 
          SELECT * FROM new_user CROSS JOIN new_login;
    END IF;
  END;
$$ LANGUAGE plpgsql;

SELECT * FROM register_user($1, $2, $3, $4);