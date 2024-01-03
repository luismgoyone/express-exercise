CREATE EXTENSION IF NOT EXISTS dblink;
CREATE EXTENSION IF NOT EXISTS pgTap;

DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_database WHERE datname = 'eep') THEN
    RAISE NOTICE 'Database already exists';
  ELSE
    PERFORM dblink_exec('dbname=' || current_database(), 'CREATE DATABASE eep');
  END IF;
END $$;