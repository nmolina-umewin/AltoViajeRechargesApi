"use strict";

const P         = require('bluebird');
const Models    = require('../../models');
const Utilities = require('../../utilities');
const Log       = Utilities.Log;

function handle(req, res) 
{
    return Utilities.Functions.CatchError(res,
        P.bind(this)
            .then(() => {
                return getServices();
            })
            .then(services => {
                res.send(services);
            })
    );
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
