"use strict";

const Utilities = require('../utilities');

function handle(req, res, next) 
{
    Utilities.Database.query('SHOW TABLES', function (error, results, fields) {
        var data = [];

        results.forEach(function(element) {
            data.push(element.Tables_in_av_recharges);
        });
        res.send({ tables: data });
    });
}

module.exports = handle;
