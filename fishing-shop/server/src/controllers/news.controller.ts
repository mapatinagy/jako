import { Request, Response } from 'express';
import pool from '../config/database';
import { CreateNewsRequest, UpdateNewsRequest, PaginationParams } from '../types/news.types';

// Get all news posts with pagination
export const getNewsPosts = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, published_only = false } = req.query as unknown as PaginationParams;
    const offset = (page - 1) * limit;

    // Build the WHERE clause
    const whereClause = published_only ? 'WHERE is_published = true' : '';

    // Get total count
    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM news ${whereClause}`
    );
    const total = (countResult as any[])[0].total;

    // Get paginated results
    const [posts] = await pool.execute(
      `SELECT * FROM news ${whereClause} 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    res.json({
      success: true,
      posts,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching news posts:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch news posts' });
  }
};

// Get single news post
export const getNewsPost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [posts] = await pool.execute('SELECT * FROM news WHERE id = ?', [id]);
    
    if (!(posts as any[])[0]) {
      return res.status(404).json({ success: false, message: 'News post not found' });
    }

    res.json({ success: true, post: (posts as any[])[0] });
  } catch (error) {
    console.error('Error fetching news post:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch news post' });
  }
};

// Create news post
export const createNewsPost = async (req: Request, res: Response) => {
  try {
    const { title, content, is_published = false, featured_image = null as string | null }: CreateNewsRequest = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }

    const [result] = await pool.execute(
      `INSERT INTO news (title, content, is_published, featured_image) 
       VALUES (?, ?, ?, ?)`,
      [title, content, is_published, featured_image]
    );

    const insertId = (result as any).insertId;
    const [newPost] = await pool.execute('SELECT * FROM news WHERE id = ?', [insertId]);

    res.status(201).json({
      success: true,
      message: 'News post created successfully',
      post: (newPost as any[])[0]
    });
  } catch (error) {
    console.error('Error creating news post:', error);
    res.status(500).json({ success: false, message: 'Failed to create news post' });
  }
};

// Update news post
export const updateNewsPost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates: UpdateNewsRequest = req.body;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'No updates provided' });
    }

    // Build update query dynamically
    const validFields = ['title', 'content', 'is_published', 'featured_image'];
    const updateFields = Object.keys(updates)
      .filter(key => validFields.includes(key) && updates[key as keyof UpdateNewsRequest] !== undefined);

    if (updateFields.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields to update' });
    }

    const query = `
      UPDATE news 
      SET ${updateFields.map(field => `${field} = ?`).join(', ')}
      WHERE id = ?
    `;

    const values = [...updateFields.map(field => updates[field as keyof UpdateNewsRequest]), id];
    await pool.execute(query, values);

    const [updatedPost] = await pool.execute('SELECT * FROM news WHERE id = ?', [id]);

    if (!(updatedPost as any[])[0]) {
      return res.status(404).json({ success: false, message: 'News post not found' });
    }

    res.json({
      success: true,
      message: 'News post updated successfully',
      post: (updatedPost as any[])[0]
    });
  } catch (error) {
    console.error('Error updating news post:', error);
    res.status(500).json({ success: false, message: 'Failed to update news post' });
  }
};

// Delete news post
export const deleteNewsPost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute('DELETE FROM news WHERE id = ?', [id]);

    if ((result as any).affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'News post not found' });
    }

    res.json({
      success: true,
      message: 'News post deleted successfully',
      deletedId: id
    });
  } catch (error) {
    console.error('Error deleting news post:', error);
    res.status(500).json({ success: false, message: 'Failed to delete news post' });
  }
};

export const uploadNewsImage = async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    const uploadedFiles = files.map(file => ({
      filename: file.filename,
      url: `/uploads/${file.filename}`
    }));

    res.json({
      success: true,
      images: uploadedFiles
    });
  } catch (error) {
    console.error('Error uploading news images:', error);
    res.status(500).json({ success: false, message: 'Error uploading images' });
  }
}; 