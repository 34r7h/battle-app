var Fruit = function(game) {
	this.game = game;
	this.graphic = game.getGraphic();
	this.position = {x:0,y:0};

	this.reset();
};

Fruit.prototype.reset = function(){
	this.visible = false;
	this.time = 0;
	this.type = 0;
};

Fruit.prototype.update = function() {
	this.type = Math.floor((this.game.getPlayer().getLevel()-1) / 2);
	if(this.type > 4) this.type = 4;

	if((this.game.getTicks() - this.fruitTimer) >= 10 * this.game.getFPS()) {
		this.visible = false;
	}
};

Fruit.prototype.isVisible = function() {
	return this.visible;
};

Fruit.prototype.hide = function() {
	this.visible = false;
};

Fruit.prototype.show = function() {
	this.visible = true;
	this.fruitTimer = this.game.getTicks();
}

Fruit.prototype.clean = function() {
	var gridSize = this.graphic.getGridSize();
	var context = this.game.getContext();
	var pos = this.position;

	if(this.isVisible()) {
		context.clearRect(Math.floor(pos.x), Math.floor(pos.y), gridSize, gridSize);
	}
};

Fruit.prototype.draw = function() {
	var pos = this.getPosition();

	if(this.isVisible()) {
		this.graphic.draw("fruits", pos.x, pos.y, this.type * this.graphic.getGridSize(), 0);
	}
};

Fruit.prototype.oneDimColl = function(pPos, d) {
	var sPos = this.getPosition();
	var gs = this.graphic.getGridSize();
	var off = gs / 4; //must overlap a quarter grid

	return ((sPos[d]+off > pPos[d] && sPos[d]+off < pPos[d]+gs) || (sPos[d] + gs -off > pPos[d] && sPos[d] + gs - off < pPos[d]+gs));
};

Fruit.prototype.getPosition = function() {
	return this.position;
};

Fruit.prototype.setPosition = function(pos) {
	this.position = pos;
};


Fruit.prototype.collisionToObject = function(player) {
	var playerPos = player.getPosition();
	return this.oneDimColl(playerPos, "x") && this.oneDimColl(playerPos, "y") && this.isVisible();
};

Fruit.prototype.getType = function() {
	return "fruit";
}

Fruit.prototype.onCollision = function(obj){
}


Fruit.prototype.getScore = function() {
	return [100, 300, 500, 700, 1000][this.type];
};