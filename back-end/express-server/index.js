import express from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';

const app = express();

// Middleware to parse JSON bodies
app.use(bodyParser.json({ limit: '5mb' }));

// POST endpoint to receive data
app.post('/landmarks', async (req, res) => {
  // Log the request body
  // console.log('Received data:', req.body);

  try {
    // Forward the data to the Flask server
    const flaskServerURL = 'http://localhost:5000/endpoint'; // Replace with your Flask server's details
    const response = await axios.post(flaskServerURL, req.body);

    // Respond to the client with the Flask server's response
    res.json(response.data);
  } catch (error) {
    console.error('Error forwarding data:', error.message);
    res.status(500).json({ message: 'Error forwarding data to Flask server' }); // need error handling for when the flask server is down.
  }
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});


/**
 * Sample client request:
 * curl -X POST -H "Content-Type: application/json" -d @data.json http://localhost:5000/landmarks
 */