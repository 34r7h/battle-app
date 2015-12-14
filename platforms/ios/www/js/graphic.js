var Graphic = function(game, resolution) {
	this.game = game;
	this.files          = {};
	this.progressEvents = {};
	this.blockSize      = resolution == "low" ? 16 : 32;
};

Graphic.prototype.setResolution = function(res) {
	this.blockSize = res == "low" ? 16 : 32;
}

Graphic.prototype.load = function(name, path, cb) { 
	var f = this.files[name] = new Image();
	f.addEventListener("load", function(){ cb(); }, true);
	f.setAttribute("src", path);
};

Graphic.prototype.draw = function(name, x, y, sx, sy, w, h) {
	sx = sx || 0;
	sy = sy || 0;
	w  = w  || this.getGridSize();
	h  = h  || this.getGridSize();

	if(this.files[name]) {
		this.game.getContext().drawImage(this.files[name], sx, sy, w, h, x, y, w, h);
	} else{
		throw "Graphic not found " + name;
	}
};

Graphic.prototype.getGridSize = function() {
	return this.blockSize;
};