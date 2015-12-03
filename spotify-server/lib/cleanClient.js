/**
 * Created by mlengla on 11/13/15.
 */
"use strict";

const SpotifyWeb = require('spotify-web'),
    https = require('https'),
    xml2js = require('xml2js'),
    spotify_util = require('../node_modules/spotify-web/lib/util.js'),
    slaveHandler = require('./slaveHandler');


class Spotify {
    constructor(username, password) {
        this.username = username;
        this.password = password;
        this._instance = null;
        this._playlists = null

    }

    _getInstance() {
        return new Promise((resolve, reject)=> {
            if (this._instance)return resolve(this._instance);
            else {
                SpotifyWeb.login(this.username, this.password, (err, spotify)=> {
                    if (err) reject(err);
                    else {
                        this._instance = spotify;
                        resolve(this._instance);
                    }
                })
            }
        });
    }

    _getTacksInfo(trackURIs) {
        console.log("getting tracks");
        return new Promise((resolve, reject)=> {
            this._getInstance()
                .then(instance=> {
                    return Promise.all(trackURIs.map(x => this._getTackCover(x)))
                })
                .then(covers=> {
                    return Promise.all(
                        trackURIs.map(trackURI=> {
                            return new Promise((resolve, reject)=> {
                                this._instance.get([trackURI], (err, song)=> {
                                    if (err) debugger
                                    return resolve({
                                        "id": trackURI,
                                        "name": song.name,
                                        "artist": song.artist.map(x=>x.name).join(", "),
                                        "album": song.album.name,
                                        "trackURI": trackURI,
                                        "duration": song.duration,
                                        "thumbnail": covers.filter(x=> x.trackURI == trackURI)[0].thumbnail_url
                                    })
                                })
                            })
                        }))
                })
                .then(songs=> {
                    resolve(songs.sort((a, b)=> a.name > b.name));
                })
                .catch(e=> {
                    console.log(e.stack)
                })
        });
    }

    _getTackCover(trackURI) {
        return new Promise((resolve, reject)=> {
            const options = {
                hostname: 'embed.spotify.com',
                path: '/oembed/?url=' + trackURI,
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
                    const result = {
                        thumbnail_url: JSON.parse(jsonData).thumbnail_url,
                        trackURI: trackURI
                    };
                    resolve(result)
                });
            });

            req.on('error', function (e) {
                console.log('Spotify OEMBED error after retrieving art for:' + uri + ' error: ' + e);
            });

            req.end();
        })

    }

    playMusic(trackURI, slaves) {
        return this._getInstance()
            .then((instance)=> {
                return new Promise((resolve, reject)=> {
                        instance.get(trackURI, (err, track)=> {
                            if (err) return reject(err);
                            const musicStream = track.play();
                            slaves.forEach(slaveName => {
                                slaveHandler.playMusic(slaveName, musicStream, track.name, this);
                            });
                            return resolve(musicStream);
                        });
                    }
                )
            })
            .catch(e=>console.log(e.stack))
    }

    getPlayLists() {
        console.log("getting playlists");
        if (this._playlists) return new Promise((resolve, reject)=>resolve(this._playlists));
        this._playlists = [];
        return this._getInstance()
            .then((instance)=> {
                return new Promise((resolve, reject)=> {
                    instance.rootlist((err, playlists)=> {
                        resolve(playlists);
                    })
                })
            })
            .then(playlists=> {
                return Promise.all(
                    playlists.contents.items.map(playlist=> {
                        return new Promise((resolve, reject)=> {
                            this._instance.playlist(playlist.uri, (err, playlistInfo)=> {
                                if (err)reject(err);
                                else {
                                    const playlistResult = {
                                        "id": playlist.uri,
                                        "name": playlistInfo.attributes.name,
                                        "playlistURI": playlist.uri,
                                        "length": playlistInfo.length,
                                        "tracks": playlistInfo.contents.items.map(x=>x.uri),
                                        'isOwner': true,
                                        "_tracks": null
                                    };
                                    resolve(playlistResult)
                                }

                            });
                        });
                    })
                )
            })
            .then(playlists=> {
                this._playlists = playlists;
                const result = playlists.map(x=> {
                    let y = Object.assign({}, x);
                    delete y._tracks;
                    return y;
                });
                return result.sort((a, b)=>a.name > b.name);
            })
            .catch(e=> {
                console.log(e.stack)
            });

    }

    getTracksForPlaylist(playlistURI) {
        const tracksURIs = this._playlists.filter(x=>x.playlistURI == playlistURI)[0].tracks;
        return this._getTacksInfo(tracksURIs)
    }

    search(query) {
        return this._getInstance()
            .then(instance=> {
                console.log("query", query);
                return new Promise((resolve, reject)=> {
                    instance.search(query, function (err, xml) {
                        console.log(err);
                        var parser = new xml2js.Parser();
                        parser.on('end', function (data) {
                            const result = {};
                            if (data.result.albums && data.result.albums[0].album) {
                                result.albums = data.result.albums[0].album.map(x => {
                                    if (!x['cover'] || !x['cover'][0]) {
                                        x.cover = '/img/no-artist.png';
                                    } else {
                                        x.cover = 'https://d3rt1990lpmkn.cloudfront.net/cover/' + x['cover'][0];
                                    }
                                    return {
                                        'artist': x['artist-name'][0],
                                        'name': x.name[0],
                                        'thumbnail': x.cover,
                                        'albumURI': spotify_util.id2uri('album', x.id[0]),
                                        'id': spotify_util.id2uri('album', x.id[0])
                                    }
                                });
                            }

                            if (data.result.artists && data.result.artists[0].artist) {
                                result.artists = data.result.artists[0].artist.map(x => {
                                    if (x.portrait && x.portrait[0] && x.portrait[0].id && x.portrait[0].id[0]) {
                                    x.portrait = 'https://i.scdn.co/image/' + x.portrait[0].id[0];
                                    } else {
                                    x.portrait = '/img/no-artist.png';
                                    }
                                    return {
                                        'name': x.name[0],
                                        'artistURI': spotify_util.id2uri('artist', x.id[0]),
                                        'id': spotify_util.id2uri('artist', x.id[0]),
                                        'thumbnail': x.portrait
                                    }
                                });
                            }
                            if (data.result.tracks && data.result.tracks[0].track) {
                                result.tracks = data.result.tracks[0].track.map(x => {
                                    if (!x['cover'] || x['cover'][0]) {
                                        x.cover = '/img/no-artist.png';
                                    } else {
                                        x.cover = 'https://d3rt1990lpmkn.cloudfront.net/cover/' + x['cover'][0];
                                    }
                                    return {
                                        "id": spotify_util.id2uri('track', x.id[0]),
                                        "name": x.title[0],
                                        "artist": x.artist[0],
                                        "album": x.album[0],
                                        "duration": x.length[0],
                                        "trackURI": spotify_util.id2uri('track', x.id[0]),
                                        "thumbnail": x.cover
                                    }
                                });

                            }
                            resolve(result);
                        });
                        parser.parseString(xml);
                    });
                })
                    .catch(e=>console.log(e.stack))
            })
    }

    setVolume(slaves) {
        return Promise.all(slaves.map(slave=>slaveHandler.setVolume(slave.name, slave.volume)));
    }

    pause(slaves) {
        return Promise.all(slaves.map(slave=>slaveHandler.pause(slave.name, slave.volume)));

    }

    resume(slaves) {
        return Promise.all(slaves.map(slave=>slaveHandler.resume(slave.name, slave.volume)));

    }

    getAlbumTracks(albumURI) {
        return this._getInstance()
            .then(instance=> {
                return new Promise((resolve, reject)=> {
                    instance.get([albumURI], (err, res)=> {
                        if (err)throw new Error(err);
                        const tracks = [];
                        res.disc.forEach((disc)=> {
                            if (!Array.isArray(disc.track)) return;
                            tracks.push.apply(tracks, disc.track);
                        });
                        resolve(tracks);
                    })
                })
            }).then(tracks=> {
                return Promise.all(tracks.map((x)=> {
                    return new Promise((resolve, reject)=> {
                        x.get(function (err) {
                            if (!x.album['cover'] || !x.album['cover'][0]) {
                                x.album.cover = '/img/no-artist.png';
                            } else {
                                x.album.cover = 'https://d3rt1990lpmkn.cloudfront.net/cover/' + x['cover'][0];
                            }
                            resolve({
                                "id": x.uri,
                                "name": x.name,
                                "type": "track",
                                "artist": x.artist[0].name,
                                "album": x.album.name,
                                "duration": x.duration,
                                "trackURI": x.uri,
                                "thumbnail": x.album.cover
                            })
                        });
                    })
                }));
            });
    }

}
exports['class'] = Spotify;
