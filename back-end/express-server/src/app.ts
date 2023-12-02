// registering routes

import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import landmarkRoutes from './routes/landmark.router.js';

const app = express();

// Middleware to parse JSON bodies
app.use(bodyParser.json({ limit: '5mb' }));
app.use(cors());

// Routes
app.use('/landmarks', landmarkRoutes);

export default app;
