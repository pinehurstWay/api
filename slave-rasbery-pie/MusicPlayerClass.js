/**
 * Created by mlengla on 11/9/15.
 */
'use strict';

const Speaker = require('speaker'),
    Volume = require("pcm-volume"),
    Lame = require('lame'),
    Throttle = require('throttle'),
    spawn = require('child_process').spawn;

var BIT_RATE = 160000;


class MusicPlayer {
    constructor(source) {
        this.STATE = "STOPPED";
        this.source = source;
        this.speaker = new Speaker();
        this.throttle = new Throttle(BIT_RATE / 8);
        this.volume = new Volume();
        this.volumeValue = 0.5;
        this.stream = null;
        this.volume.setVolume(this.volumeValue);
    }

    playStream(next) {
        this.STATE = "PLAYING";
        this.stream = this.source.pipe(this.throttle).pipe(new Lame.Decoder)
            .on("format", (format)=> {
                this.stream.pipe(this.volume).pipe(this.speaker);
                this.volume.setVolume(this.volumeValue);
            });
        this.stream.on('end', function () {
            next()
        })
    }

    pause() {
        if (this.STATE == "PLAYING") {
            this.stream.unpipe();
            this.speaker.end();
            this.speaker = new Speaker();
            this.STATE = "PAUSED";
        }
    }

    resume() {
        if (this.STATE == "PAUSED") {
            this.stream.pipe(this.volume).pipe(this.speaker);
            this.volume.setVolume(this.volumeValue);
            this.STATE = "PLAYING";
        }
    }

    stop() {
        if (this.STATE !== "STOPPED") {
            this.speaker.end();
            this.stream.unpipe();
            this.stream = null;
            this.STATE = "STOPPED";
        }
    }

    setVolume(volume) {
        this.volumeValue = volume;
        const osVolume = (volume * 100) / 3 + 66;
        spawn('sudo', ['amixer', 'set', 'PCM', '--', `${osVolume}%`]);

        this.volume.setVolume(this.volumeValue);
    }
}


exports["Class"] = MusicPlayer;
