"use strict";

describe('Routes', () => {
    describe('Config', () => {
        describe('GET /config', () => {
            it('should return all configuration', done => {
                request(app)
                    .get('/config')
                    .set('Accept', 'application/json')
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .end(done);
            });
        });
    });
});
