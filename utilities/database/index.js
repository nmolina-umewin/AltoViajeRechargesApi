"use strict";

const mysql      = require('mysql');
const config     = require('../config/database');
const connection = mysql.createConnection(config);

class Database
{
    query(query, fn) {
        connection.query(query, fn);
    }

    queryOne(query, fn) {
        this.query(query, (error, results, fields) => {
            let result;

            if (!error && results && results.length) {
                result = results[0];
            }
            fn(error, result, fields);
        });
    }
}

module.exports = new Database;
