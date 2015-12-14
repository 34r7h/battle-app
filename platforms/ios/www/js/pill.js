var Pill = function(game) {
	this.game = game;
	this.graphic = game.getGraphic();
    this.position = {x:0 ,y:0};
    this.reset();
};

Pill.prototype.reset = function(){
    this.eaten = false;
};

Pill.prototype.update = function() {
};


Pill.prototype.isEaten = function() {
    return this.eaten;
};

Pill.prototype.clean = function() {
    var gridSize = this.graphic.getGridSize();
    var context = this.game.getContext();
    var pos = this.position;

    context.clearRect(Math.floor(pos.x), Math.floor(pos.y), gridSize, gridSize);
};

Pill.prototype.draw = function() {
	if(!this.isEaten()) {
		this.graphic.draw("pill", this.position.x, this.position.y);
	}
};

Pill.prototype.eat = function() {
    this.eaten = true;
}

Pill.prototype.oneDimColl = function(pPos, d) {
    var sPos = this.position;
    var gs = this.graphic.getGridSize();
    var off = gs / 2; //must overlap a half grid

    return ((sPos[d]+off > pPos[d] && sPos[d]+off < pPos[d]+gs) || (sPos[d] + gs -off > pPos[d] && sPos[d] + gs - off < pPos[d]+gs));
};

Pill.prototype.setPosition = function(pos){
    this.position = pos;
}

Pill.prototype.getPosition = function(){
    return this.position;
}

Pill.prototype.collisionToObject = function(object) {
    var objPos = object.getPosition();
    return this.oneDimColl(objPos, "x") && this.oneDimColl(objPos, "y") && !this.isEaten();
};

Pill.prototype.getType = function() {
    return "pill";
}

Pill.prototype.onCollision = function(obj){
}
