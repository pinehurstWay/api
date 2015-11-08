var express = require('express'),
    http = require('http');
var app = express();
app.set('port', process.env.PORT || 9000);
var server = http.createServer(app);


var Speaker = require('speaker');


var lame = require('lame');

// create the Encoder instance
var encoder = new lame.Encoder({
    // input
    channels: 2,        // 2 channels (left and right)
    bitDepth: 16,       // 16-bit samples
    sampleRate: 44100,  // 44,100 Hz sample rate

    // output
    bitRate: 128,
    outSampleRate: 22050,
    mode: lame.STEREO // STEREO (default), JOINTSTEREO, DUALCHANNEL or MONO
});

//var volume = require("pcm-volume");
//var v = new volume();
//setInterval(function() {
//    v.setVolume(0.1);
//    setTimeout(function(){
//        v.setVolume(1)
//    },2500)
//}, 5000);


app.all('/music', function (req, res) {
    req.pipe(new lame.Decoder).pipe(new Speaker());
    //res.reply({"hello":"wol"})

});


server.listen(app.get('port'), function () {
    console.log('Listening on port', app.get('port'));
});

