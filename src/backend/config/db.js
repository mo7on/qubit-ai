const { Pool } = require('pg');
// Change:
// const mongoose = require('mongoose');
// const dotenv = require('dotenv');
// To:
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const connectDB = async () => {
  try {
    await pool.connect();
    console.log('PostgreSQL Connected');
    
    // Create tables if they don't exist
    await createTables();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const createTables = async () => {
  try {
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('Tables created or already exist');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
};

module.exports = { connectDB, pool };