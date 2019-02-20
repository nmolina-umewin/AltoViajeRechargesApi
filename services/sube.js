"use strict";

const _               = require('lodash');
const P               = require('bluebird');
const Base            = require('altoviajesube');
const Models          = require('../models');
const Utilities       = require('../utilities');
const Log             = Utilities.Log;

class SubeService extends Base
{
    getToken(idService) {
        let context = {
            idService
        };

        return P.bind(this)
            .then(() => {
                return this.getServiceToken(context);
            })
            .then(serviceToken => {
                if (!serviceToken) {
                    return this.requestServiceToken(context);
                }
                return serviceToken;
            });
    }

    getServiceToken(context) {
        return new P((resolve, reject) => {
            Utilities.Database.queryOne(Models.ServiceTokens.ByIdService(context.idService), (error, serviceToken) => {
                if (error) {
                    Log.Error(`Can't read service token from service sube. ${error}`);
                    return reject(Utilities.Errors.Internal);
                }

                if (serviceToken) {
                    Log.Step('Read service sube token from cache.');
                }
                return resolve(serviceToken);
            });
        });
    }

    requestServiceToken(context) {
        return new P((resolve, reject) => {
            Log.Step('Generating sube token every 24 hours.');

            this.init((error, token) => {
                if (error || !token || !token.operationCode) {
                    Log.Error(`Can't generate service sube token. ${error}`);
                    return reject(Utilities.Errors.Internal);
                }

                Log.Step(`Generated service sube token ${token.operationCode}`);
                return this.addServiceToken({
                    idService: context.idService,
                    token: token.operationCode,
                    description: JSON.stringify(token)
                })
                .then(resolve)
                .catch(reject);
            });
        });
    }

    addServiceToken(data) {
        return new P((resolve, reject) => {
            Utilities.Database.query(Models.ServiceToken.Add(data), (error, result) => {
                if (error) {
                    Log.Error(`Can't add service sube token. ${error}`);
                    return reject(Utilities.Errors.CannotExecuteQuery);
                }

                Utilities.Database.queryOne(Models.ServiceTokens.ById(result.insertId), (error, serviceToken) => {
                    if (error) {
                        Log.Error(`Can't read from cache service sube token. ${error}`);
                        return reject(Utilities.Errors.Internal);
                    }

                    Log.Success(`Adding sube token ${data.token} to cache.`);
                    return resolve(serviceToken);
                });
            });
        });
    }
}

module.exports = SubeService;
