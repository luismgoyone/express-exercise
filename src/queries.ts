// TODO: update/fix/organize queries [make folder for each query categ]

// register queries

// login queries

const LOGIN_TOKEN_QUERY =
  "SELECT * FROM user_logins WHERE user_logins.token = $1";

export { LOGIN_TOKEN_QUERY };
