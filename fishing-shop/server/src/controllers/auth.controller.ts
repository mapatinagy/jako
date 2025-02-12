import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/database';
import { LoginRequest } from '../types/auth.types';
import { SignOptions } from 'jsonwebtoken';

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // First, log the received credentials (without the password)
    console.log('Login attempt for username:', username);

    // Get user from database
    const [users] = await pool.execute(
      'SELECT * FROM fishing_shop.admin_user WHERE username = ?',
      [username]
    );

    const user = (users as any[])[0];
    
    // Log user lookup result (without sensitive data)
    console.log('User found:', user ? 'Yes' : 'No');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    // Check which password field exists in the user object
    const hashedPassword = user.password_hash || user.password;
    
    if (!hashedPassword) {
      console.error('No password hash found in user record');
      return res.status(500).json({
        success: false,
        message: 'Authentication error'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, hashedPassword);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET || 'jak0_F1sh1ng_Sh0p_2024_S3cur3_K3y_!@#$%^&*()_+',
      { expiresIn: '1h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const createInitialAdmin = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Felhasználónév és jelszó megadása kötelező' });
    }

    // Check if admin already exists
    const [existingUsers] = await pool.execute(
      'SELECT COUNT(*) as count FROM admin_user'
    );
    
    if ((existingUsers as any[])[0].count > 0) {
      return res.status(400).json({ message: 'Az admin felhasználó már létezik' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.execute(
      `INSERT INTO admin_user (username, password_hash) 
       VALUES (?, ?)`,
      [username, hashedPassword]
    );

    res.status(201).json({ message: 'Admin felhasználó sikeresen létrehozva' });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ message: 'Belső szerverhiba' });
  }
};

export const verifyToken = async (req: Request, res: Response) => {
  // If we reach here, it means the token is valid (authenticateToken middleware passed)
  res.json({ success: true, message: 'A token érvényes' });
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
      return res.status(404).json({ message: 'Felhasználó nem található' });
    }

    res.json({
      securityQuestion1: user.security_question1,
      securityQuestion2: user.security_question2,
      securityQuestion3: user.security_question3
    });
  } catch (error) {
    console.error('Error fetching security questions:', error);
    res.status(500).json({ message: 'Belső szerverhiba' });
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
      return res.status(404).json({ message: 'Felhasználó nem található' });
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'A jelenlegi jelszó helytelen' });
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
        return res.status(400).json({ message: 'A felhasználónév már foglalt' });
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
        return res.status(400).json({ message: 'Az email cím már foglalt' });
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
      return res.status(400).json({ message: 'Nincs módosítandó adat' });
    }

    // Add user ID to values array
    values.push(userId);

    // Execute update query
    await pool.execute(
      `UPDATE admin_user SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    res.json({ message: 'Beállítások sikeresen frissítve' });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'Belső szerverhiba' });
  }
};

export const getRecoveryQuestions = async (req: Request, res: Response) => {
  try {
    const { username, email } = req.body;

    if (!username && !email) {
      return res.status(400).json({ message: 'Felhasználónév vagy email cím megadása kötelező' });
    }

    // Build query based on provided credentials
    const query = email 
      ? 'SELECT security_question1, security_question2, security_question3 FROM admin_user WHERE email = ?'
      : 'SELECT security_question1, security_question2, security_question3 FROM admin_user WHERE username = ?';
    const value = email || username;

    const [users] = await pool.execute(query, [value]);

    const user = (users as any[])[0];
    if (!user) {
      return res.status(404).json({ message: 'Felhasználó nem található' });
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
      return res.status(400).json({ message: 'Azonosító (felhasználónév vagy email) és minden válasz megadása kötelező' });
    }

    // Build query based on provided credentials
    const query = email 
      ? 'SELECT username, security_answer1, security_answer2, security_answer3 FROM admin_user WHERE email = ?'
      : 'SELECT username, security_answer1, security_answer2, security_answer3 FROM admin_user WHERE username = ?';
    const value = email || username;

    const [users] = await pool.execute(query, [value]);

    const user = (users as any[])[0];
    if (!user) {
      return res.status(404).json({ message: 'Felhasználó nem található' });
    }

    // Verify all answers
    const isAnswer1Valid = await bcrypt.compare(answers[0], user.security_answer1);
    const isAnswer2Valid = await bcrypt.compare(answers[1], user.security_answer2);
    const isAnswer3Valid = await bcrypt.compare(answers[2], user.security_answer3);

    if (!isAnswer1Valid || !isAnswer2Valid || !isAnswer3Valid) {
      return res.status(401).json({ message: 'Helytelen válasz(ok)' });
    }

    res.json({ 
      message: 'Válaszok sikeresen ellenőrizve',
      username: user.username
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
      return res.status(400).json({ message: 'Minden mező kitöltése kötelező' });
    }

    // Verify answers again for security
    const [users] = await pool.execute(
      'SELECT security_answer1, security_answer2, security_answer3 FROM admin_user WHERE username = ?',
      [username]
    );

    const user = (users as any[])[0];
    if (!user) {
      return res.status(404).json({ message: 'Felhasználó nem található' });
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

    res.json({ message: 'Jelszó sikeresen visszaállítva' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Belső szerverhiba' });
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
      return res.status(404).json({ message: 'Felhasználó nem található' });
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