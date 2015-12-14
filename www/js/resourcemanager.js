var ResourceManager = function(audio, graphic){
	this.aryAudio = [];
	this.aryGraphic = [];
	this.onProgressHandler = null;
	this.audio = audio;
	this.graphic = graphic;
};
	
ResourceManager.prototype.add = function(type, name, path, preload) {
	if(type == "audio") {
		this.aryAudio.push([name, path, preload]);
	} else if(type == "graphic") {
		this.aryGraphic.push([name, path]);
	} else {
		throw new Error("Unkown type " + type);
	}
};

ResourceManager.prototype.getCount = function() {
	return (this.aryAudio.length + this.aryGraphic.length);
};

ResourceManager.prototype.load = function(callback) {
	var called = false;
	var _self = this;

	_self.loadAudio(0, 0, function(){
		_self.loadGraphic(_self.aryAudio.length, 0,  function(){
			//onProgressHandler(getCount(), getCount() -1 );
		
			if(callback && called == false) {
				called = true;
				callback();
			}
		});
	});
};

ResourceManager.prototype.loadAudio = function(start, i, callback) {
	var _self = this;
	if(i < _self.aryAudio.length) {
			_self.audio.load(_self.aryAudio[i][0], _self.aryAudio[i][1], _self.aryAudio[i][2], function(){
				if(_self.onProgressHandler) {
					_self.onProgressHandler(_self.getCount(), start + i);
				}
				setTimeout(function(){
					_self.loadAudio(0, i+1, callback);
				}, 0);
			});
	} else {
		if(_self.onProgressHandler) _self.onProgressHandler(_self.getCount(), start + i);
		callback();
	}
};

ResourceManager.prototype.loadGraphic = function(start, i, callback) {
	var _self = this;
	if(i < _self.aryGraphic.length) {
		_self.graphic.load(_self.aryGraphic[i][0], _self.aryGraphic[i][1], function(){
			if(_self.onProgressHandler) {
				_self.onProgressHandler(_self.getCount(), start + i);
			}
			_self.loadGraphic(start, i+1, callback);
		});
	} else {
		if(_self.onProgressHandler) _self.onProgressHandler(_self.getCount(), start + i);
		callback();
	}
};

ResourceManager.prototype.onProgress = function(handler) {
	this.onProgressHandler = handler;
};
