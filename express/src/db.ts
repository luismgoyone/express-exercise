import pgPromise from 'pg-promise';

const pgp = pgPromise();

const dbConfig = {
  host: 'localhost',
  port: 5432,
  database: 'postgres', // Expected default
  user: 'maurusrv',
  // password: '',
}

const init = async (): Promise<boolean> => {
  console.info('[db]: Initializing database...')

  try {
    const db = pgp(dbConfig);

    // const isDBExisting = await db.oneOrNone('SELECT 1 FROM pg_database WHERE datname = $1', 'eep');
    // if (!isDBExisting) {
      await db.none(`
        CREATE EXTENSION IF NOT EXISTS dblink;

        DO $$ 
        BEGIN
          IF EXISTS (SELECT FROM pg_database WHERE datname = 'eep') THEN
            RAISE NOTICE 'Database already exists';
          ELSE
            PERFORM dblink_exec('dbname=' || current_database(), 'CREATE DATABASE eep');
          END IF;
        END $$;
      `);

      console.info('[db]: Expected database does not exist. A new one is created.');
    //  return;
    // }

    console.info('[db]: Database detected.');

    await initializeTables();

    console.info('[db]: Database initialized.')
    return true;
  } catch (error) {
    console.error('[db]: Error initializing database:', error);
    return false;
  }
}

const initializeTables = async () => {
  console.info('[db]: Initializing tables...');

  try {
    const db = pgp({ ...dbConfig, database: 'eep' })
    await db.none(`
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
    `);

    console.info('[db]: Tables initialized.')
  } catch(error) {
    console.error('[db]: Error creating tables:', error);
    return;
  }
}

export {
  init,
}