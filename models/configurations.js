"use strict";

module.exports = {
    ByKey  : function(key) {
        return `SELECT * FROM configurations WHERE configuration LIKE '${key}' ORDER BY id`;
    },
    Update : function(key, value) {
        return `UPDATE configurations set description = ${value} WHERE configuration = '${key}'`;
    }
};
