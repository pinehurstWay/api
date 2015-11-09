var express = require('express'),
    http = require('http');
var app = express();
app.set('port', process.env.PORT || 9000);
var server = http.createServer(app);


var Speaker = require('speaker');


var lame = require('lame');
var mySpeaker = new Speaker();

app.all('/music', function (req, res) {
    req.pipe(new lame.Decoder).pipe(mySpeaker);
    //res.reply({"hello":"wol"})

});


server.listen(app.get('port'), function () {
    console.log('Listening on port', app.get('port'));
});

