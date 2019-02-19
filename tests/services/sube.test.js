"use strict";

const Services = require('../../services');
const SubeService = Services[ID_SERVICE_SUBE];

describe('Services', () => {
    describe('SUBE', () => {
        describe('#ping()', () => {
            it('should return string date when ping', done => {
                SubeService
                    .ping((error, result) => {
                        expect(error).to.be.null;
                        expect(!!result).to.be.true;
                        done(error);
                    })
                    .catch(done);
            });
        });

        describe('#init()', () => {
            it('should return object with operator_code when init', done => {
                SubeService
                    .init((error, result) => {
                        expect(error).to.be.null;
                        expect(!!result).to.be.true;
                        done(error);
                    })
                    .catch(done);
            });
        });
    });
});
