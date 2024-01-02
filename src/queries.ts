const LOGIN_TOKEN_QUERY =
  "SELECT * FROM user_logins WHERE user_logins.token = $1";

export { LOGIN_TOKEN_QUERY };
