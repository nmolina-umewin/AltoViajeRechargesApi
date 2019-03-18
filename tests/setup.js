"use strict";

global.request  = require('supertest');
global.chai     = require('chai');

global.assert   = chai.assert;
global.expect   = chai.expect;
global.should   = chai.should();

global.Log      = require('../utilities').Log;
global.app      = require('../index');

/*

// REQUEST OK
curl -i -X POST -H "Content-Type:application/json" -d '{"idCompany": 1,"idUser": 4,"payload": {"cardNumber": "6061267195495203","amount": 50}}' 'http://localhost:8001/services/1/recharge'

// REQUEST INVALID CARD
curl -i -X POST -H "Content-Type:application/json" -d '{"idCompany": 1,"idUser": 4,"payload": {"cardNumber": "7584003387152044","amount": 50}}' 'http://localhost:8001/services/1/recharge'

// REQUEST CARD BLOCKED
curl -i -X POST -H "Content-Type:application/json" -d '{"idCompany": 1,"idUser": 4,"payload": {"cardNumber": "6061267187152044","amount": 50}}' 'http://localhost:8001/services/1/recharge'

// REQUEST INVALID AMOUNT
curl -i -X POST -H "Content-Type:application/json" -d '{"idCompany": 1,"idUser": 4,"payload": {"cardNumber": "6061267340141116","amount": 350}}' 'http://localhost:8001/services/1/recharge'

*/
