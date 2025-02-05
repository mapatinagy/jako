import { Request, Response } from 'express';
import pool from '../config/database';
import { GalleryImage, UpdateImageRequest, DeleteImagesRequest } from '../types/gallery.types';

// Get all images
export const getAllImages = async (req: Request, res: Response) => {
  try {
    const [images] = await pool.execute('SELECT * FROM gallery ORDER BY created_at DESC');
    res.json({ success: true, images });
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch images' });
  }
};

// Upload new image
export const uploadImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { filename, originalname, size, mimetype } = req.file;
    const description = req.body.description || null;

    const [result] = await pool.execute(
      `INSERT INTO gallery (filename, original_filename, description, file_size, mime_type, upload_status)
       VALUES (?, ?, ?, ?, ?, 'completed')`,
      [filename, originalname, description, size, mimetype]
    );

    const insertId = (result as any).insertId;
    const [newImage] = await pool.execute('SELECT * FROM gallery WHERE id = ?', [insertId]);

    res.status(201).json({
      success: true,
      message: 'Image uploaded successfully',
      image: (newImage as any[])[0]
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ success: false, message: 'Failed to upload image' });
  }
};

// Update image description
export const updateImage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { description }: UpdateImageRequest = req.body;

    if (description === undefined) {
      return res.status(400).json({ success: false, message: 'No changes provided' });
    }

    await pool.execute(
      'UPDATE gallery SET description = ? WHERE id = ?',
      [description, id]
    );

    const [updatedImage] = await pool.execute('SELECT * FROM gallery WHERE id = ?', [id]);

    if (!(updatedImage as any[])[0]) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }

    res.json({
      success: true,
      message: 'Image updated successfully',
      image: (updatedImage as any[])[0]
    });
  } catch (error) {
    console.error('Error updating image:', error);
    res.status(500).json({ success: false, message: 'Failed to update image' });
  }
};

// Delete images
export const deleteImages = async (req: Request, res: Response) => {
  try {
    const { imageIds }: DeleteImagesRequest = req.body;

    if (!imageIds || !imageIds.length) {
      return res.status(400).json({ success: false, message: 'No images specified for deletion' });
    }

    // Get filenames before deletion for file cleanup
    const [images] = await pool.execute(
      `SELECT filename FROM gallery WHERE id IN (${imageIds.map(() => '?').join(',')})`,
      imageIds
    );

    // Delete from database
    await pool.execute(
      `DELETE FROM gallery WHERE id IN (${imageIds.map(() => '?').join(',')})`,
      imageIds
    );

    res.json({
      success: true,
      message: 'Images deleted successfully',
      deletedIds: imageIds
    });
  } catch (error) {
    console.error('Error deleting images:', error);
    res.status(500).json({ success: false, message: 'Failed to delete images' });
  }
}; 