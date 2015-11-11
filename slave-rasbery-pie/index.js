'use strict';
var express = require('express'),
    http = require('http');
var app = express();
app.set('port', process.env.PORT || 9000);
var server = http.createServer(app);


var MusicPlayer = require("./MusicPlayerClass");


var stream;
app.all('/music', function (req, res) {
    if (stream && stream.STATE == "PLAY")stream.stop();
    stream = new MusicPlayer.Class(req);
    stream.playStream()
});


app.get('/volume/:volume', function (req, res) {
    console.log("changing volume");
    v.setVolume(req.params.volume);
    res.send({"success": true});
});


app.get('/pause', function (req, res) {
    console.log("pause");
    stream.pause();
    res.send({"success": true});
});

app.get('/resume', function (req, res) {
    console.log("resuming");
    stream.resume();
    res.send({"success": true});
});

server.listen(app.get('port'), function () {
    console.log('Listening on port', app.get('port'));
});


process.on("uncaughtException", function (e) {
    console.log(e);
});

