"use strict";

const _         = require('lodash');
const P         = require('bluebird');
const Models    = require('../../models');
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
        .then(service => {
            res.send(service);
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
            return resolve(service);
        });
    });
}

module.exports = handle;
