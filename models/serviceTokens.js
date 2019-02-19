"use strict";

module.exports = {
    ById : function(id) {
        return `SELECT * FROM service_tokens WHERE id = ${id} AND TIMESTAMPDIFF(HOUR, NOW(), expired_at) > 0`;
    },
    ByIdService : function(idService) {
        return `SELECT * FROM service_tokens WHERE id_service = ${idService} AND TIMESTAMPDIFF(HOUR, NOW(), expired_at) > 0`;
    },
    Add : function(data) {
        return `INSERT INTO service_token VALUES (NULL, ${data.idService}, "${data.token}", "${data.description}", DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 23 HOUR)), NOW(), NULL)`;
    }
};
