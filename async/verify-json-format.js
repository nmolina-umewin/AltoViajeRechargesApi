"use strict";

const Utilities = require('../utilities');

function verifyJSONFormat(json, enqueuedResult, callback) 
{
    var valid = true;
    try {
        JSON.parse(json);
    }
    catch (e) {
        valid = false;
    }

    if (valid) {
        return Utilities.Functions.Response(json, callback);
    }
    return Utilities.Functions.ResponseWithError(Utilities.Errors.Format.JSON, callback);
}

module.exports = verifyJSONFormat;