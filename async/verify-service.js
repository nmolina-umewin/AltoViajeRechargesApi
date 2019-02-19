"use strict";

const Models    = require('../models');
const Utilities = require('../utilities');

function verifyService(idService, enqueuedResult, callback) 
{
    Utilities.Database.query(Models.Service.Exists(idService), function (error, results) 
    {
        if (error != null) {
            return Utilities.Functions.ResponseWithError(Utilities.Errors.CannotExecuteQuery, callback);
        }
        else if (results != null && !results.length) {
            return Utilities.Functions.ResponseWithError(Utilities.Errors.NotExists.Service, callback);
        }
        return Utilities.Functions.Response(results, callback);
    });
}

module.exports = verifyService;