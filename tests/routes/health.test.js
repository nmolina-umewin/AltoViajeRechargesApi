"use strict";

describe('Routes', () => {
    describe('Health', () => {
        describe('GET /health', () => {
            it('should return health check information', done => {
                request(app)
                    .get('/health')
                    .set('Accept', 'application/json')
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .end(done);
            });
        });
    });
});
