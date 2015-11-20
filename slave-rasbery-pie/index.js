'use strict';
var express = require('express'),
    http = require('http');
var app = express();
app.set('port', process.env.PORT || 9000);
var server = http.createServer(app);


server.on('connection', function (socket) {
    console.log("A new connection was made by a client.");
    socket.setTimeout(5000 * 1000);
    // 30 second timeout. Change this as you see fit.
});


var MusicPlayer = require("./MusicPlayerClass");


let stream;
app.all('/music', function (req, res) {
    console.log('playing music');
    if (stream && stream.STATE == "PLAYING")stream.stop();
    stream = new MusicPlayer.Class(req);
    stream.playStream()
        .then(()=> {
            res.set({'MusicOver': 'true'});
            res.send()
        })
});


app.get('/volume/:volume', function (req, res) {
    console.log("changing volume");
    stream.setVolume(req.params.volume);
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

