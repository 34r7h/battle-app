var Energizer = function(game) {
	this.game = game;
	this.graphic = game.getGraphic();
	this.position = {x:0 ,y:0};
	this.aniX = 0;
	this.aniTicks = game.getTicks();
	this.reset();
};

Energizer.prototype.reset = function(){
	this.eaten = false;
};

Energizer.prototype.update = function() {
};


Energizer.prototype.isEaten = function() {
	return this.eaten;
};

Energizer.prototype.draw = function() {
	if(((this.game.getTicks() - this.aniTicks) >= this.game.getFPS() / 12)) {
		this.aniTicks = this.game.getTicks();
		this.aniX += this.graphic.getGridSize();
	}

	if(this.aniX >= this.graphic.getGridSize() * 5) {
		this.aniX = 0;
	}

	if(!this.isEaten()) {
		this.graphic.draw("energizer", this.position.x, this.position.y, this.aniX, 0);
	}
};

Energizer.prototype.eat = function() {
	this.eaten = true;
}

Energizer.prototype.oneDimColl = function(pPos, d) {
	var sPos = this.position;
	var gs = this.graphic.getGridSize();
	var off = gs / 4; //must overlap a half grid

	return ((sPos[d]+off > pPos[d] && sPos[d]+off < pPos[d]+gs) || (sPos[d] + gs -off > pPos[d] && sPos[d] + gs - off < pPos[d]+gs));
};

Energizer.prototype.setPosition = function(pos){
	this.position = pos;
}

Energizer.prototype.getPosition = function(){
	return this.position;
}

Energizer.prototype.collisionToObject = function(object) {
	var objPos = object.getPosition();
	return this.oneDimColl(objPos, "x") && this.oneDimColl(objPos, "y") && !this.isEaten();
};

Energizer.prototype.getType = function() {
	return "energizer";
}

Energizer.prototype.onCollision = function(obj){
}
