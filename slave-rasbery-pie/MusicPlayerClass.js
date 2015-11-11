/**
 * Created by mlengla on 11/9/15.
 */
'use strict';

var Speaker = require('speaker'),
    Volume = require("pcm-volume"),
    Lame = require('lame'),
    Throttle = require('throttle');

var BIT_RATE = 160000;


class MusicPlayer {
    constructor(source) {
        this.STATE = "STOPPED";
        this.source = source;
        this.speaker = new Speaker();
        this.throttle = new Throttle(BIT_RATE / 8);
        this.volume = new Volume();
        this.stream = null;
    }

    playStream(next) {
        this.STATE = "PLAYING";
        this.stream = this.source.pipe(this.throttle).pipe(new Lame.Decoder)
            .on("format", (format)=> {
                this.stream.pipe(this.volume).pipe(this.speaker);
            });
        this.stream.on('end',function(){
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
        this.volume.setVolume(volume);
    }
}


exports["Class"] = MusicPlayer;
