"use strict";

module.exports = {
	Add : function(data) {
	    return `INSERT INTO transactions (id_application, id_transaction_type, token, description) 
        			VALUES (${data.id_application}, ${data.id_transaction_type}, 
        					"${data.token}", '${data.description}')`;
	}
};
