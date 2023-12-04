import { Request, Response } from 'express';
import { fullSchema } from '../services/requestValidator';
import axios from 'axios';
import { ValidationError } from 'yup';


export const fetchPrediction = async (req: Request, res: Response) => {
  try {

    await fullSchema.validate(req.body);

    const flaskServerURL = 'http://flask_app:5000/endpoint'; // Or the appropriate URL
    const response = await axios.post(flaskServerURL, req.body);

    if (response.status === 200) {
      res.json(response.data);
    } else {
      console.error('Flask server response with status:', response.status);
      res.status(response.status).json({
        message: `Flask server responded with status ${response.status}`
      });
    }
  } catch (error) {

    // Explicitly catch the yup.ValidationError
    if (ValidationError.isError(error)) {
      console.error('Request validation error:', error.errors);
      return res.status(400).json({ message: 'Request validation error', errors: error.errors });
    }

    console.error('Error forwarding data or receiving response to Flask server:', error);
    res.status(500).json({ message: 'Error forwarding data or receiving response to Flask server' });
  }
};

