"use strict";

const P         = require('bluebird');
const Models    = require('../../models');
const Utilities = require('../../utilities');
const Log       = Utilities.Log;

function handle(req, res) 
{
    return P.bind(this)
        .then(() => {
            return getServices();
        })
        .then(services => {
            res.send(services);
        })
        .catch(Utilities.Errors.CustomError, error => {
            res.status(error.extra && error.extra.code || 500).send(error.toJson());
        })
        .catch(error => {
            Log.Error(`Internal Server Error. ${error}`);
            res.status(500).send(Utilities.Errors.Internal.toJson());
        });
}

function getServices() 
{
    return new P((resolve, reject) => {
        Utilities.Database.query(Models.Services.List, (error, services) => {
            if (error || !services) {
                Log.Error(`Services not found. ${error}`);
                return reject(Utilities.Errors.Internal);
            }
            return resolve(services);
        });
    });
}

module.exports = handle;
