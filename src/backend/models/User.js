const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class User {
  constructor(id, name, email, password, createdAt) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password;
    this.createdAt = createdAt;
  }

  // Find user by ID
  static async findById(id) {
    try {
      const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
      if (result.rows.length === 0) return null;
      
      const user = result.rows[0];
      return new User(
        user.id,
        user.name,
        user.email,
        null, // Don't return password
        user.created_at
      );
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }

  // Find user by email
  static async findOne(filters) {
    try {
      const { email, includePassword } = filters;
      let query = 'SELECT * FROM users WHERE email = $1';
      
      const result = await pool.query(query, [email]);
      if (result.rows.length === 0) return null;
      
      const user = result.rows[0];
      return new User(
        user.id,
        user.name,
        user.email,
        includePassword ? user.password : null,
        user.created_at
      );
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  // Create a new user
  static async create(userData) {
    try {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      const result = await pool.query(
        'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
        [userData.name, userData.email, hashedPassword]
      );
      
      const user = result.rows[0];
      return new User(
        user.id,
        user.name,
        user.email,
        null, // Don't return password
        user.created_at
      );
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Get signed JWT token
  getSignedJwtToken() {
    return jwt.sign({ id: this.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });
  }

  // Match password
  async matchPassword(enteredPassword) {
    try {
      // Get user with password
      const result = await pool.query('SELECT password FROM users WHERE id = $1', [this.id]);
      if (result.rows.length === 0) return false;
      
      const hashedPassword = result.rows[0].password;
      return await bcrypt.compare(enteredPassword, hashedPassword);
    } catch (error) {
      console.error('Error matching password:', error);
      throw error;
    }
  }
}

module.exports = User;