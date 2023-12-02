import { handleLandmarkData } from '../../src/controllers/landmark.controllers.js';
import request from 'supertest';
import axios from 'axios';
import app from 'src/app.js';
import fs from 'fs';

jest.mock('axios');
const mockedAxiosPost = axios.post as jest.MockedFunction<typeof axios.post>;

describe('handleLandmarkData', () => {
  
  it('if the received json is invalid per the requestValidator schema, should send error response', async () => {
    // Read data from an invalid JSON file
    try {
      let dataFromFile;
      const invalidDataFromFile = fs.readFile('./../invalid_received_data.json', 'utf8', (err, jsonString) => {
        if(err){
          console.error("Error reading input file: ", err);
          return;
        }
        dataFromFile = JSON.parse(jsonString);
      });
      
      // No need to mock axios.post since the request should fail validation before reaching this point

      // Use supertest to test the endpoint with invalid data
      const response = await request(app)
        .post('/landmarks')
        .send({ data: dataFromFile });

      expect(response.statusCode).toBe(500); 
      // expect(response.body).toHaveProperty('error'); 
    } catch (error) {
      console.error("Error in test setup:", error);
    }
  });


  it('handles the request and response', async () => {

    let dataFromFile;
      const invalidDataFromFile = fs.readFile('./../valid_received_data.json', 'utf8', (err, jsonString) => {
        if(err){
          console.error("Error reading input file: ", err);
          return;
        }
        dataFromFile = JSON.parse(jsonString);
      });
    

    mockedAxiosPost.mockResolvedValue({ status: 200, data: { result: 'success' } });

    // Use supertest to test the endpoint
    const response = await request(app)
      .post('/landmarks')
      .send({ data: dataFromFile });

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ message: "received the request" });
    // Further assertions for Flask server response
    expect(axios.post).toHaveBeenCalled();
    expect(response.body).toEqual({ result: 'success' });
  });
});
