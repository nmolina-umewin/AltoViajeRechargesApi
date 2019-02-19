"use strict";

var Models    = require('../models');
var Utilities = require('../utilities');

var verifyTransactionType = function(data, enqueuedResult, callback) 
{
    Utilities.Database.query(Models.Transactions.Add(data), function (error, results) 
    {
        if (error != null) {
            return Utilities.Functions.ResponseWithError(Utilities.Errors.CannotExecuteQuery, callback);
        }

        let data = {
            id_transaction : results.insertId
        }

        Utilities.Log.Success(`Transaction created: ${data.id_transaction}`);
        return Utilities.Functions.Response(data, callback);
    });
}

module.exports = verifyTransactionType;
