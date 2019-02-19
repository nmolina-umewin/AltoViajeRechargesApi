"use strict";

const Utilities = require('../utilities');
const AddRecharge = require('../async/add-recharge');

function recharge(request, response) 
{
    let idService = request.body.id_service;
    let payload   = request.body.payload;
    let token     = request.body.token;

    // Don't forget to bind the response to the callback
    let callback  = Utilities.Functions.Callback.bind(null, response);

    // Go!
    AddRecharge(idService, token, payload, callback);
}

module.exports = recharge;
