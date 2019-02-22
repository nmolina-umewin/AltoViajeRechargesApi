"use strict";

describe('Routes', () => {
    describe('Services', () => {
        describe('GET /services', () => {
            it('should return all services', done => {
                request(app)
                    .get('/services')
                    .set('Accept', 'application/json')
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .end(done);
            });
        });

        context('when set id_service path parameter', () => {
            describe('GET /services/1', () => {
                it('should return service with ID 1', done => {
                    request(app)
                        .get('/services/1')
                        .set('Accept', 'application/json')
                        .expect('Content-Type', /json/)
                        .expect(200)
                        .end(done);
                });
            });

            describe('GET /services/1/token', () => {
                it('should return service token for service with ID 1', done => {
                    request(app)
                        .get('/services/1/token')
                        .set('Accept', 'application/json')
                        .expect('Content-Type', /json/)
                        .expect(200)
                        .end(done);
                });
            });

            describe('GET /services/1/rechage', () => {
                it('should return recharge for service with ID 1', function(done) {
                    this.timeout(10000);

                    request(app)
                        .post('/services/1/recharge')
                        .set('Accept', 'application/json')
                        .send({
                            payload: {
                                cardNumber: '6061267340141116',
                                amount: 50
                            }
                        })
                        .expect('Content-Type', /json/)
                        .expect(200)
                        .end(done);
                });
            });

            describe('GET /rechages', () => {
                it('should return recharge for service with ID 1', function(done) {
                    this.timeout(10000);

                    request(app)
                        .post('/recharges')
                        .set('Accept', 'application/json')
                        .send({
                            idService: 1,
                            payload: {
                                cardNumber: '6061267340141116',
                                amount: 50
                            }
                        })
                        .expect('Content-Type', /json/)
                        .expect(200)
                        .end(done);
                });
            });
        });
    });
});
