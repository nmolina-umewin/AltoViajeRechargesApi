"use strict";

global.request  = require('supertest');
global.chai     = require('chai');

global.assert   = chai.assert;
global.expect   = chai.expect;
global.should   = chai.should();

global.Log      = require('../utilities').Log;
global.app      = require('../index');
