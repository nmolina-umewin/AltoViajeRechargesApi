"use strict";

const _         = require('lodash');
const P         = require('bluebird');
const Models    = require('../../models');
const Services  = require('../../services');
const Utilities = require('../../utilities');
const Log       = Utilities.Log;

function handle(req, res) 
{
    let context = {
        idService: req.params && req.params.id || null
    };

    return P.bind(this)
        .then(() => {
            return validate(context);
        })
        .then(() => {
            return getService(context);
        })
        .then(() => {
            return getServiceToken(context);
        })
        .then(() => {
            if (!context.serviceToken) {
                return requestServiceToken(context);
            }
            return context;
        })
        .then(() => {
            res.send(context.serviceToken);
        })
        .catch(Utilities.Errors.CustomError, error => {
            res.status(error.extra.code).send(error.toJson());
        })
        .catch(error => {
            Log.Error(`Internal Server Error. ${error}`);
            res.status(500).send(Utilities.Errors.Internal.toJson());
        });
}

function validate(context)
{
    return new P((resolve, reject) => {
        if (_.isEmpty(context.idService) || !Utilities.Validator.isInt(context.idService)) {
            Log.Error('Bad request "idService" not valid.');
            return reject(new Utilities.Errors.CustomError('Bad request "idService" not valid.'));
        }
        return resolve(context);
    });
}

function getService(context)
{
    return new P((resolve, reject) => {
        Utilities.Database.queryOne(Models.Services.ById(context.idService), (error, service) => {
            if (error || !service) {
                Log.Error(`Service ${context.idService} not found. ${error}`);
                return reject(Utilities.Errors.NotExists.Service);
            }

            context.service = service;
            return resolve(context);
        });
    });
}

function getServiceToken(context)
{
    return new P((resolve, reject) => {
        Utilities.Database.queryOne(Models.ServiceTokens.ByIdService(context.idService), (error, serviceToken) => {
            if (error) {
                Log.Error(`Can't read service token from service ${context.service.description}. ${error}`);
                return reject(Utilities.Errors.Internal);
            }

            if (serviceToken) {
                Log.Step(`Read service ${context.service.description} token from cache.`);
                context.serviceToken = serviceToken;
            }
            return resolve(context);
        });
    });
}

function requestServiceToken(context)
{
    return new P((resolve, reject) => {
        Log.Step(`Generating ${context.service.description} token every 24 hours.`);

        Services[context.service.description].init((error, token) => {
            if (error || !token || !token.operationCode) {
                Log.Error(`Can't generate service ${context.service.description} token. ${error}`);
                return reject(Utilities.Errors.Internal);
            }

            Log.Step(`Generated service ${context.service.description} token ${token.operationCode}`);
            return addServiceToken({
                idService: service.id,
                token: token.operationCode,
                description: JSON.stringify(token)
            })
            .then(resolve)
            .catch(reject);
        });
    });
}

function addServiceToken(data)
{
    return new P((resolve, reject) => {
        Utilities.Database.query(Models.ServiceToken.Add(data), (error, result) => {
            if (error) {
                Log.Error(`Can't add service ${context.service.description} token. ${error}`);
                return reject(Utilities.Errors.CannotExecuteQuery);
            }

            Utilities.Database.queryOne(Models.ServiceTokens.ById(result.insertId), (error, serviceToken) => {
                if (error) {
                    Log.Error(`Can't read from cache service ${context.service.description} token. ${error}`);
                    return reject(Utilities.Errors.Internal);
                }

                Log.Success(`Adding ${context.service.description} token ${context.serviceToken.token} to cache.`);
                context.serviceToken = serviceToken;
                return resolve(context);
            });
        });
    });
}

module.exports = handle;
