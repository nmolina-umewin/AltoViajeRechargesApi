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
    let body = req.body || {};
    let context = {
        idService: req.params && req.params.id || null,
        idCompany: body.idCompany || body.id_company || null,
        idUser: body.idUser || body.id_user || null,
        payload: body.payload || {},
        token: body.token || null
    };

    context.payload.cardNumber = context.payload.cardNumber || context.payload.cardnumber || context.payload.card_number;

    if (process.env.MOCK_RESPONSES && mockResponses(res, context)) {
        return;
    }

    return Utilities.Functions.CatchError(res,
        P.bind(this)
            .then(() => {
                return validate(context);
            })
            .then(() => {
                return populate(context);
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

function populate(context) {
    return P.resolve()
        .then(() => {
            return getService(context);
        })
        .then(() => {
            return getToken(context);
        })
        .then(() => {
            return getIdTransactionExternal(context);
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
        Utilities.Database.queryOne(Models.Configurations.ByKey('recharges.sube.last.id'), (error, configuration) => {
            if (error || !configuration) {
                Log.Error(`Last Recharge not found. Use ID External Transaction from configuration. ${error}`);
                return resolve(context);
            }

            context.idTransactionExternal = Number(configuration.description) + 1;

            Utilities.Database.query(Models.Configurations.Update('recharges.sube.last.id', context.idTransactionExternal), () => {
                return resolve(context);
            });
        });
    });
}

function recharge(context)
{
    return new P((resolve, reject) => {
        let params = _.extend({}, context.payload, {
            token: context.token || context.serviceToken.token,
            idTransactionExternal: context.idTransactionExternal,
            idCompany: context.idCompany,
            idUser: context.idUser
        });

        Services[context.service.description]
            .recharge(params)
            .then(resolve)
            .catch(reject);
    });
}

function mockResponses(res, context)
{
    if (context.payload.cardNumber === '6061267195495203') {
        res.send({"id":9,"id_company":1,"id_user":4,"id_recharge_type":1,"id_recharge_status":3,"id_transaction":370145,"id_transaction_external":37011,"amount":context.payload.amount,"token":"F0652528D132CBF1","description":{"service":"sube","request":{"cardNumber":"6061267195495203","amount":context.payload.amount,"token":"F0652528D132CBF1","idTransactionExternal":37011,"idCompany":1,"idUser":4,"idChannel":"77"},"response":{"detailedReturnCode":0,"percent":"4","returnCode":0,"SUBEtransactionID":"370145"},"status":"ok","message":"Recharge effected correctly"},"created_at":"2019-03-17T23:33:10.000Z"});
        return true;
    }
    else if (context.payload.cardNumber === '6061267187152044') {
        res.send({"id":11,"id_company":1,"id_user":4,"id_recharge_type":1,"id_recharge_status":6,"id_transaction":0,"id_transaction_external":37013,"amount":context.payload.amount,"token":"F0652528D132CBF1","description":{"service":"sube","request":{"cardNumber":"6061267187152044","amount":context.payload.amount,"token":"F0652528D132CBF1","idTransactionExternal":37013,"idCompany":1,"idUser":4,"idChannel":"77"},"response":{"detailedReturnCode":4,"returnCode":1,"SUBEtransactionID":"0"},"status":"card_in_black_list","message":"Your card was blocked please contact SUBE"},"created_at":"2019-03-17T23:34:40.000Z"});
        return true;
    }
    else if (context.payload.cardNumber === '7584003387152044') {
        res.send({"id":10,"id_company":1,"id_user":4,"id_recharge_type":1,"id_recharge_status":6,"id_transaction":0,"id_transaction_external":37012,"amount":context.payload.amount,"token":"F0652528D132CBF1","description":{"service":"sube","request":{"cardNumber":"7584003387152044","amount":context.payload.amount,"token":"F0652528D132CBF1","idTransactionExternal":37012,"idCompany":1,"idUser":4,"idChannel":"77"},"response":{"detailedReturnCode":1,"returnCode":1,"SUBEtransactionID":"0"},"status":"invalid_card","message":"Invalid Card"},"created_at":"2019-03-17T23:34:08.000Z"});
        return true;
    }
    else if (context.payload.cardNumber === '6061267340141116') {
        res.send({"id":8,"id_company":1,"id_user":4,"id_recharge_type":1,"id_recharge_status":3,"id_transaction":370144,"id_transaction_external":37010,"amount":context.payload.amount,"token":"F0652528D132CBF1","description":{"service":"sube","request":{"cardNumber":"6061267340141116","amount":context.payload.amount,"token":"F0652528D132CBF1","idTransactionExternal":37010,"idCompany":1,"idUser":4,"idChannel":"77"},"response":{"detailedReturnCode":0,"percent":"3","returnCode":0,"SUBEtransactionID":"370144"},"status":"ok","message":"Recharge effected correctly"},"created_at":"2019-03-17T23:32:28.000Z"});
        return true;
    }
    return false;
}

module.exports = handle;
