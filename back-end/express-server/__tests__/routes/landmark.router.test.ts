import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';
import landmarkRoutes from '../../src/routes/landmark.router';

const app = express();
app.use(bodyParser.json());
app.use('/landmarks', landmarkRoutes);

describe('POST /landmarks', () => {
  it('responds with json', async () => {
    const response = await request(app)
      .post('/landmarks')
      .send({ data: 'some data' })
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toEqual({ message: 'received the request' });
  });
});
