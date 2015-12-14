var Ghost  = function (game, id) {
	this.position 		= {x: 0, y:0};
	this.direction 		= Constants.NONE;
	this.map 			= game.getMap();
	this.graphic 		= game.getGraphic();
	this.player 		= game.getPlayer();
	this.game 			= game;
	this.keyMap 		= {};
	this.aniOffX 		= 0; //x offset for sprite animation
	this.aniTicks 		= game.getTicks();
	this.lastDirection 	= null;
	this.speed 			= game.getSpeed();
	this.nextDirection 	= null;
	this.type 			= "ghost";
	this.id 			= id == 5 ? Helper.randomInt(1,4) : id;
	this.sprite			= "ghost_" + this.id;
	this.scaredSince	= 0;
	this.state			= "normal";
	this.movementDelay	= 0; //time in ticks to stop movement
	this.desicionDelay 	= 0; //a ghost decides every 2nd, 3rd possibility to change his direction
	this.diff			= 0;
	this.diffTicks		= 1;
	this.blinkCnt 		= 0;
	this.aggressive		= false;
};

Ghost.prototype.setSpeed = function(speed) {
	this.speed = speed;
}

Ghost.prototype.resetPosition = function() {
	this.direction = Constants.UP;
	this.position = this.map.getTilePosition(92+this.id);
};

Ghost.prototype.oneDimColl = function(pPos, d) {
	var sPos = this.position;
	var gs = this.graphic.getGridSize();
	var off = gs / 4; //must overlap a quarter grid

	return ((sPos[d]+off > pPos[d] && sPos[d]+off < pPos[d]+gs) || (sPos[d] + gs -off > pPos[d] && sPos[d] + gs - off < pPos[d]+gs));
};


Ghost.prototype.pointInRect = function(p, r) {
	return (p.x > r.x && p.x < r.x + r.width) && (p.y > r.y && p.y < r.y + r.height);
}

Ghost.prototype.intersectRect = function(r1, r2) {
	return this.pointInRect({x: r1.x, y: r1.y}, r2) ||
		   this.pointInRect({x: r1.x, y: r1.y+r1.height},r2) ||
		   this.pointInRect({x: r1.x+r1.width, y: r1.y+r1.height},r2) ||
		   this.pointInRect({x: r1.x+r1.width, y: r1.y},r2);
}

Ghost.prototype.getCollRect1 = function() {
	var gs = this.graphic.getGridSize();

	var rect1 = {};
	rect1.x = this.position.x + gs / 4;
	rect1.y = this.position.y + gs / 8;
	rect1.width = gs / 2;
	rect1.height = gs - gs / 4;
	return rect1;
}

Ghost.prototype.getCollRect2 = function() {
	var gs = this.graphic.getGridSize();
	
	var rect2 = {};
	rect2.x = this.position.x + gs / 8;
	rect2.y = this.position.y + gs / 4;
	rect2.width = gs - gs / 4;
	rect2.height = gs / 2;
	return rect2;
}

Ghost.prototype.collisionToObject = function(player) {
	//get the grid size
	var gs = this.graphic.getGridSize();

	//build the player rect
	var playerPos = this.player.getPosition();
	var playerRect = playerPos;
	playerRect.width = playerRect.height = gs;

	//build the first rect for the ghost collision
	var rect1 = this.getCollRect1();
	var rect2 = this.getCollRect2();

	return this.intersectRect(rect1, playerRect) || this.intersectRect(rect2, playerRect);
};

Ghost.prototype.getType = function() {
	return "ghost";
}

Ghost.prototype.setNextDirection = function(dir){
	this.nextDirection = dir;
};

//get the next position according to the current direction
Ghost.prototype.nextPosition = function(){	
	var pos = this.position;

	var speed = this.speed;

	if(this.isScared()) {
		speed = Math.floor(speed / 2);
	}

	if(this.direction == Constants.LEFT) pos.x -= speed;
	else if(this.direction == Constants.RIGHT) pos.x += speed;
	else if(this.direction == Constants.UP) pos.y -= speed;
	else if(this.direction == Constants.DOWN) pos.y += speed;
	
	//enable the warping
	if(pos.x == 0 && this.direction == Constants.LEFT) {
		pos.x = this.map.getSize().width * this.graphic.getGridSize();
	}
	else if(pos.x == (this.map.getSize().width - 1) * this.graphic.getGridSize() && this.direction == Constants.RIGHT) {
		pos.x = 0;
	}
	return pos;
};

//check if ghost is on a square on the grid
Ghost.prototype.onSquare = function() {
	return (this.position.x % this.graphic.getGridSize() === 0 && this.position.y % this.graphic.getGridSize() === 0);
};

Ghost.prototype.breaksGrid = function(speed) {
	return this.graphic.getGridSize() % speed != 0;
};

//get the next grid square according to the direction dir
Ghost.prototype.nextSquare = function(dir) {
	var pos = {};
	pos.x = this.position.x - this.position.x % this.graphic.getGridSize();
	pos.y = this.position.y - this.position.y % this.graphic.getGridSize();

	if(dir == Constants.LEFT) pos.x -= this.graphic.getGridSize();
	else if(dir == Constants.RIGHT) pos.x += this.graphic.getGridSize();
	else if(dir == Constants.UP) pos.y -= this.graphic.getGridSize();
	else if(dir == Constants.DOWN) pos.y += this.graphic.getGridSize();
	
	return pos;
};

//return a random direction 
Ghost.prototype.getRandomDirection = function(){
	var ret;
	if(this.direction == Constants.LEFT || this.direction == Constants.RIGHT) {
		ret = [Constants.UP, Constants.DOWN][Math.floor(Math.random()*2)];
	} else {
		ret =  [Constants.LEFT, Constants.RIGHT][Math.floor(Math.random()*2)];
	}
	return ret;
}

Ghost.prototype.randomMovement = function(avoid) {
	var dir;

	if(this.direction == Constants.LEFT || this.direction == Constants.RIGHT) {
		if(Math.random() > 0.5 || avoid == Constants.DOWN){
			dir = Constants.UP;
		} else {
			dir = Constants.DOWN;
		}
	} else {
		if(Math.random() > 0.5 || avoid == Constants.RIGHT){
			dir = Constants.LEFT;
		} else {
			dir = Constants.RIGHT;
		}
	}

	if(avoid != null && dir == avoid) dir = this.randomMovement(avoid);

	return dir;
}

Ghost.prototype.moveTowards = function(pos) {
	var dir;
	var x = this.position.x - pos.x;
	var y = this.position.y - pos.y;

	//try to move towards the position but never turn around
	if(!this.isNextSolid(Constants.UP) && y > 0 && this.direction != Constants.DOWN) {
		return Constants.UP;
	} else if(!this.isNextSolid(Constants.DOWN) && y < 0 && this.direction != Constants.UP) {
		return Constants.DOWN;
	} else if(!this.isNextSolid(Constants.LEFT) && x > 0 && this.direction != Constants.RIGHT) {
		return Constants.LEFT;
	} else if(!this.isNextSolid(Constants.RIGHT) && x < 0 && this.direction != Constants.LEFT) {
		return Constants.RIGHT;
	}
}

Ghost.prototype.isNextSolid = function(dir) {
	ns = this.map.toMapPos(this.nextSquare(dir));
	return (this.map.isSolid(this.map.tileAt(ns)) && this.map.tileAt(ns) != 16);
}

Ghost.prototype.getNextDirection = function(avoid) {
	var dir = null;
	if(this.isDead()) {
		//get the ghost spawn point
		var spawnPos = this.map.getTilePosition(95);
		//move to the spawn point
		dir = this.moveTowards(spawnPos);
	} else {
		
		if((this.aggressive == false && Math.random() > 0.8) || (this.aggressive == true && Math.random() > 0.2)) {
			this.desicionDelay = 0;
			var playerPos = this.player.getPosition();
			dir = this.moveTowards(playerPos);
		}
	}

	if(dir === avoid || dir === undefined || dir == null || this.isScared()) {
		var dirs = this.getValidDirs();
		dir = dirs[Math.floor(Math.random() * dirs.length)];
	}
	
	return dir;
}

Ghost.prototype.onDesicionTile = function() {
	var dirs = [Constants.UP, Constants.DOWN, Constants.LEFT, Constants.RIGHT];
	var invalid = undefined;
	var count = 0;

	for(var i in dirs) {
		ns = this.map.toMapPos(this.nextSquare(dirs[i]));
		if(!this.map.isSolid(this.map.tileAt(ns)) || (this.isDead() && this.map.tileAt(ns) == 16)) count++;
		else invalid = dirs[i];
	}

	return count >= 3 ? invalid : false;
}

Ghost.prototype.getValidDirs = function() {
	var dirs = [Constants.UP, Constants.DOWN, Constants.LEFT, Constants.RIGHT];
	var valid = [];

	for(var i in dirs) {
		ns = this.map.toMapPos(this.nextSquare(dirs[i]));
		if(!this.map.isSolid(this.map.tileAt(ns))) {
			valid.push(dirs[i]);
		}
	}
	return valid;
}

//perform the ghost movement
//called every frame
Ghost.prototype.move = function() {
	if(this.movementDelay == 0) {

		if((this.game.getTicks() - this.diffTicks) >= 0 && this.player.getLevel() < 3) {
			this.diffTicks = this.game.getTicks() + 10;
			this.movementDelay = 1;
		}

		//if on square
		if(this.onSquare()){
			//get the next block position
			var nextPos = this.map.toMapPos(this.nextSquare(this.direction));
			var mapPos = this.map.toMapPos(this.position);

			//check for solid block ahead
			if(this.isNextSolid(this.direction)) {         
				this.lastDirection = this.direction;
				this.direction = this.getNextDirection(this.direction);
				this.move();
			}
			//if on spawn from ghost 2 move upwards
			else if(this.map.tileAt(mapPos) == 95) {
				if(this.isDead()) {
					//check if the ghost should be scared
					if(this.scaredCountdown > 0) {
						this.state = "scared";
					} else {
						this.setState("normal");
					}
				}
				this.direction = Constants.UP;
				n = this.nextPosition();
				this.position = n;
			}
			//if we have more than 2 directions to move
			else if(this.onDesicionTile() !== false) {
				invalidDir = this.onDesicionTile();
				this.lastDirection = this.direction;
				this.direction = this.getNextDirection(invalidDir);

				//move to the position
				n = this.nextPosition();
				this.position = n;
			} else {
				//if not get the next position
				n = this.nextPosition();
				this.position = n;
			}
		} else { 
			//if not get the next position
			n = this.nextPosition();
			this.position = n;
		}
	} else {
		this.movementDelay--;
	}
};

Ghost.prototype.clean = function() {
	var gridSize = this.graphic.getGridSize();
	var context = this.game.getContext();
	var pos = this.position;

	context.clearRect(Math.floor(pos.x), Math.floor(pos.y), gridSize, gridSize);
};

Ghost.prototype.draw = function(animate) {
	//play animation?
	animate = animate === false ? false : true;
	var gridSize = this.graphic.getGridSize();

	//animation logic
	if((this.game.getTicks() >= this.aniTicks + this.game.getFPS() / 4) && animate) {
		this.aniTicks = this.game.getTicks();
		this.aniOffX += gridSize;
		
		if(this.aniOffX == gridSize * 2) {
			this.aniOffX = 0;
		}
	}
	
	//if scared
	if(this.isScared()) {
		var time = this.calcScaredTime() * this.game.getFPS();

		if(this.scaredCountdown < time / 3) {
			if(this.blinkCnt == 0) {
				if(this.sprite == "scared") this.sprite = "ghost_" + this.id;
				else this.sprite = "scared";
				this.blinkCnt = Math.floor(this.game.getFPS() / 2);
			}
			this.blinkCnt--;
		} else {
			this.sprite = "scared";
		}
	} else if(this.isDead()) {
		this.sprite = "ghost_dead";
	} else {
		//normal spirte
		this.sprite = "ghost_" + this.id;
	}

	if(this.game.isDebug()) {
		var gs = this.graphic.getGridSize();
		var ctx = this.game.getContext();
		ctx.beginPath();
		var rect1 = this.getCollRect1();
		ctx.rect(rect1.x, rect1.y,  rect1.width, rect1.height);
		ctx.fillStyle = 'red';
		ctx.fill();
		ctx.beginPath();
		var rect2 = this.getCollRect2();
		ctx.rect(rect2.x, rect2.y,  rect2.width, rect2.height);
		ctx.fillStyle = 'red';
		ctx.fill();
	}
	
	//draw the sprite
	this.graphic.draw(this.sprite, 
		Math.floor(this.position.x), 
		Math.floor(this.position.y), 
		this.aniOffX, 
		(this.dir-1) * this.graphic.getGridSize());
};

Ghost.prototype.calcScaredTime = function() {
	//calc scare time
	var time = 15;
	
	if(this.player.getLevel() < 5) {
		time -= (this.player.getLevel()-1) * 3;
	} else {
		time  = 5;
	}

	return Math.floor(time);
}

Ghost.prototype.update = function(){
	//var time = this.calcScaredTime();

	//if scared
	if(this.scaredCountdown == 0 && this.onSquare() && this.isScared()) {
		this.setState("normal");
	}

	if(this.scaredCountdown > 0) {
		this.scaredCountdown--;
	}
}

Ghost.prototype.getPosition = function() {
	return this.position;
};

Ghost.prototype.toString = function(){
	return "Ghost: (" + this.position.x + "/" + this.position.y + ") - D: " + this.direction + " OS: " + this.onSquare();
};

Ghost.prototype.setScared = function(scared){
	this.setState("scared");
};

Ghost.prototype.isScared = function(){
	return this.state == "scared";
};

Ghost.prototype.isDead = function(){
	return this.state == "dead";
};

Ghost.prototype.die = function(){
	this.setState("dead");
};

Ghost.prototype.alignToGrid = function() {
	this.position.x -= this.position.x % this.speed;
	this.position.y -= this.position.y % this.speed;
}

Ghost.prototype.setState = function(state) {
	if(state == "dead") {
		this.state = "dead";
		this.alignToGrid();
		this.scaredCountdown = 0;
	} else if(state == "scared") {
		if(!this.isDead()) {
			this.state = "scared";
		}
		this.scaredCountdown = (this.calcScaredTime() * this.game.getFPS());
	} else {
		this.state = "normal";

		//count how many scared ghots are left
		var ghosts = this.game.getGhosts();
		var intScared = 0;
		for(var i in ghosts) {
			if(ghosts[i].isScared()) intScared++;
		}
		
		//if none reset the ghost counter 
		if(intScared == 0) {
			//stop the scared sound
			this.player.resetGhostCount();
		}
	}
}

Ghost.prototype.reset = function() {
	this.resetPosition();
	this.setState("normal");
}

Ghost.prototype.getId = function() {
	return this.id;
}

Ghost.prototype.setId = function(id) {
	this.id = id;
}

Ghost.prototype.isAggressive = function() {
	return this.aggressive;
}

Ghost.prototype.setAggressive = function(agg) {
	this.aggressive = (agg !== true ? false : true);
}