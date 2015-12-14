/* wrapper for none phonegap usage */
if(Media === undefined) {

	window.AudioContext = window.AudioContext || window.webkitAudioContext;
	// use the webkit WebAudio API to avoid problems with safari
	if(window.AudioContext !== undefined ) {

		var gAudioContext = null;

		var Media = window.Media = function(src, success, error, statusChange) {
			this.MEDIA_NONE = 0;
			this.MEDIA_STARTING = 1;
			this.MEDIA_RUNNING = 2;
			this.MEDIA_PAUSED = 3;
			this.MEDIA_STOPPED = 4;

			var _self = this;
			if(gAudioContext == null) {
				gAudioContext = new AudioContext();
			}
			this.src = src;
			this.context = gAudioContext;
			this.audio = null;
			this.gain = this.context.createGain();
			this.gain.connect(this.context.destination);
			this.onended = function(){
				if(statusChange) statusChange(4);
			};
			this.buffer = null;

			//load the data
			this.load(src, function(){
				if(onload) onload();
			}, error);
		}

		Media.prototype.load = function(src, success, error) {
			var _self = this;
			// Load buffer asynchronously
			var request = new XMLHttpRequest();
			request.open("GET", src, true);
    		request.setRequestHeader('Access-Control-Allow-Origin', '*');
			request.responseType = "arraybuffer";

			request.onload = function() {
				// Asynchronously decode the audio file data in request.response
				_self.context.decodeAudioData(request.response, function(buffer) {
					if (!buffer) {
						error({code:'error decoding file data: ' + src});
						return;
					} else {
						//save the buffer
						_self.buffer = buffer;

						//success!
						if(success) success();
					}
				},function(err) {
					if(error) error({code:'decodeAudioData error'}, err);
				});
			}

			request.onerror = function() {
				if(error) error({code:"XHR error!"});
			}

			request.send();
		}

		Media.prototype.play = function(){
			var _self = this;
			if(_self.audio == null) {
				_self.audio = _self.context.createBufferSource();
				_self.audio.buffer = _self.buffer;
				_self.audio.connect(_self.gain);
				_self.audio.onended = function(){
					_self.audio = null;
					if(_self.onended) _self.onended();
				}
				_self.audio.start(0);
			}
		}

		Media.prototype.pause = function() {
			var _self = this;

			if(_self.audio != null) {
				_self.audio.stop(0);
				_self.audio = null;
			}
		}

		Media.prototype.stop = function() {
			var _self = this;

			if(_self.audio != null) {
				_self.audio.stop(0);
				_self.audio = null;
			}
		}

		Media.prototype.setVolume = function(vol) {
			this.gain.gain.value = vol;
		}

		Media.prototype.getVolume = function() {
			return this.gain.gain.value;
		}

		Media.prototype.getDuration = function() {
			return this.buffer.duration;
		}

		Media.prototype.seekTo = function(miliseconds) {
			//this.audio.currentTime = miliseconds;
		}
	} else {
		var Media = window.Media = function(src, success, error, onload) {
			var _self = this;
			this.audio = new Audio(src);
			this.audio.addEventListener("pause", function() { 
				if(onload) onload(4);
			});
			this.audio.addEventListener("ended", function() { 
				if(onload) onload(4);
			});
			this.audio.addEventListener("canplaythrough", function() {
				if(onload) onload(0);
			});
		}

		Media.prototype.play = function() {
			this.audio.play();
		}

		Media.prototype.pause = function() {
			this.audio.currentTime = 0;
			this.audio.pause();
		}

		Media.prototype.stop = function() {
			this.audio.currentTime = 0;
			this.audio.pause();
		}

		Media.prototype.setVolume = function(vol) {
			this.audio.volume = vol;
		}

		Media.prototype.getVolume = function() {
			return this.audio.volume;
		}

		Media.prototype.getDuration = function() {
			return this.audio.duration;
		}

		Media.prototype.seekTo = function(miliseconds) {
			this.audio.currentTime = miliseconds;
		}
	}
}