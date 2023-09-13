import express from 'express';
import bodyParser from 'body-parser';
const app = express();

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// POST endpoint to receive data
app.post('/landmarks', (req, res) => {
  // Log the request body
  console.log('Received data:', req.body);

  // Respond to the client
  res.json({ message: 'Data received!' });
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