/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .createTable('users', (table) => {
      /*
        CREATE TABLE "users" (
          "id" serial primary key,
          "first_name" varchar(20) not null,
          "last_name" varchar(20) not null
        );
      */
      table.increments('id').primary();
      table.string('first_name', 20).notNullable();
      table.string('last_name', 20).notNullable();
    })
    .createTable('user_logins', (table) => {
      /*
        CREATE TABLE "user_logins" (
          "user_id" integer references users,
          "username" varchar(20) unique not null,
          "password" varchar(20) not null,
          "token" text,
          "last_login_at" timestamp
        );
      */
      table.integer('user_id').unsigned().references('id').inTable('users');
      table.string('username', 20).unique().notNullable();
      table.string('password', 20).notNullable();
      table.text('token').defaultTo(null);
      table.timestamp('last_login_at').defaultTo(knex.fn.now());
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('users')
    .dropTableIfExists('user_logins');
};
