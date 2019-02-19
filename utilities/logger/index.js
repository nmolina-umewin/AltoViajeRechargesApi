"use strict";

// External Modules
const colors = require('colors');

function logError(msg)
{
    console.log(`\t✘ Ooops... `.red, msg);
}

function Success(msg)
{
    console.log(`\t✔ `.green, msg);
}

function Warning(msg)
{
    console.log(`\t⚠ `.yellow, msg);
}

function Title(msg)
{
    console.log('\n', msg.yellow);
}

module.exports = {
    Error  : logError,
    Success,
    Warning,
    Title
};
