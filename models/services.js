"use strict";

module.exports = {
    List   : 'SELECT * FROM services',
    ById : function(id) {
        return `SELECT * FROM services WHERE id = ${id}`;
    }
};
