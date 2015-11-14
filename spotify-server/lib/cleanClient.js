/**
 * Created by mlengla on 11/13/15.
 */
"use strict";

const SpotifyWeb = require('spotify-web'),
    https = require('https');


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
                    return Promise.all(trackURIs.map(this._getTackCover))
                })
                .then(covers=> {
                    return Promise.all(
                        trackURIs.map(trackURI=> {
                            return new Promise((resolve, reject)=> {
                                this._instance.get([trackURI], (err, song)=> {
                                    if (err) debugger
                                    return resolve({
                                        "name": song.name,
                                        "artist": song.artist.map(x=>x.name).join(", "),
                                        "album": song.album.name,
                                        "trackURI": trackURI,
                                        "duration": song.duration,
                                        "thumbnail_url": covers.filter(x=> x.trackURI == trackURI)[0].thumbnail_url
                                    })
                                })
                            })
                        }))
                })
                .then(songs=> {
                    resolve(songs.sort((a, b)=> a.name > b.name));
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
        return new Promise((resolve, reject)=> {
            this._getInstance()
                .then((instance)=> {
                    instance.get(trackURI, (err, track)=> {
                        if (err) return reject(err);
                        const musicStream = track.play();
                        slaves.forEach(function (slaveName) {
                            slaveHandler.playMusic(slaveName, musicStream, track.name, this);
                        });
                        resolve(track.play());
                    });
                })
        })
    }

    getPlayLists() {
        console.log("getting playlists");
        return new Promise((resolve, reject)=> {
            if (this._playlists) return resolve(this._playlists);
            this._playlists = [];
            this._getInstance().then((instance)=> {
                instance.rootlist((err, playlists)=> {
                    Promise.all(
                        playlists.contents.items.map(playlist=> {
                            return new Promise((resolve, reject)=> {
                                instance.playlist(playlist.uri, (err, playlistInfo)=> {
                                    if (err)reject(err);
                                    else {
                                        playlistInfo.URI = playlist.uri;
                                        resolve(playlistInfo)
                                    }

                                });
                            });

                        })
                    ).then(playlists=> {
                        Promise.all(playlists.map(playlist=> {
                                const playlistResult = {
                                    "name": playlist.attributes.name,
                                    "playlistURI": playlist.URI,
                                    "length": playlist.length
                                };
                                return playlistResult
                            }))
                            .then(playlists=> {
                                this._playlists = playlists;
                                resolve(playlists);
                            })
                            .catch(e=> {
                                console.log(e.stack)
                            });
                    })
                })
            })
        })
    }
}

exports['class'] = Spotify;