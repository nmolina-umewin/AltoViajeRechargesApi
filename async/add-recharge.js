"use strict";

const Async     = require('async');
const Utilities = require('../utilities');

// Required Functions
const Init              = require('./init');
const verifyServices    = require('./verify-service');
const verifyTokenFormat = require('./verify-token-format');
const Add               = require('./add');

function run(idServices, token, payload, callback) 
{
    Utilities.Log.Title(`Processing new recharge.`);

    let data = {
        id_service : idServices,
        payload    : payload,
        token      : token
    };

    Async.waterfall([

        Init,
        Async.apply(verifyService, idService),
        Async.apply(verifyTokenFormat, token),
        Async.apply(Add, data),

    ], (error, result) => response(callback, error, result));
}


function response(callback, error, result)
{
    return callback(error, result);
}

module.exports = run;
