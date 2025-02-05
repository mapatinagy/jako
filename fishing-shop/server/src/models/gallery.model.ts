import pool from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface GalleryImage extends RowDataPacket {
  id: number;
  filename: string;
  original_filename: string;
  description: string | null;
  created_at: Date;
  file_size: number;
  mime_type: string;
  upload_status: 'pending' | 'completed' | 'failed';
  upload_error: string | null;
}

export class GalleryModel {
  static async getAllImages(): Promise<GalleryImage[]> {
    const [rows] = await pool.execute<GalleryImage[]>(
      'SELECT * FROM gallery ORDER BY created_at DESC'
    );
    return rows;
  }

  static async getImageById(id: number): Promise<GalleryImage | null> {
    const [rows] = await pool.execute<GalleryImage[]>(
      'SELECT * FROM gallery WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  static async createImage(data: Partial<GalleryImage>): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO gallery (
        filename, original_filename, description, 
        file_size, mime_type, upload_status
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        data.filename,
        data.original_filename,
        data.description,
        data.file_size,
        data.mime_type,
        data.upload_status || 'pending'
      ]
    );
    return result.insertId;
  }

  static async updateImage(id: number, data: Partial<GalleryImage>): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE gallery 
       SET description = COALESCE(?, description),
           upload_status = COALESCE(?, upload_status),
           upload_error = COALESCE(?, upload_error)
       WHERE id = ?`,
      [data.description, data.upload_status, data.upload_error, id]
    );
    return result.affectedRows > 0;
  }

  static async deleteImage(id: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM gallery WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  static async checkDuplicateFilename(filename: string): Promise<boolean> {
    const [rows] = await pool.execute<GalleryImage[]>(
      'SELECT COUNT(*) as count FROM gallery WHERE filename = ?',
      [filename]
    );
    return (rows[0] as any).count > 0;
  }
} 