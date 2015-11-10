/**
 * Created by mlengla on 11/8/15.
 */

var request = require("request");

var slaves = {
    //"local": {
    //    "ip": "localhost"
    //},
    "mo": {
        "ip": "192.168.31.155"
    }
};


exports.playMusic = function (slaveName, musicStream) {

    var ip = slaves[slaveName].ip;

    var pipeDestination = request.post("http://" + ip + ":9000/music");
    musicStream
        .pipe(pipeDestination)
        .on('error', function (e) {
            console.log('Error while piping stream to client:', e);
        })
        .on('unpipe', function () {
            console.log('Unpipe detected, disconnecting for /' + slaveName);
        })
        .on('finish', function () {
            console.log('Spotify disconnecting for /' + uri);
        });

};

exports.setVolume = function (slaveName, volume, next) {
    var ip = slaves[slaveName].ip;
    request.get("http://" + ip + ":9000/volume/" + volume, function () {
        next();
    });
};

exports.pause = function (slaveName, volume, next) {
    var ip = slaves[slaveName].ip;
    request.get("http://" + ip + ":9000/pause", function () {
        next();
    });
};

exports.resume = function (slaveName, volume, next) {
    var ip = slaves[slaveName].ip;
    request.get("http://" + ip + ":9000/resume", function () {
        next();
    });
};