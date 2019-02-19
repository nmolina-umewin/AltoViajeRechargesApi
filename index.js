"use strict";

// App Modules
// =========================
const Config = require('./utilities/config');
const Functions = require('./utilities/functions');
const Controllers = require('./controllers');

// Express Application
// =========================
const app = Functions.App;

// Routes
// =========================
app.get( '/config',       Controllers.Config);
app.get( '/health',       Controllers.Health);
app.get( '/services',     Controllers.Services.List);
app.get( '/services/:id', Controllers.Services.ById);
app.post('/recharge',     Controllers.Recharge);


// Start Server!
// =========================
app.listen(Config('Server.Port'), () => console.log(Config('Server.Message')));