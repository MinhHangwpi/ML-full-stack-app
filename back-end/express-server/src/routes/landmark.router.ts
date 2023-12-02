import express from 'express';
import { handleLandmarkData } from '../controllers/landmark.controllers.js';

const router = express.Router();

router.post('/', handleLandmarkData);

export default router;
