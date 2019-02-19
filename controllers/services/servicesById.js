"use strict";

const _         = require('lodash');
const Models    = require('../../models');
const Utilities = require('../../utilities');

function servicesById(req, res, next) 
{
    if (!validate(req)) return;

    Utilities.Database.queryOne(Models.Services.ById(req.params.id), (error, service, fields) => {
        if (error || !service) {
            return res.status(404).send(Utilities.Errors.NotExists.Service.toJson());
        }
        return res.send(service);
    });
}

function validate(req, res)
{
    if (_.isEmpty(req.params) || _.isEmpty(req.params.id) || !Utilities.Validator.isInt(req.params.id)) {
        res.status(404).send(Utilities.Errors.NotExists.Service.toJson());
        return false;
    }
    return true;
}

module.exports = servicesById;
