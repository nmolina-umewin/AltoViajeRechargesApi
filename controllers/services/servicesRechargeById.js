"use strict";

const _         = require('lodash');
const P         = require('bluebird');
const Models    = require('../../models');
const Services  = require('../../services');
const Utilities = require('../../utilities');
const Config    = require('../../utilities/config');
const Log       = Utilities.Log;

function handle(req, res) 
{
    let context = {
        idService: req.params && req.params.id || req.body && req.body.idService,
        payload: req.body && req.body.payload || {}
    };

    return P.bind(this)
        .then(() => {
            return validate(context);
        })
        .then(() => {
            return getService(context);
        })
        .then(() => {
            return getToken(context);
        })
        .then(() => {
            return getIdTransactionExternal(context);
        })
        .then(() => {
            return recharge(context);
        })
        .then(recharge => {
            res.send(recharge);
        })
        .catch(Utilities.Errors.CustomError, error => {
            res.status(error.extra && error.extra.code || 500).send(error.toJson());
        })
        .catch(error => {
            Log.Error(`Internal Server Error. ${error}`);
            res.status(500).send(Utilities.Errors.Internal.toJson());
        });
}

function validate(context)
{
    return new P((resolve, reject) => {
        if (!Utilities.Validator.isInt(context.idService)) {
            Log.Error('Bad request "idService" not valid.');
            return reject(new Utilities.Errors.CustomError('Bad request "idService" not valid.', {code: 400}));
        }
        else if (_.isEmpty(context.payload) || _.isEmpty(context.payload.cardNumber) || !context.payload.amount) {
            Log.Error('Bad request "payload" not valid.');
            return reject(new Utilities.Errors.CustomError('Bad request "payload" not valid.', {code: 400}));
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

function getToken(context)
{
    return new P((resolve, reject) => {
        Services[context.service.description].getToken(context.service.id).then(serviceToken => {
            context.serviceToken = serviceToken;
            return resolve(context);
        });
    });
}

function getIdTransactionExternal(context)
{
    return new P((resolve, reject) => {
        Utilities.Database.queryOne(Models.Recharges.Last(), (error, lastRecharge) => {
            if (error || !lastRecharge) {
                Log.Error(`Last Recharge not found. Use ID External Transaction from configuration. ${error}`);
                return resolve(context);
            }

            context.idTransactionExternal = lastRecharge.id_transaction_external;
            return resolve(context);
        });
    });
}

function recharge(context)
{
    return new P((resolve, reject) => {
        let params = _.extend({}, context.payload, {
            token: context.serviceToken.token
        });

        Services[context.service.description]
            .recharge(params)
            .then(resolve)
            .catch(reject);
    });
}

module.exports = handle;
