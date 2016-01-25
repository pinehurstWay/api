/**
 * Created by mlengla on 11/8/15.
 */

var request = require("request").forever();
//slave is declared in main server as global

exports.playMusic = function (slaveName, musicStream, musicName, spotifyClient) {
    var slave = slaves[slaveName];
    var ip = slave.ip;

    var pipeDestination = request.post("http://" + ip + ":9000/music");
    slave.status = "PLAYING";
    slave.trackName = musicName;

    musicStream
        .pipe(pipeDestination)
        .on('error', function (e) {
            slave.status = "STOPPED";
            delete slave.trackName;
            console.log('Error while piping stream to client:', e);
        })
        .on('unpipe', function () {
            slave.status = "STOPPED";
            delete slave.trackName;
            console.log('Unpipe detected, disconnecting for /' + slaveName);
        })
        .on('finish', function () {
            slave.status = "STOPPED";
            delete slave.trackName;
            console.log('Spotify disconnecting for /' + uri);
        })
        .on("end", function () {
            slave.status = "STOPPED";
            delete slave.trackName;
            delete slave.queue[0];

            if (slave.queue[0]) {
                spotifyClient.playTrackByURI(slave.queue[0].trackURI, [slave]);
            }
            console.log("finish streaming music");
        });
    slaves[slaveName].status = "PLAYING";
};

exports.setVolume = function (slaveName, volume) {
    return new Promise((resolve, reject)=> {
        const ip = slaves[slaveName].ip;
        request.get("http://" + ip + ":9000/volume/" + volume, function () {
            resolve();
        });
    })
};

exports.pause = function (slaveName) {
    return new Promise((resolve, reject)=> {
        var ip = slaves[slaveName].ip;
        slaves[slaveName].status = "PAUSED";
        request.get("http://" + ip + ":9000/pause", function () {
            resolve();
        });
    })
};

exports.resume = function (slaveName) {
    return new Promise((resolve, reject)=> {
        var ip = slaves[slaveName].ip;
        slaves[slaveName].status = "PLAYING";
        request.get("http://" + ip + ":9000/resume", function () {
            resolve();
        });

    })

};