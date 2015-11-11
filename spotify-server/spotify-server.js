var express = require('express'),
    session = require('express-session');
cookieParser = require('cookie-parser');
http = require('http'),
    ejs = require('ejs'),
    path = require('path'),
    spotifyClient = require('./lib/client'),
    color = require('tinycolor');

//make it global
slaves = require("./resources/slaves");

//Don't stop this server if an exception goes uncaught
process.on('uncaughtException', function (err) {
    console.error((err.stack + '').red.bold);
    console.error('Node trying not to exit...'.red.bold);
});

var app = express();
app.set('port', 3000);
app.set('views', __dirname + '/views');
app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded());
app.use(express.static(path.join(__dirname, 'public')));
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:4200");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Access-Control-Allow-Credentials, Origin, Content-Type, Authorization, Content-Length, X-Requested-With, Accept');
    res.header('Access-Control-Allow-Credentials', true);

    console.log(req.method);
    if (req.method !== 'OPTIONS') {
        console.log('add header');

    }
    next();
});
// app.use(require('cors'));
app.set('view engine', 'ejs');
app.use(cookieParser('asdklfjl43u8t943htinjgkrenseiro3u8urijoewfdkls'));
app.use(session());

//Index
app.get('/', function (req, res) {
    res.render('index');
});

app.get('/spotify-server/logout', function (req, res) {
    req.session.destroy(function () {
        res.redirect('/');
    });
});

//Get login information
app.get('/spotify-server/login/:usernameAndpassword', function (req, res) {
    var up = req.params.usernameAndpassword;
    var uname = up.split(':')[0];
    var pw = up.split(':')[1];

    if (req.session.loggedin && uname == 'check') {
        res.send({success: 'success'});
        return;
    }

    if (!req.session.loggedin && uname == 'check') {
        res.send({error: {message: "invalid login"}});
        return;
    }

    spotifyClient.newInstance(uname, pw).login()
        .on('error', function (e) {
            res.send({error: {message: "invalid login"}});
        })
        .on('success', function (data) {
            req.session.username = uname;
            req.session.password = pw;
            req.session.loggedin = true;
            res.send({success: 'success'});
        });
});

//Retrieve PlayLists
app.get('/spotify-server/playlists', function (req, res) {
    spotifyClient.newInstance(req.session.username, req.session.password).getPlayLists()
        .on('playListsReady', function (playlists) {
            res.send({playlists: playlists});
        })
        .on('error', function (err) {
            res.send({error: err});
        });
});

//Retrieve tracks for a given PlayList
app.get('/spotify-server/playlist/:playlistid', function (req, res) {
    var playlistid = req.params.playlistid;
    var uri = 'spotify:user:' + req.session.username + ':playlist:' + playlistid;

    spotifyClient.newInstance(req.session.username, req.session.password).getTracksByPlayListURI(uri)
        .on('tracksReady', function (tracks) {
            res.send({tracks: tracks});
        })
        .on('error', function (err) {
            res.send({error: err});
        });
});

//Retrieve a single track
app.get('/spotify-server/track', function (req, res) {
    var uri = req.query.uri;

    if (req.query.searchType === 'playlist') {
        uri = 'spotify:user:' + req.session.username + ':playlist:' + uri;
        spotifyClient.newInstance(req.session.username, req.session.password).getTracksByPlayListURI(uri)
            .on('tracksReady', function (tracks) {
                res.send({tracks: tracks});
            })
            .on('error', function (err) {
                res.send({error: err});
            });
    } else {
        spotifyClient.newInstance(req.session.username, req.session.password).getTrackByTrackURI(uri)
            .on('trackReady', function (track) {
                res.send(track);
            })
            .on('error', function (err) {
                res.send({error: err});
            });
    }
});

//Retreive album art for a given track
app.get('/spotify-server/album-art/:trackURI', function (req, res) {
    var trackURI = req.params.trackURI;

    spotifyClient.newInstance(req.session.username, req.session.password).getAlbumArtByTrackURI(trackURI)
        .on('albumArtReady' + trackURI, function (data) {
            res.send(data);
        })
        .on('error', function (err) {
            res.send({error: err});
        });
});

//Search (tracks only right now)
app.get('/spotify-server/search/:query', function (req, res) {
    var query = req.params.query;
    spotifyClient.newInstance(req.session.username, req.session.password).search(query)
        .on('searchResultsReady', function (data) {
            res.send(data);
        })
        .on('searchResultsError', function (e) {
            res.send({error: 'searchResultsError'});
        })
});

//Play a track
app.get('/playMusic/:trackId', function (req, res) {
    var trackURI = req.params.trackId;
    var slaves = JSON.parse(req.query.slaves);
    //Just pass the response here because we need to stream to it
    var username = req.session.username;
    var password = req.session.password;
    //var username = "adrienvinches";
    //var password = "zeswEG7F";
    spotifyClient.newInstance(username, password).playTrackByURI(trackURI, slaves, res);
});

app.post('/volume', function (req, res) {
    var slaves = req.body;
    spotifyClient.setVolume(slaves, function () {
        res.send({"success": true})
    });
});

app.post('/pause', function (req, res) {
    var slaves = req.body;
    spotifyClient.pause(slaves, function () {
        res.send({"success": true})
    });
});

app.post('/resume', function (req, res) {
    var slaves = req.body;
    spotifyClient.resume(slaves, function () {
        res.send({"success": true});
    })
});

app.get('/slaves', function (req, res) {
    res.send(slaves)
});


app.get('/playMusicTest/:trackId', function (req, res) {
    var trackURI = req.params.trackId;
    var slaves = JSON.parse(req.query.slaves);
    var username = "adrienvinches";
    var password = "zeswEG7F";
    spotifyClient.login(username, password);
    spotifyClient.newInstance(username, password).playTrackByURI(trackURI, slaves, res);
});


var server = http.createServer(app);
server.listen(app.get('port'), function () {
    console.log('Listening on port', app.get('port'));
});


