var EventEmitter = require('events').EventEmitter,
    spotify_util = require('../node_modules/spotify-web/lib/util.js'),
    schemas = require('../node_modules/spotify-web/lib/schemas.js'),
    https = require('https'),
    spotify = require('spotify-web'),
    xml2js = require('xml2js'),
    request = require("request");

//Override rootlist function to get all rootlists, not just published
spotify.prototype.rootlist = function (user, from, length, fn) {
    // argument surgery
    if ('function' == typeof user) {
        fn = user;
        from = length = user = null;
    } else if ('function' == typeof from) {
        fn = from;
        from = length = null;
    } else if ('function' == typeof length) {
        fn = length;
        length = null;
    }
    if (null == user) user = this.username;
    if (null == from) from = 0;
    if (null == length) length = 100;

    //debug('rootlist(%j, %j, %j)', user, from, length);

    var self = this;
    var hm = 'hm://playlist/user/' + user + '/rootlist?from=' + from + '&length=' + length;
    var SelectedListContent = schemas.build('playlist4', 'SelectedListContent');

    this.sendProtobufRequest({
        header: {
            method: 'GET',
            uri: hm
        },
        responseSchema: SelectedListContent
    }, fn);
};

function SpotifyClient(username, password) {
    this.username = username;
    this.password = password;
    EventEmitter.call(this);
}

SpotifyClient.super_ = EventEmitter;
SpotifyClient.prototype = Object.create(EventEmitter.prototype, {
    constructor: {
        value: SpotifyClient,
        enumerable: false
    }
});

var spotifyClientVar = null;
SpotifyClient.prototype.newInstance = function (username, password) {
    if (spotifyClientVar) {
        console.log('using old instance')
        return spotifyClientVar;
    }
    else {
        console.log('new instance')
        spotifyClientVar = new SpotifyClient(username, password);
        return spotifyClientVar;
    }

};

SpotifyClient.prototype.login = function (username, password) {
    var self = this;
    if (!self.username)self.username = username;
    if (!self.password)self.password = password;
    spotify.login(self.username, self.password, function (err, spotify) {
        if (err) {
            self.emit('error', 'error');
        }
        else {
            spotify.disconnect();
            self.emit('success', 'success');
        }
    });
    return self;
};

SpotifyClient.prototype.getPlayLists = function (username, password) {
    var self = this;
    var spotifyLib = spotify;

    if (!self.username)self.username = username;
    if (!self.password)self.password = password;
    console.log('Connecting to Spotify for playlists');
    spotify.login(self.username, self.password, function (err, spotify) {
        if (err)
            self.emit('error', err);

        //Rootlist
        spotify.rootlist(function (err, rootlist) {
            if (err)
                self.emit('error', err);

            var rootItems = rootlist.contents.items;
            var rootItemsLength = rootItems.length;
            var playlists = new Array();

            rootItems.forEach(function (playlistObject, index) {
                //Lookup playlist by uri
                //Issue #1: Only lookup items with a playlist uri
                if ('playlist' == spotifyLib.uriType(playlistObject.uri)) {
                    spotify.playlist(playlistObject.uri, function (err, playlist) {
                        if (err)
                            self.emit('error', err);

                        playlist.playlistURI = playlistObject.uri;
                        playlists.push(playlist);

                        if (playlists.length == rootItemsLength) {
                            console.log('Spotify disconnecting after playlists');
                            spotify.disconnect();
                            self.emit('playListsReady', playlists)
                        }
                    });
                }
                else {
                    rootItemsLength--;
                }
            });
        });
    });

    return self;
};

SpotifyClient.prototype.getTracksByPlayListURI = function (uri) {
    var self = this;
    var spotifyLib = spotify;

    //Login
    console.log('Connecting to Spotify for playlist: ' + uri);
    spotify.login(self.username, self.password, function (err, spotify) {
        if (err)
            self.emit('error', err);

        spotify.playlist(uri, function (err, playlist) {
            if (err)
                self.emit('error', err);

            var playlistItems = playlist.contents.items;
            var tracks = new Array();

            playlistItems.forEach(function (trackObject, index) {
                //Issue #2: Only lookup items with a track uri
                if ('track' == spotifyLib.uriType(trackObject.uri)) {
                    //Lookup tracks by uri
                    spotify.get(trackObject.uri, function (err, track) {
                        if (err)
                            self.emit('error', err);

                        track.trackURI = trackObject.uri;
                        tracks.push(track);

                        if (tracks.length == playlistItems.length) {
                            console.log('Spotify disconnecting after playlist: ' + uri);
                            spotify.disconnect();
                            self.emit('tracksReady', tracks);
                        }
                    });
                }
            });
        });
    });

    return self;
};

SpotifyClient.prototype.getTrackByTrackURI = function (uri) {
    var self = this;
    console.log('Connecting to Spotify for /track/' + uri);
    spotify.login(self.username, self.password, function (err, spotify) {
        if (err)
            self.emit('error', err);

        // first get a "Track" instance from the track URI
        spotify.get(uri, function (err, track) {
            if (err)
                self.emit('error', err);

            console.log('Spotify disconnecting after /track/: ' + uri);
            spotify.disconnect();
            self.emit('trackReady', track);
        });
    });

    return self;
}

SpotifyClient.prototype.getAlbumArtByTrackURI = function (uri) {
    var self = this;
    self.getOembedResponseByURI(uri).on('end' + uri, function (data) {
        self.emit('albumArtReady' + uri, data);
    });
    return self;
};

SpotifyClient.prototype.getOembedResponseById = function (uriType, id) {
    var self = this;
    var uri = spotify_util.id2uri(uriType, id);
    self.getOembedResponseByURI(uri).on('end' + uri, function (data) {
        self.emit('end' + id, data);
    });
    return self;
};

SpotifyClient.prototype.getOembedResponseByURI = function (uri) {
    var self = this;

    console.log('Connecting to Spotify OEMBED for: ' + uri);
    options = {
        hostname: 'embed.spotify.com',
        path: '/oembed/?url=' + uri,
        method: 'GET',
        headers: {
            'User-Agent': 'node.js'
        }
    };

    var jsonData = '';

    var req = https.request(options, function (res) {
        //RESPONSE
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            jsonData += chunk;
        });

        res.on('error', function (e) {
            console.log('error:', e);
        });

        //RESPONSE END
        res.on('end', function () {
            self.emit('end' + uri, {itemGID: uri, oembed: JSON.parse(jsonData)});
        });
    });

    req.on('error', function (e) {
        console.log('Spotify OEMBED error after retrieving art for:' + uri + ' error: ' + e);
    });

    req.end();

    return self;
};


//This is the data we are posting, it needs to be a string or a buffer
var slaveHandler = require("./slaveHandler");
//var Lame = require("lame");
SpotifyClient.prototype.playTrackByURI = function (uri, slaves, res) {
    var self = this;

    console.log('Connecting to Spotify for /' + uri);
    spotify.login(self.username, self.password, function (err, spotify) {
        if (err)
            self.emit('error Spotify', err);

        // first get a "Track" instance from the track URI
        spotify.get(uri, function (err, track) {
            if (err)
                self.emit('error Spotify', err);

            console.log('Streaming: %s - %s', track.artist[0].name, track.name);

            var musicStream = track.play();
            //

            //res.send({"success":true})
            slaves.forEach(function (slaveName) {
                slaveHandler.playMusic(slaveName, musicStream, track.name, this);
            });

            if (!res) return;

            musicStream.pipe(res);

            musicStream
                .on("end", function () {
                    console.log("finish streaming music")
                }).on("finish", function () {
                    console.log("finish2 streaming music")
                })
        });
    });
};

SpotifyClient.prototype.playTrackByURITest = function (uri, slaves, res) {
    var self = this;

    console.log('Connecting to Spotify for /' + uri);
    spotify.login(self.username, self.password, function (err, spotify) {
        if (err)
            self.emit('error Spotify', err);

        // first get a "Track" instance from the track URI
        spotify.get(uri, function (err, track) {
            if (err)
                self.emit('error Spotify', err);

            console.log('Streaming: %s - %s', track.artist[0].name, track.name);

            var musicStream = track.play();
            //

            //res.send({"success":true})

            if (slaves) {

                var i = slaves.length;
                slaves.forEach(function (slaveName) {
                    slaveHandler.playMusic(slaveName, musicStream, track.name, function () {
                        if (--i == 0) {
                            spotify.disconnect();
                        }
                    });
                });
            }
            //musicStream.pipe(res);
            res.send({"success": true})
        });
    });
};

SpotifyClient.prototype.setVolume = function (slaves, next) {
    if (!slaves) {
        return;
    }

    var i = slaves.length;
    slaves.forEach(function (slave) {
        slaveHandler.setVolume(slave.name, slave.volume, function () {
            if (--i == 0)next();
        });
    })
};

SpotifyClient.prototype.pause = function (slaves, next) {
    if (!slaves) {
        return;
    }
    var i = slaves.length;
    slaves.forEach(function (slave) {
        slaveHandler.pause(slave, function () {
            if (--i == 0)next();
        });
    })
};

SpotifyClient.prototype.resume = function (slaves, next) {
    if (!slaves) {
        return;
    }

    var i = slaves.length;
    slaves.forEach(function (slave) {
        slaveHandler.resume(slave, function () {
            if (--i == 0)next();
        });
    })
};


SpotifyClient.prototype.search = function (query) {
    var self = this;

    console.log('Connecting to Spotify for /search/' + query);
    spotify.login(self.username, self.password, function (err, spotify) {
        if (err)
            self.emit('error', err);

        spotify.search(query, function (err, xml) {
            if (err)
                self.emit('error', err);

            console.log('Disconnecting from Spotify after /search/' + query)
            spotify.disconnect();

            var parser = new xml2js.Parser();
            parser.on('end', function (data) {
                var parseResults = self.parseSearchResults(data);

                parseResults.on('parseSearchResultsComplete', function (data) {
                    self.emit('searchResultsReady', data);
                });
            });
            parser.parseString(xml);
        });
    });

    return self;
};

SpotifyClient.prototype.parseSearchResults = function (data) {
    var self = this;
    var tracks = data.result.tracks;

    var numToReturn = 30;
    var results = new Object();
    var returnTracks = new Array();

    if (typeof(tracks) == 'undefined' || typeof(tracks[0].track) == 'undefined' || typeof(tracks[0].track[0]) == 'undefined') {
        self.emit('searchResultsError', results);
        return self;
    }

    for (var i = 0; i < numToReturn; i++) {

        try {
            var trackId = tracks[0].track[i].id[0];
        }
        catch (err) {
            self.emit('searchResultsError', results);
            break;
        }

        self.getOembedResponseById('track', trackId).on('end' + trackId, function (trackData) {
            returnTracks.push({data: trackData});
            if (returnTracks.length == numToReturn)
                self.emit('searchTracksReady', returnTracks);
        });
    }

    self.on('searchTracksReady', function (data) {
        results.tracks = data;
        self.emit('parseSearchResultsComplete', results);
    });

    return self;
};

module.exports = new SpotifyClient();    