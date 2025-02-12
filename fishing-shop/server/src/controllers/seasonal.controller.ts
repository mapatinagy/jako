import { Request, Response } from 'express';
import pool from '../config/database';
import fs from 'fs/promises';
import path from 'path';

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const [products] = await pool.execute(
      'SELECT * FROM seasonal_products ORDER BY created_at DESC'
    );
    res.json({ success: true, products });
  } catch (error) {
    console.error('Error fetching seasonal products:', error);
    res.status(500).json({ success: false, message: 'Hiba történt a termékek lekérése során' });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { title, content } = req.body;
    const imagePath = req.file ? `/uploads/seasonal/${req.file.filename}` : null;

    const [result] = await pool.execute(
      'INSERT INTO seasonal_products (title, content, image_path) VALUES (?, ?, ?)',
      [title, content, imagePath]
    );

    const insertId = (result as any).insertId;
    const [newProduct] = await pool.execute(
      'SELECT * FROM seasonal_products WHERE id = ?',
      [insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Termék sikeresen létrehozva',
      product: (newProduct as any[])[0]
    });
  } catch (error) {
    console.error('Error creating seasonal product:', error);
    res.status(500).json({ success: false, message: 'Hiba történt a termék létrehozása során' });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const imagePath = req.file ? `/uploads/seasonal/${req.file.filename}` : null;

    // If new image uploaded, delete old one
    if (imagePath) {
      const [oldProduct] = await pool.execute(
        'SELECT image_path FROM seasonal_products WHERE id = ?',
        [id]
      );
      
      if ((oldProduct as any[])[0]?.image_path) {
        const oldPath = path.join(__dirname, '../../', (oldProduct as any[])[0].image_path);
        await fs.unlink(oldPath).catch(() => {});
      }
    }

    const updateQuery = imagePath
      ? 'UPDATE seasonal_products SET title = ?, content = ?, image_path = ? WHERE id = ?'
      : 'UPDATE seasonal_products SET title = ?, content = ? WHERE id = ?';
    
    const updateParams = imagePath
      ? [title, content, imagePath, id]
      : [title, content, id];

    await pool.execute(updateQuery, updateParams);

    const [updatedProduct] = await pool.execute(
      'SELECT * FROM seasonal_products WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Termék sikeresen frissítve',
      product: (updatedProduct as any[])[0]
    });
  } catch (error) {
    console.error('Error updating seasonal product:', error);
    res.status(500).json({ success: false, message: 'Hiba történt a termék frissítése során' });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get image path before deletion
    const [product] = await pool.execute(
      'SELECT image_path FROM seasonal_products WHERE id = ?',
      [id]
    );

    // Delete image file if exists
    if ((product as any[])[0]?.image_path) {
      const imagePath = path.join(__dirname, '../../', (product as any[])[0].image_path);
      await fs.unlink(imagePath).catch(() => {});
    }

    await pool.execute('DELETE FROM seasonal_products WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Termék sikeresen törölve',
      deletedId: id
    });
  } catch (error) {
    console.error('Error deleting seasonal product:', error);
    res.status(500).json({ success: false, message: 'Hiba történt a termék törlése során' });
  }
};

export const toggleProductStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    await pool.execute(
      'UPDATE seasonal_products SET is_active = NOT is_active WHERE id = ?',
      [id]
    );

    const [updatedProduct] = await pool.execute(
      'SELECT * FROM seasonal_products WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Termék státusza sikeresen módosítva',
      product: (updatedProduct as any[])[0]
    });
  } catch (error) {
    console.error('Error toggling seasonal product status:', error);
    res.status(500).json({ success: false, message: 'Hiba történt a termék státuszának módosítása során' });
  }
};

export const uploadProductImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Nincs feltöltött kép' });
    }

    const imagePath = `/uploads/seasonal/${req.file.filename}`;
    res.json({
      success: true,
      message: 'Kép sikeresen feltöltve',
      imagePath
    });
  } catch (error) {
    console.error('Error uploading product image:', error);
    res.status(500).json({ success: false, message: 'Hiba történt a kép feltöltése során' });
  }
}; 