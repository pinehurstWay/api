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
        this.STATE = "STOP";
        this.source = source;
        this.speaker = new Speaker();
        this.throttle = new Throttle(BIT_RATE / 8);
        this.volume = new Volume();
        this.stream = null;
    }

    playStream() {
        this.STATE = "PLAY";
        this.stream = this.source.pipe(this.throttle).pipe(new Lame.Decoder)
            .on("format", (format)=> {
                this.stream.pipe(this.volume).pipe(this.speaker);
            });
    }

    pause() {
        if (this.STATE == "PLAY") {
            this.stream.unpipe();
            this.speaker.end();
            this.speaker = new Speaker();
            this.STATE = "PAUSED";
        }
    }

    resume() {
        if (this.STATE == "PAUSED") {
            this.stream.pipe(this.volume).pipe(this.speaker);
            this.STATE = "PLAY";
        }
    }

    stop() {
        if (this.STATE !== "STOP") {
            this.speaker.end();
            this.stream.unpipe();
            this.stream = null;
            this.STATE = "STOP";
        }
    }

    setVolume(volume) {
        this.volume.setVolume(volume);
    }
}


exports["Class"] = MusicPlayer;
