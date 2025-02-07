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

export const verifyToken = async (req: Request, res: Response) => {
  // If we reach here, it means the token is valid (authenticateToken middleware passed)
  res.json({ success: true, message: 'Token is valid' });
};

export const getSecurityQuestions = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const [users] = await pool.execute(
      'SELECT security_question1, security_question2, security_question3 FROM admin_user WHERE id = ?',
      [userId]
    );

    const user = (users as any[])[0];
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      securityQuestion1: user.security_question1,
      securityQuestion2: user.security_question2,
      securityQuestion3: user.security_question3
    });
  } catch (error) {
    console.error('Error fetching security questions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const {
      currentPassword,
      newUsername,
      newEmail,
      newPassword,
      securityQuestion1,
      securityAnswer1,
      securityQuestion2,
      securityAnswer2,
      securityQuestion3,
      securityAnswer3
    } = req.body;

    // Verify current password
    const [users] = await pool.execute(
      'SELECT password_hash FROM admin_user WHERE id = ?',
      [userId]
    );

    const user = (users as any[])[0];
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];

    if (newUsername) {
      // Check if username is already taken
      const [existingUsers] = await pool.execute(
        'SELECT id FROM admin_user WHERE username = ? AND id != ?',
        [newUsername, userId]
      );
      if ((existingUsers as any[]).length > 0) {
        return res.status(400).json({ message: 'Username is already taken' });
      }
      updates.push('username = ?');
      values.push(newUsername);
    }

    if (newEmail) {
      // Check if email is already taken
      const [existingEmails] = await pool.execute(
        'SELECT id FROM admin_user WHERE email = ? AND id != ?',
        [newEmail, userId]
      );
      if ((existingEmails as any[]).length > 0) {
        return res.status(400).json({ message: 'Email is already taken' });
      }
      updates.push('email = ?');
      values.push(newEmail);
    }

    if (newPassword) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updates.push('password_hash = ?');
      values.push(hashedPassword);
    }

    // Add security questions and answers if provided
    if (securityQuestion1 && securityAnswer1) {
      updates.push('security_question1 = ?, security_answer1 = ?');
      const hashedAnswer1 = await bcrypt.hash(securityAnswer1, 10);
      values.push(securityQuestion1, hashedAnswer1);
    }

    if (securityQuestion2 && securityAnswer2) {
      updates.push('security_question2 = ?, security_answer2 = ?');
      const hashedAnswer2 = await bcrypt.hash(securityAnswer2, 10);
      values.push(securityQuestion2, hashedAnswer2);
    }

    if (securityQuestion3 && securityAnswer3) {
      updates.push('security_question3 = ?, security_answer3 = ?');
      const hashedAnswer3 = await bcrypt.hash(securityAnswer3, 10);
      values.push(securityQuestion3, hashedAnswer3);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No updates provided' });
    }

    // Add user ID to values array
    values.push(userId);

    // Execute update query
    await pool.execute(
      `UPDATE admin_user SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getRecoveryQuestions = async (req: Request, res: Response) => {
  try {
    const { username, email } = req.body;

    if (!username && !email) {
      return res.status(400).json({ message: 'Either username or email is required' });
    }

    // Build query based on provided credentials
    const query = email 
      ? 'SELECT security_question1, security_question2, security_question3 FROM admin_user WHERE email = ?'
      : 'SELECT security_question1, security_question2, security_question3 FROM admin_user WHERE username = ?';
    const value = email || username;

    const [users] = await pool.execute(query, [value]);

    const user = (users as any[])[0];
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Only return the questions, not the answers
    res.json({
      securityQuestion1: user.security_question1,
      securityQuestion2: user.security_question2,
      securityQuestion3: user.security_question3
    });
  } catch (error) {
    console.error('Error fetching recovery questions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const verifySecurityAnswers = async (req: Request, res: Response) => {
  try {
    const { username, email, answers } = req.body;

    if ((!username && !email) || !answers || answers.length !== 3) {
      return res.status(400).json({ message: 'Identification (username or email) and all answers are required' });
    }

    // Build query based on provided credentials
    const query = email 
      ? 'SELECT username, security_answer1, security_answer2, security_answer3 FROM admin_user WHERE email = ?'
      : 'SELECT username, security_answer1, security_answer2, security_answer3 FROM admin_user WHERE username = ?';
    const value = email || username;

    const [users] = await pool.execute(query, [value]);

    const user = (users as any[])[0];
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify all answers
    const isAnswer1Valid = await bcrypt.compare(answers[0], user.security_answer1);
    const isAnswer2Valid = await bcrypt.compare(answers[1], user.security_answer2);
    const isAnswer3Valid = await bcrypt.compare(answers[2], user.security_answer3);

    if (!isAnswer1Valid || !isAnswer2Valid || !isAnswer3Valid) {
      return res.status(401).json({ message: 'Incorrect answers' });
    }

    res.json({ 
      message: 'Answers verified successfully',
      username: user.username // Return username after successful verification
    });
  } catch (error) {
    console.error('Error verifying security answers:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { username, newPassword, answers } = req.body;

    if (!username || !newPassword || !answers || answers.length !== 3) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Verify answers again for security
    const [users] = await pool.execute(
      'SELECT security_answer1, security_answer2, security_answer3 FROM admin_user WHERE username = ?',
      [username]
    );

    const user = (users as any[])[0];
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify all answers
    const isAnswer1Valid = await bcrypt.compare(answers[0], user.security_answer1);
    const isAnswer2Valid = await bcrypt.compare(answers[1], user.security_answer2);
    const isAnswer3Valid = await bcrypt.compare(answers[2], user.security_answer3);

    if (!isAnswer1Valid || !isAnswer2Valid || !isAnswer3Valid) {
      return res.status(401).json({ message: 'Incorrect answers' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the password
    await pool.execute(
      'UPDATE admin_user SET password_hash = ? WHERE username = ?',
      [hashedPassword, username]
    );

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getUserData = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const [users] = await pool.execute(
      'SELECT username, email FROM admin_user WHERE id = ?',
      [userId]
    );

    const user = (users as any[])[0];
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      username: user.username,
      email: user.email
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 