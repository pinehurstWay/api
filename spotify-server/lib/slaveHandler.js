/**
 * Created by mlengla on 11/8/15.
 */

var request = require("request");

var slaves = {
    "localhost": {
        "ip": "locahost"
    },
    "walmartLabs": {
        "ip": "192.168.0.12",
        "playingMusic": false
    }

};


exports.playMusic = function (slaveName, musicStream, next) {
    var pipeDestination;
    var ip = slaves[slaveName].ip;
    if (slaves[slaveName].playingMusic) request.get("http://" + ip + ":9000/stopMusic", function (err, res) {
        sendMusic()
    });
    else  sendMusic();

    function sendMusic() {
        if (ip == "localhost") pipeDestination = res;
        else pipeDestination = request.post("http://" + ip + ":9000/music");
        musicStream
            .pipe(pipeDestination)
            .on('error', function (e) {
                console.log('Error while piping stream to client:', e);
                next();
            })
            .on('unpipe', function () {
                console.log('Unpipe detected, disconnecting for /' + uri);
                next();
            })
            .on('finish', function () {
                console.log('Spotify disconnecting for /' + uri);
                next();
            });
    }
};