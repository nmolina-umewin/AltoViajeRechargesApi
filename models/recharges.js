"use strict";

const _ = require('lodash');

const TYPES = {
    RECHARGE : 1,
    REVERSE  : 2
};

const STATUSES = {
    PENDING   : 1,
    PAYED     : 2,
    DONE      : 3,
    REFUNDED  : 4,
    CANCELED  : 5,
    FAIL      : 6,
    RECHARGE  : 7
};

module.exports = {
    Types    : TYPES,
    Statuses : STATUSES,
    Last     : 'SELECT * FROM recharges ORDER BY created_at DESC LIMIT 1',
    ById     : function(id) {
        return `SELECT * FROM recharges WHERE id = ${id}`;
    },
    Add      : function(data) {
        return `INSERT INTO recharges VALUES (NULL, ${data.idRechargeType}, ${data.idRechargeStatus}, ${data.idTransaction}, ${data.idTransactionExternal}, ${data.amount}, '${data.token}', '${JSON.stringify(data.description)}', NOW())`;
    },
    Update   : function(id, data) {
        let query = ['UPDATE recharges SET'];
        let attributes = [];

        _.each(data, (value, key) => {
            key = _.snakeCase(key);

            if (key === 'token') {
                attributes.push(`${key} = '${value}'`);
            }
            else if (key === 'description') {
                attributes.push(`${key} = '${JSON.stringify(value)}'`);
            }
            else {
                attributes.push(`${key} = '${value}'`);
            }
        });
        query.push(attributes.join(', '));
        query.push(`WHERE id = ${id}`);
        return query.join(' ');
    }
};
