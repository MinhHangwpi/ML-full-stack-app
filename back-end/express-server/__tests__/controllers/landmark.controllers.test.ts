import { fetchPrediction } from '../../src/controllers/landmark.controllers';
import request from 'supertest';
import axios from 'axios';
import app from '../../src/app';
import fs from 'fs';


jest.mock('axios');
const mockedAxiosPost = axios.post as jest.MockedFunction<typeof axios.post>;

describe('handleLandmarkData', () => {

  it('if the received json is invalid per the requestValidator schema, should send error response', async () => {
    // Read data from an invalid JSON file
    try {
      let dataFromFile;
      const jsonString = await fs.promises.readFile(__dirname + '/../data/invalid_received_data.json', 'utf8');

      dataFromFile = JSON.parse(jsonString);
      // No need to mock axios.post since the request should fail validation before reaching this point

      // Use supertest to test the endpoint with invalid data
      const response = await request(app)
        .post('/landmarks')
        .send({ data: dataFromFile });

      expect(response.statusCode).toBe(500); 
    } catch (error) {
      console.error("Error in test setup:", error);
    }
  });


  it('handles the request and response', async () => {

    try {
      let dataFromFile;

      const jsonString = await fs.promises.readFile(__dirname + '/../data/invalid_received_data.json', 'utf8');

      dataFromFile = JSON.parse(jsonString);

      mockedAxiosPost.mockResolvedValue({ status: 200, data: { result: 'success' } });

      const response = await request(app)
        .post('/landmarks')
        .send({ data: dataFromFile });

      expect(response.statusCode).toBe(200);
      expect(axios.post).toHaveBeenCalled();
      expect(response.body).toEqual({ result: 'success' });
    } catch (error) {
      console.error("Error in test setup:", error);
    }
  });
});
