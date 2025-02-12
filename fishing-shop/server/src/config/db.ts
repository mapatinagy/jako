import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,  // Make sure this is set
  port: Number(process.env.DB_PORT),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test the connection and database selection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    await connection.query('USE fishing_shop');
    const [result] = await connection.query('SELECT 1 as test');
    console.log('Database connection and selection successful');
    connection.release();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
};

testConnection();

export default pool; 