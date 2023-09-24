import express from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';


const app = express();

// Middleware to parse JSON bodies
app.use(bodyParser.json({limit: '5mb'}));

// POST endpoint to receive data
app.post('/landmarks', async (req, res) => {
  // Log the request body
  console.log('Received data:', req.body);

  try {
    // Forward the data to the Flask server
    const flaskServerURL = 'http://localhost:5000/endpoint'; // Replace with your Flask server's details
    const response = await axios.post(flaskServerURL, req.body);

    // Respond to the client with the Flask server's response
    res.json(response.data);
  } catch (error) {
    console.error('Error forwarding data:', error.message);
    res.status(500).json({ message: 'Error forwarding data to Flask server' });
  }

  // console.log(req);
  // // Respond to the client
  // res.json({ message: 'Data received!' });  
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});


/**
 * 
 * A sample front end request would be
 * 
 */
// curl -X POST -H "Content-Type: application/json" -d '[{"x":0.35211437940597534,"y":1.0783183574676514,"z":9.194144467983278e-7},{"x":0.4362814426422119,"y":1.075021505355835,"z":-0.01458402443677187}]' http://localhost:3000/landmarks

