import pgPromise, { IDatabase } from 'pg-promise';
import pgMonitor from 'pg-monitor';
import fs from 'fs';
import { importer } from '@dbml/core';
import { exec } from 'child_process';
import {
  CREATE_DATABASE,
  CREATE_TABLES,
  DROP_TABLES,
} from './queries';

const pgp = pgPromise();
  
const dbConfig = {
  host: 'localhost',
  port: 5432,
  database: 'postgres', // Expected default
  user: 'maurusrv',
  // password: '',
}

const initializeDB = async () => {
  console.info('[db]: Initializing database...')
  
  let db = null;

  try {
    db = pgp(dbConfig);
    pgMonitor.attach(dbConfig);

    await db.none(CREATE_DATABASE);

    db = await initializeTables();

    console.info('[db]: Database initialized.')
    return db;
  } catch (error) {
    console.error('[db]: Error initializing database:', error);
    return null;
  }
}

const initializeTables = async () => {
  console.info('[db]: Initializing tables...');
  let db = null
  try {
    const updatedDBConfig = { ...dbConfig, database: 'eep' }
    db = pgp(updatedDBConfig);
    pgMonitor.detach();
    pgMonitor.attach(updatedDBConfig);
    await db.none(CREATE_TABLES);

    console.info('[db]: Tables initialized.');
    generateDBML();
    return db;
  } catch(error) {
    console.error('[db]: Error creating tables:', error);
    return;
  }
}

const generateDBML = () => {
  const schema = fs.readFileSync('./src/queries/createTables.sql', 'utf-8');
  const psql = importer.import(schema, 'postgres');
  fs.writeFileSync('./docs/schema.dbml', psql);
  exec('npx dbml-renderer -i ./docs/schema.dbml -o ./docs/dbml.svg')
}

const resetDB = async (db: null | IDatabase<any>) => {
  try {
    if (db) {
      await db.none(DROP_TABLES);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error occurred during cleanup:', error);
    process.exit(1);
  }
}

export {
  initializeDB,
  resetDB,
}
