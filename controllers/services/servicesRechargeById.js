"use strict";

const _         = require('lodash');
const P         = require('bluebird');
const Models    = require('../../models');
const Services  = require('../../services');
const Utilities = require('../../utilities');
const Config    = require('../../utilities/config');
const validator = require('validator');
const Log       = Utilities.Log;

function handle(req, res) 
{
    let context = {
        idService: req.params && req.params.id || req.body && req.body.idService,
        idCompany: req.body && req.body.idCompany || null,
        idUser: req.body && req.body.idUser || null,
        payload: req.body && req.body.payload || {}
    };

    return Utilities.Functions.CatchError(res,
        P.bind(this)
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
    );
}

function validate(context)
{
    return new P((resolve, reject) => {
        if (!validator.isInt(context.idService)) {
            Log.Error('Bad request invalid "idService".');
            return reject(new Utilities.Errors.BadRequest('Bad request invalid "idService".'));
        }
        else if (!context.idCompany) {
            Log.Error('Bad request invalid "idCompany".');
            return reject(new Utilities.Errors.BadRequest('Bad request invalid "idCompany".'));
        }
        else if (!context.idUser) {
            Log.Error('Bad request invalid "idUser".');
            return reject(new Utilities.Errors.BadRequest('Bad request invalid "idUser".'));
        }
        else if (_.isEmpty(context.payload) || _.isEmpty(context.payload.cardNumber) || !context.payload.amount) {
            Log.Error('Bad request invalid "payload".');
            return reject(new Utilities.Errors.BadRequest('Bad request invalid "payload".'));
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
        })
        .catch(reject);
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
            token: context.serviceToken.token,
            idCompany: context.idCompany,
            idUser: context.idUser
        });

        Services[context.service.description]
            .recharge(params)
            .then(resolve)
            .catch(reject);
    });
}

module.exports = handle;
