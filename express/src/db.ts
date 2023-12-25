import pgPromise from 'pg-promise';

const pgp = pgPromise();
const db = pgp({
  user: 'maurusrv',
  host: 'localhost',
  port: 5432,
  database: 'eep',
});

const createDB = async () => {
  try {
    await db.none('CREATE DATABASE eep');
    
    console.info('[postgres]: Database created.')
  } catch (err) {
    console.error(err);
  }
};

// const createTable = async () => {
//   try {
//     const 
//   }
// };