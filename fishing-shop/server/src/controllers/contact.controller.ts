import { Request, Response } from 'express';

export const sendContactEmail = async (req: Request, res: Response) => {
  try {
    // Since we're using EmailJS on the frontend, we don't need backend email handling
    res.json({
      success: true,
      message: 'Email functionality is handled by EmailJS on the frontend'
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
}; 