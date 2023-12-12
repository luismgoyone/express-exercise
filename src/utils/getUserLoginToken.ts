import pool from "../db";
import { LOGIN_TOKEN_QUERY } from "../queries";

export const getUserLoginToken = async (token?: string) => {
  return await pool.query(LOGIN_TOKEN_QUERY, [token]);
};
