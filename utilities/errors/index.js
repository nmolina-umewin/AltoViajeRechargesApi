"use strict";

const CustomError = require('./custom-error');

module.exports = {
    Internal : new CustomError("Internal Server Error.", {code: 500}),
    CannotExecuteQuery : new CustomError("The system cannot execute the query.", {code: 500}),
    NotExists : {
        Service : new CustomError("The given id_service doesn't exist.", {code: 404}),
    },
    Format : {
        Token : new CustomError("The given token is not well-formed", {code: 400}),
        JSON  : new CustomError("The given JSON is not well-formed", {code: 400})
    },
    CustomError
};
