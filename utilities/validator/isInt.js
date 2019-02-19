"use strict";

const _ = require('lodash');

const REGEXP_INT                = /^(?:[-+]?(?:0|[1-9][0-9]*))$/;
const REGEXP_INT_LEADING_ZEROES = /^[-+]?[0-9]+$/;

function isInt(str, options)
{
    if (_.isNil(str)) return false;

    if (_.isNumber(str)) str = str.toString();

    options = options || {};

    // Get the regex to use for testing, based on whether
    // leading zeroes are allowed or not.
    let regex = options.hasOwnProperty('allow_leading_zeroes') && !options.allow_leading_zeroes ? REGEXP_INT : REGEXP_INT_LEADING_ZEROES;

    // Check min/max/lt/gt
    let minCheckPassed = !options.hasOwnProperty('min') || str >= options.min;
    let maxCheckPassed = !options.hasOwnProperty('max') || str <= options.max;
    let ltCheckPassed = !options.hasOwnProperty('lt') || str < options.lt;
    let gtCheckPassed = !options.hasOwnProperty('gt') || str > options.gt;

  return regex.test(str) && minCheckPassed && maxCheckPassed && ltCheckPassed && gtCheckPassed;

};

module.exports = isInt;
