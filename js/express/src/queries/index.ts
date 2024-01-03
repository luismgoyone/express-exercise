import pgPromise from 'pg-promise';

const pgp = pgPromise();

export const CREATE_DATABASE = new pgp.QueryFile(
  './queries/createDatabase.sql', { minify: true, debug: true })

export const CREATE_TABLES = new pgp.QueryFile(
  './queries/createTables.sql', { minify: true, debug: true });

export const DROP_TABLES = new pgp.QueryFile(
  './queries/dropTables.sql', { minify: true, debug: true });

export const REGISTER_USER = new pgp.QueryFile(
  './queries/registerUser.sql', { minify: true, debug: true });


export const LOGIN_USER = new pgp.QueryFile(
  './queries/loginUser.sql', { minify: true, debug: true })