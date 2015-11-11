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
    inputStream.pause();
    res.send({"success": true});
});

app.get('/resume', function (req, res) {
    console.log("resuming");
    inputStream.resume();
    res.send({"success": true});
});

server.listen(app.get('port'), function () {
    console.log('Listening on port', app.get('port'));
});


process.on("uncaughtException", function (e) {
    console.log(e);
});


//var stream = new streamReader(fs.createReadStream(__dirname + "/littlebird.mp3"));
//stream.playStream();
//
//
//
//setTimeout(function(){
//    stream.stop();
//   setTimeout(function(){
//       var stream = new streamReader(fs.createReadStream(__dirname + "/littlebird.mp3"));
//       stream.playStream();
//       setInterval(function () {
//           stream.pause();
//           setTimeout(function () {
//               stream.resume();
//           }, 2500)
//       }, 5000);
//   },2000)
//},2000);
