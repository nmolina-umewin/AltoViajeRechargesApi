"use strict";

const Models = require('../../models');
const Utilities = require('../../utilities');

function services(req, res, next) 
{
	Utilities.Database.query(Models.Services.List, function (error, services, fields) {
		res.send(services);
	});
}

module.exports = services;
