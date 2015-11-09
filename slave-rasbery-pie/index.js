'use strict';
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


var isPaused = false;

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


//
//var fs = require('fs');
//var lame = require('lame');
//var Speaker = require('speaker');
//
//var stream = null;
//
//var lastMusic = null;
//
//var STATE = {
//    playing: 0,
//    paused: 1,
//    stopped: 2
//};
//
//var currentState = STATE.stopped;
//
//var mySpeaker = new Speaker()
//var throttle = new Throttle(BIT_RATE / 8);
//var lame = new lame.Decoder;
//exports.play = function (file) {
//    //return if file is null
//    if (!file) return;
//
//    //if playing, stop current stream
//    if (currentState == STATE.playing) {
//        this.stop();
//    }
//
//    //if paused, resume last music
//    if (currentState == STATE.paused) {
//        this.resume();
//        return;
//    }
//
//    //set state to playing
//    currentState = STATE.playing;
//    //save last music path
//    lastMusic = file;
//
//    // manually write data to the decoder stream, which is a writeable stream
//    //stream = fs.createReadStream(file).pipe(new lame.Decoder).pipe(new Speaker());
//    lame = new Lame.Decoder();
//    stream = fs.createReadStream(file).pipe(throttle).pipe(new Lame.Decoder)
//        .on("format", function () {
//            stream.pipe(mySpeaker);
//        });
//    //pipe to speaker
//
//
//    //Print when finished
//    stream.on('end', function () {
//        console.log("END");
//    });
//    stream.on('finish', function () {
//        console.log("FINISH");
//    });
//}
//
//exports.pause = function () {
//    if (currentState == STATE.playing) {
//        stream.unpipe();
//        mySpeaker.end();
//        mySpeaker = new Speaker();
//        currentState = STATE.paused;
//    }
//};
//
//exports.resume = function () {
//    if (currentState == STATE.paused) {
//        stream.pipe(mySpeaker);
//        currentState = STATE.playing;
//    }
//};
//
//exports.stop = function () {
//    if (currentState != STATE.stopped) {
//        stream.unpipe();
//        stream.end();
//        mySpeaker.end();
//        mySpeaker = new Speaker();
//        stream = null;
//        currentState = STATE.stopped;
//    }
//};
//
//exports.play(__dirname + "/littlebird.mp3");

//setInterval(function(){
//    console.log("pause")
//    exports.pause();
//    setTimeout(function(){
//        exports.resume();
//    },2000)
//
//},5000)

//setInterval(function () {
//    exports.play(__dirname + "/littlebird.mp3");
//}, 3000);
//


var fs = require('fs');
var lame = require('lame');
var Speaker = require('speaker');


class streamReader {
    constructor(source) {
        this.STATE = "STOP";
        this.source = source;
        this.speaker = new Speaker();
        this.throttle = new Throttle(BIT_RATE / 8);
        this.lame = new lame.Decoder;
        this.stream=null;
    }


    playStream() {
        this.STATE = "PLAY";
        this.stream = this.source.pipe(this.throttle).pipe(new Lame.Decoder)
            .on("format", (format)=> {
                this.stream.pipe(this.speaker);
            });
    }

    pause() {
        if (this.STATE == "PLAY") {
            this.stream.unpipe();
            this.speaker.end();
            this.speaker = new Speaker();
            this.STATE = "PAUSED";
        }
    }

    resume() {
        if (this.STATE == "PAUSED") {
            this.stream.pipe(this.speaker);
            this.STATE = "PLAY";
        }
    }
    stop(){
        if (this.STATE !== "STOP") {
            this.stream.unpipe();
            this.speaker.end();
            this.stream = null;
            this.STATE = "STOP";
        }
    }
}


var stream = new streamReader(fs.createReadStream(__dirname + "/littlebird.mp3"));
stream.playStream();

