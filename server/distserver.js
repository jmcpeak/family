var express = require('express');
var fs = require('fs');
var http = require('http');
var https = require('https');
var path = require('path');

var sslcert = path.resolve(__dirname, 'sslcert');
var privateKey = fs.readFileSync(path.resolve(sslcert, 'key.pem'), 'utf-8');
var certificate = fs.readFileSync(path.resolve(sslcert, 'cert.pem'), 'utf-8');
var credentials = {key: privateKey, cert: certificate};
var app = express();
var port = 9000;

app.use(express.static(path.resolve(__dirname, '../dist')));

http.createServer(app).listen(port, function () {
    console.log('Server listening on port:', port);
});
