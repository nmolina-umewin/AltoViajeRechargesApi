"use strict";

const uuidv4    = require('uuid/v4');
const Utilities = require('../utilities');

function verifyTokenFormat(token, enqueuedResult, callback) 
{
    let randomToken = uuidv4();

    if (randomToken.length == token.length) {
        return Utilities.Functions.Response(token, callback);
    }
    return Utilities.Functions.ResponseWithError(Utilities.Errors.Format.Token, callback);
}

module.exports = verifyTokenFormat;