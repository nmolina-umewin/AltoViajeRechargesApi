"use strict";

const CustomError = require('./custom');
const Status      = require('../http/status');

class InternalServerError extends CustomError
{
    constructor(message, extra)
    {
        super(message);
        this.extra = extra;
    }
}

class BadRequest extends CustomError
{
    constructor(message, extra)
    {
        super(message, Status.BAD_REQUEST);
        this.extra = extra;
    }
}

class NotFound extends CustomError
{
    constructor(message, extra)
    {
        super(message, Status.NOT_FOUND);
        this.extra = extra;
    }
}

module.exports = {
    Internal           : new InternalServerError('Internal Server Error.'),
    CannotExecuteQuery : new InternalServerError('The system cannot execute the query.'),
    NotExists : {
        Company        : new NotFound('The given company doesn\'t exist.'),
        Companies      : new NotFound('The given companies doesn\'t exist.'),
        Recharge       : new NotFound('The given recharge doesn\'t exist.'),
        Recharges      : new NotFound('The given recharges doesn\'t exist.'),
        Service        : new NotFound('The given service doesn\'t exist.'),
        Services       : new NotFound('The given services doesn\'t exist.')
    },
    Format    : {
        Token          : new BadRequest('The given token is not well-formed'),
        JSON           : new BadRequest('The given JSON is not well-formed')
    },
    InternalServerError,
    BadRequest,
    NotFound,
    CustomError
};
