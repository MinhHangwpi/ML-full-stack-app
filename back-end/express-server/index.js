import express from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';
import cors from 'cors';

const app = express();

// Middleware to parse JSON bodies
app.use(bodyParser.json({ limit: '5mb' }));
app.use(cors());

// POST endpoint to receive data
app.post('/landmarks', async (req, res) => {
  try {
    // Forward the data to the Flask server

    /**
     * Note: if you use docker-compose to run: use the http://flask_app url;
     * If not, you will need to keep both express and flask server up and use the url /localhost:5000
     */
    const flaskServerURL = 'http://flask_app:5000/endpoint'; // Replace with your Flask server's details
    // const flaskServerURL = 'http://localhost:5000/endpoint';
    const response = await axios.post(flaskServerURL, req.body);

    // Respond to the client with the Flask server's response
    res.json(response.data);
  } catch (error) {
    console.error('Error forwarding data:', error.message);
    res.status(500).json({ message: 'Error forwarding data to Flask server' }); // need error handling for when the flask server is down.
  }
});

// Start the server
const port = 3030;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

