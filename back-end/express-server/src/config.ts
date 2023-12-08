import dotenv from 'dotenv';
dotenv.config();

export const API_PORT = parseInt(process.env.API_PORT as string, 10) || 3030;
export const NODE_ENV = process.env.NODE_ENV