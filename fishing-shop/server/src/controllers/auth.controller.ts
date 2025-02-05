import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/database';
import { LoginRequest } from '../types/auth.types';
import { SignOptions } from 'jsonwebtoken';

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password }: LoginRequest = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const [users] = await pool.execute(
      'SELECT * FROM admin_user WHERE username = ?',
      [username]
    );

    const user = (users as any[])[0];

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      // Update failed login attempts
      await pool.execute(
        `UPDATE admin_user 
         SET failed_login_attempts = failed_login_attempts + 1,
             last_failed_login = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [user.id]
      );

      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Reset failed login attempts and update last login
    await pool.execute(
      `UPDATE admin_user 
       SET failed_login_attempts = 0,
           last_login = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [user.id]
    );

    const jwtOptions: SignOptions = {
      expiresIn: (process.env.JWT_EXPIRES_IN || '24h') as jwt.SignOptions['expiresIn']
    };

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET || 'fallback_secret',
      jwtOptions
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createInitialAdmin = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Check if admin already exists
    const [existingUsers] = await pool.execute(
      'SELECT COUNT(*) as count FROM admin_user'
    );
    
    if ((existingUsers as any[])[0].count > 0) {
      return res.status(400).json({ message: 'Admin user already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.execute(
      `INSERT INTO admin_user (username, password_hash) 
       VALUES (?, ?)`,
      [username, hashedPassword]
    );

    res.status(201).json({ message: 'Admin user created successfully' });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 