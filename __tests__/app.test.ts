import request from 'supertest';

import app from '@src/app';

describe('app', () => {
  /**
   * Testing GET V1 api healthChecker endpoint
   */
  describe('GET /api/v1', () => {
    describe('given the endpoint exist', () => {
      it('should return a 200 status with with a json message', (done) => {
        request(app).get('/api/v1').set('Accept', 'application/json').expect('Content-Type', /json/).expect(
          200,
          {
            success: true,
            error: false,
            message: 'Welcome to Rest API - 👋🌎🌍🌏',
            status: 200,
            data: null,
          },
          done
        );
      });
    });
  });

  /**
   * Testing GET healthChecker endpoint
   */
  describe('GET /api/v1/healthChecker', () => {
    describe('given the endpoint exist', () => {
      it('should return a 200 status with with a json message', (done) => {
        request(app)
          .get('/api/v1/healthChecker')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(
            200,
            {
              success: true,
              error: false,
              message: 'Welcome to Rest API - 👋🌎🌍🌏 - health check confirm',
              status: 200,
              data: null,
            },
            done
          );
      });
    });
  });

  /**
   * Testing GET not found endpoints
   */
  describe('GET /not-found-endpoint', () => {
    describe('given the endpoint does not exist', () => {
      it('should return a 404 status with not found message', async () =>
        request(app)
          .get(`/not-found-endpoint`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .then((response) => {
            expect(response.body).toMatchObject({
              data: null,
              error: true,
              status: 404,
              message: 'Route - /not-found-endpoint  Not Found',
              stack: expect.any(String),
            });
          }));
    });
  });
});
