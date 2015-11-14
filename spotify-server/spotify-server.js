'use strict';
const express = require('express'),
    session = require('express-session'),
    cookieParser = require('cookie-parser'),
    http = require('http'),
    ejs = require('ejs'),
    path = require('path'),
    spotifyClient = require('./lib/client'),
    SpotifyClientClean = require('./lib/cleanClient'),
    color = require('tinycolor');

//make it global
global.slaves = require("./resources/slaves");

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
    res.header("Access-Control-Allow-Origin", "http://" + req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Access-Control-Allow-Credentials, Origin, Content-Type, Authorization, Content-Length, X-Requested-With, Accept');
    res.header('Access-Control-Allow-Credentials', true);
    console.log(req.method);
    next();
});

app.use(cookieParser('asdklfjl43u8t943htinjgkrenseiro3u8urijoewfdkls'));
app.use(session());
let spotifyClientInstance;
app.use(function (req, res, next) {
    if (!spotifyClientInstance) {
        spotifyClientInstance = new SpotifyClientClean.class(req.cookies.username, req.cookies.password);
    }
    next();
});

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

//Retrieve PlayLists
app.get('/spotify-server/playlists', function (req, res) {
    spotifyClientInstance.getPlayLists()
        .then(playlists=> {
            res.send({playlists: playlists});
        })
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

    req.session.spotifyClientInstance.playMusic(trackURI, slaves)
        .then((music)=> music.pipe(res));
});

app.post('/volume', function (req, res) {
    var slaves = req.body.slave;
    spotifyClient.setVolume(slaves, function () {
        res.send({"success": true})
    });
});

app.post('/pause', function (req, res) {
    var slaves = req.body.slave;
    spotifyClient.pause(slaves, function () {
        res.send({"success": true})
    });
});

app.post('/resume', function (req, res) {
    var slaves = req.body.slave;
    spotifyClient.resume(slaves, function () {
        res.send({"success": true});
    })
});

app.get('/slaves', function (req, res) {
    res.send(slaves)
});

app.post('/addMusicToSlaves', function (req, res) {
    var track = req.body.track;
    var parsedSlaves = req.body.items;
    parsedSlaves.forEach(function (slave) {
        slaves[slave.name].queue.push(track);
    });
    res.send({success: true});
});

app.get('/playMusicTest/:trackId', function (req, res) {
    var trackURI = req.params.trackId;
    var slaves = JSON.parse(req.query.slaves);
    var username = "adrienvinches";
    var password = "zeswEG7F";
    spotifyClient.login(username, password);
    spotifyClient.newInstance(username, password).playTrackByURITest(trackURI, slaves, res);
});

var server = http.createServer(app);
server.listen(app.get('port'), function () {
    console.log('Listening on port', app.get('port'));
});


