var express = require('express'),
    http = require('http');
var app = express();
app.set('port', process.env.PORT || 9000);
var server = http.createServer(app);


var Speaker = require('speaker'),
    Volume = require("pcm-volume"),
    Lame = require('lame');

var v = new Volume(),
    inputStream;


var isPaused = false,
    isFinish = false;

var Throttle = require('throttle');
var BIT_RATE = 160000;


var lame = new Lame.Decoder();
var throttle = new Throttle(BIT_RATE / 8);
var mySpeaker = new Speaker();
var previousRes;
var previousReq;

app.all('/music', function (req, res) {
    isPaused = false;
    console.log("playing music");
    if (previousRes) {
        console.log("sent");
        mySpeaker._unpipe(v);
        previousRes.send({"success": true});
    }
    previousRes = res;
    inputStream = previousReq.pipe(throttle).pipe(lame).pipe(v);
    inputStream.on("data", function (chunck) {
        mySpeaker.write(chunck);
    }).on('pause', function (data) {
        console.log("paused Event");
        isPaused = true;
        mySpeaker.close();
    }).on('resume', function () {
        if (isPaused) {
            mySpeaker = new Speaker();
        }
    }).on('finish', function () {
        console.log("finish");
        previousRes.send({"success": true});
    }).on('end', function () {
        console.log("end")
    }).on("error", function (e) {
        console.log(e)
    });
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


var fs = require('fs')

var inputStream = playStream(fs.createReadStream(__dirname + "/littlebird.mp3"))

setInterval(function () {

    inputStream[0].unpipe();
    inputStream[1].end();
    inputStream = playStream(fs.createReadStream(__dirname + "/littlebird.mp3"))
}, 3000);

function playStream(req, res) {
    isPaused = false;
    console.log("playing music");
    //if (inputStream) {
    //    console.log("sent");
    //    previousReq.unpipe();
    //    inputStream.end();
    //
    //
    //    lame = new Lame.Decoder();
    //    throttle = new Throttle(BIT_RATE / 8);
    //    v = new Volume();
    //}


    req.on("unpipe",function(){
        console.log("unpipe")

    })
    var inputStream = req.pipe(throttle).pipe(lame).pipe(v);
    inputStream.on("data", function (chunck) {
        mySpeaker.write(chunck);
    }).on('pause', function (data) {
        console.log("paused Event");
        isPaused = true;
        mySpeaker.close();
    }).on('resume', function () {
        if (isPaused) {
            mySpeaker = new Speaker();
        }
    }).on('finish', function () {
        console.log("finish");
        previousRes.send({"success": true});
    }).on('end', function () {

        mySpeaker.end();
        //mySpeaker = new Speaker();
        //playStream(fs.createReadStream(__dirname + "/littlebird.mp3"));
        console.log("end")
    }).on("error", function (e) {
        console.log(e)
    }).on('unpipe',function(){
        debugger
    });

    return [req,mySpeaker];
}