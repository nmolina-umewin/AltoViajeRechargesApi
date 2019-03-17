"use strict";

const _         = require('lodash');
const P         = require('bluebird');
const Models    = require('../../models');
const Utilities = require('../../utilities');
const validator = require('validator');
const Log       = Utilities.Log;

function handle(req, res) 
{
    let context = {
        idCompany: req.params && req.params.id || null,
        limit: req.query && req.query.pagaSize || 0
    };

    return Utilities.Functions.CatchError(res,
        P.bind(this)
            .then(() => {
                return validate(context);
            })
            .then(() => {
                return getRecharges(context);
            })
            .then(recharges => {
                res.send(recharges);
            })
    );
}

function validate(context)
{
    return new P((resolve, reject) => {
        if (_.isEmpty(context.idCompany) || !validator.isInt(context.idCompany)) {
            Log.Error('Bad request invalid "idCompany".');
            return reject(new Utilities.Errors.BadRequest('Bad request invalid "idCompany".'));
        }
        return resolve(context);
    });
}

function getRecharges(context)
{
    return new P((resolve, reject) => {
        Utilities.Database.query(Models.Recharges.ByIdCompany(context.idCompany, context.limit), (error, recharges) => {
            if (error || !recharges) {
                Log.Error(`Company ${context.idCompany} not found. ${error}`);
                return reject(Utilities.Errors.NotExists.Company);
            }
            return resolve(recharges);
        });
    });
}

module.exports = handle;
