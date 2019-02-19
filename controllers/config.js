"use strict";

const Config = require('../utilities/config');

function config(req, res)
{
    res.send(Config.Raw);
}

module.exports = config;
