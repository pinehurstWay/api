'use strict';
const express = require('express'),
    session = require('express-session'),
    cookieParser = require('cookie-parser'),
    http = require('http'),
    ejs = require('ejs'),
    path = require('path'),
    SpotifyClientClean = require('./lib/cleanClient');

//make it global
global.slaves = require("./resources/slaves");

//Don't stop this server if an exception goes uncaught
process.on('uncaughtException', function (err) {
    console.error((err.stack + ''));
    console.error('Node trying not to exit...');
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


//Get login information

//Retrieve PlayLists
app.get('/spotify-server/playlists', function (req, res) {
    let playlists;
    spotifyClientInstance.getPlayLists()
        .then(playlistsTemp=> {
            playlists = playlistsTemp;
            if (playlistsTemp.length == 0) return null;
            else if (!playlists[0].tracks) return spotifyClientInstance.getTracksForPlaylist(playlists["0"].playlistURI);
            else return null;
        })
        .then(playlist0Tracks=> {
            if (playlist0Tracks) {
                playlists[0].tracks = playlist0Tracks
            }
            res.send({playlists: playlists})
        })
        .catch(e=> {
            console.log(e.stack)
        })
});

//Retrieve tracks for a given PlayList
app.get('/spotify-server/track', function (req, res) {
    const playlistURI = req.query.uri;
    spotifyClientInstance.getTracksForPlaylist(playlistURI)
        .then(tracks=> {
            res.send({tracks: tracks})
        })
        .catch(e=> {
            console.log(e.stack)
        })
});

app.get('/spotify-server/album', function (req, res) {
    const albumURI = req.query.uri;
    spotifyClientInstance.getAlbumTracks(albumURI)
        .then(tracks=> {
            res.send({tracks: tracks})
        })
        .catch(e=> {
            console.log(e.stack)
        })
});

app.get('/spotify-server/album', (req, res)=> {
    const albumURI = req.query.uri;
    spotifyClientInstance.getAlbumTracks(albumURI)
        .then((tracks)=> {
            res.send({tracks: tracks});
        })
        .catch(e=>console.log(e.stack));
});


//Search (tracks only right now)
app.get('/spotify-server/search/:query', function (req, res) {
    const query = req.params.query;
    spotifyClientInstance.search(query)
        .then(result=> {
            res.send(result)
        })
        .catch(e=>console.log(e.stack));
});

//Play a track
app.get('/playMusic/:trackId', function (req, res) {
    const trackURI = req.params.trackId,
        slaves = JSON.parse(req.query.slaves);
    spotifyClientInstance.playMusic(trackURI, slaves)
        .then((music)=> {
            music.pipe(res);
        });
});

app.post('/volume', function (req, res) {
    const slaves = req.body.slave;
    spotifyClientInstance.setVolume(slaves)
        .then(()=> res.send({"success": true}));
});

app.post('/pause', function (req, res) {
    const slaves = req.body.slave;
    spotifyClientInstance.pause(slaves)
        .then(()=> res.send({"success": true}));
});

app.post('/resume', function (req, res) {
    const slaves = req.body.slave;
    spotifyClientInstance.resume(slaves)
        .then(()=> res.send({"success": true}));
});

app.get('/slaves', function (req, res) {
    res.send(slaves)
});

app.post('/slavesPlaylist', (req, res) => {
    const queue = req.body.track.queue;
    const firstMusic = queue.shift();
    const parsedSlaves = req.body.slave;
    parsedSlaves.forEach(slave => {
        slaves[slave].queue = queue
    });
    spotifyClientInstance.playMusic(trackURI, firstMusic)
        .then(()=> res.send({success: true}));
});

app.post('/updateSlavesPlaylist', (req, res) => {
    const queue = req.body.track.queue;
    const parsedSlaves = req.body.slave;
    parsedSlaves.forEach(slave => {
        slaves[slave].queue = queue
    });
    res.send({success: true});
});

var server = http.createServer(app);
server.listen(app.get('port'), function () {
    console.log('Listening on port', app.get('port'));
});


