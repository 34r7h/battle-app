var Sound = function(game) {
	this.files          = {}; 
	this.loaded         = {};
	this.paths          = {};
	this.loop	        = {};
	this.playing        = [];
	this.stopped		= [];
	this.playingIndex 	= {};
	this.game = game;
	this.volume = 1;
	this.disabled = game.getSetting("soundDisabled") == "true" ? true : false;
	this.multiple = ["snd_eat","snd_eatghost"];
	this.backgroundSounds = ["original","elektro","dance","rock","pop","kids"];
	this.interval 		= {};
};
	
Sound.prototype.load = function(name, path, realload, callback) {
	var _self = this;

	//save the path
	this.paths[name] = path;

	if(_self.loaded[name] == true) {
		if(callback) callback();
	} else {
		if(realload) {
			//load the audio file
			_self.files[name] = new Media(path,
				function(){},
				function(){},
				function(status){
					//check if done
					if(status == 4 && _self.stopped.indexOf(name) == -1) {
						if(_self.loop[name] == true) {
							_self.files[name].play();
						} else {
							var i = _self.playing.indexOf(name);
							if(i != -1) {
								_self.playing.slice(i,1);
							}
						}
					}
				});

			//set the loaded flag
			_self.loaded[name] = true;
			if(callback) callback();

		} else {			
			_self.loaded[name] = false;
			if(callback) callback();
		}
	}
};

Sound.prototype.toggleSound = function() {

	if(this.disabled) {
		this.enableSound();
	} else {
		this.disableSound();
	}
};

Sound.prototype.enableSound = function() {

	this.disabled = false;
	this.game.saveSettings("soundDisabled", "false");
	if(this.game.getSetting("music") == "original") {
		this.play(this.game.getSetting("music"), false, 0.2);
	} else {
		this.play(this.game.getSetting("music"), true, 0.2);
	}
};

Sound.prototype.disableSound = function(callback) {

	var _self = this;
	this.disabled = true;
	this.game.saveSettings("soundDisabled", "true");

	for (var i = 0; i < this.playing.length; i++) {
		_self.stop(this.playing[i]);
	}
	this.playing = [];
	if(callback) callback();
};

Sound.prototype.isDisabled = function() {
	return this.disabled;
};

Sound.prototype.isLoaded = function(name) {

	var _self = this;
	
	var i = _self.playingIndex[name];
	if(i === undefined || i == null) i = 1;
	_self.playingIndex[name] = i;

	return (_self.loaded[name] == true) || (_self.multiple.indexOf(name) != -1 && _self.loaded[name + "_" + i] == true);
};

Sound.prototype.play = function(name, loop, volume, callback) {

	var _self = this;

	function doPlay() {
		//remove from the stopped list
		var i = _self.stopped.indexOf(name);
		if(i != -1) {
			_self.stopped.slice(i,1);
		}

		//add to the playing list
		if(_self.playing.indexOf(name) == -1) _self.playing.push(name);

		//check if the sound can be played multiple times
		if(_self.multiple.indexOf(name) != -1) {
			var i = _self.playingIndex[name];
			if(i === undefined || i == null) i = 1;
			i++;
			if(i > 5) i = 1;
			_self.playingIndex[name] = i;
			name = name + "_" + i;
		}

		//set the volumen
		if(volume !== undefined) {
			_self.files[name].setVolume(volume);
		} else {
			_self.files[name].setVolume(_self.volume);
		}

		_self.files[name].play();
		_self.loop[name] = loop;

		if(loop) {
			var duration = _self.files[name].getDuration();
			if(duration != -1) {
				_self.interval[name] = setInterval(function(){
					_self.files[name].play();
				}, (duration+10) * 1000);
			}
		}
	}
	
	var blnPlay = true;
	if(Platform.isApp() && this.isBackgroundSound(name) == false) blnPlay = false;

	if(this.disabled == false && blnPlay == true) {
		if(_self.isLoaded(name)) {
			doPlay();
			if(callback) callback();
		} else {
			_self.load(name, _self.paths[name], true, function(){
				doPlay();
				if(callback) callback();
			});
		}
	} else {
		if(callback) callback();
	}
};

Sound.prototype.stop = function(name) {

	if(this.files[name] !== undefined) {
		this.stopped.push(name);
		if(this.interval[name] !== undefined){
			clearInterval(this.interval[name]);
		}
		this.files[name].stop();
	}
};

Sound.prototype.pause = function() {

	for (var i = 0; i < playing.length; i++) {
		this.files[playing[i]].pause();
	}
};

Sound.prototype.resume = function() {

	for (var i = 0; i < playing.length; i++) {
		this.files[playing[i]].play();
	}        
};

Sound.prototype.isBackgroundSound = function(snd) {

	return (this.backgroundSounds.indexOf(snd) != -1);
};