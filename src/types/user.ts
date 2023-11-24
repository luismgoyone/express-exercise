interface User {
  first_name: string;
  last_name: string;
  username: string;
  password: string;
}

export type UserLogin = Pick<User, "username" | "password">;

export default User;
