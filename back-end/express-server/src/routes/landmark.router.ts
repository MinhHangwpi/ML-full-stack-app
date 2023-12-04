import express from 'express';
import { fetchPrediction } from '../controllers/landmark.controllers';

const router = express.Router();

router.post('/', fetchPrediction);

export default router;
