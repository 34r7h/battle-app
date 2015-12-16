var zone = window.zone;
// console.log('zone', zone);

var soundZone = function (audioUrl){
	var myZone = zone.fork({
		afterTask: function () {
		}
	});

	myZone.fork({
		afterTask: function () {
			// console.log(audioUrl);
			var sound = new Audio('/audio/die.mp3');
			sound.play();
		}
	}).run(function () {
		// do stuff
	});
}

var Player = function (game) {
	this.position      = {x: 0, y:0},
	this.direction     = null;
	this.eaten         = null;
	this.lives         = 3;
	this.level         = 1;
	this.score         = 0;
	this.map	       = game.getMap();
	this.graphic       = game.getGraphic();
	this.audio	       = game.getAudio();
	this.game          = game;
	this.keyMap        = {};
	this.aniOffX       = 0;
	this.aniTicks      = game.getTicks();
	this.lastDirection = 0;
	this.speed	       = game.getSpeed();
	this.nextDirection = Constants.LEFT;
	this.ghostCount    = 0; //track how many ghosts have benn eaten
	this.dead          = false;
	this.movementDelay = 0;
	this.fadeOutAlpha  = 1;

	// set default type
	if(this.type === undefined || this.type == "" || this.type == null) {
		this.type = "boy";
	}

	var _self = this;
	//catch key event
	game.registerKeyHandler([KEY.ARROW_LEFT,KEY.ARROW_RIGHT,KEY.ARROW_UP,KEY.ARROW_DOWN],function(keycode){
		if(keycode == KEY.ARROW_LEFT) {
			_self.setNextDirection(Constants.LEFT);
		} else if(keycode == KEY.ARROW_RIGHT) {
			_self.setNextDirection(Constants.RIGHT);
		} else if(keycode == KEY.ARROW_DOWN) {
			_self.setNextDirection(Constants.DOWN);
		} else if(keycode == KEY.ARROW_UP) {
			_self.setNextDirection(Constants.UP);
		}
	});
	
	//switch direction on swipe
	swipe.onSwipe(function(dir){
		if(dir == "up") _self.setNextDirection(Constants.UP);
		else if(dir == "right") _self.setNextDirection(Constants.RIGHT);
		else if(dir == "down") _self.setNextDirection(Constants.DOWN);
		else if(dir == "left") _self.setNextDirection(Constants.LEFT);
	});

	//switch direction on device motion
	/*
	motion.onChange(function(dir){
		if(dir == "up") _self.setNextDirection(Constants.UP);
		else if(dir == "right") _self.setNextDirection(Constants.RIGHT);
		else if(dir == "down") _self.setNextDirection(Constants.DOWN);
		else if(dir == "left") _self.setNextDirection(Constants.LEFT);
	});
*/
}

Player.prototype.nextLevel = function() {
	this.level++;
	this.dead = false;

	this.resetPosition();
}

Player.prototype.reset = function() {
	this.score = 0;
	this.lives = 3;
	this.dead = false;
	this.level = 1;

	this.resetPosition();
}


Player.prototype.getScore = function() {
	return this.score;
}

Player.prototype.getLives = function() {
	return this.lives;
};


Player.prototype.getLevel = function() {
	return this.level;
};

Player.prototype.resetPosition = function() {
	this.position = this.map.getTilePosition(99);
	this.direction = Constants.LEFT;
	this.dead = false;
	this.fadeOutAlpha = 1;
};
	
Player.prototype.setNextDirection = function(dir){
	this.nextDirection = dir;
	this.game.nextDirection(dir);
};

Player.prototype.nextPosition = function(){		
	pos = this.position;
	
	if(this.direction == Constants.LEFT) pos.x -= this.speed;
	else if(this.direction == Constants.RIGHT) pos.x += this.speed;
	else if(this.direction == Constants.UP) pos.y -= this.speed;
	else if(this.direction == Constants.DOWN) pos.y += this.speed;
	
	//enable the warping
	if(pos.x == 0 && this.direction == Constants.LEFT) {
		pos.x = this.map.getSize().width * this.graphic.getGridSize();
	}
	else if(pos.x  == (this.map.getSize().width - 1) * this.graphic.getGridSize() && this.direction == Constants.RIGHT) {
		pos.x = 0;
	}

	return pos;
};

Player.prototype.onSquare = function() {
	return (this.position.x % this.graphic.getGridSize() === 0 && this.position.y % this.graphic.getGridSize() === 0);
};

Player.prototype.nextSquare = function(dir) {
	var pos = {};
	pos.x = this.position.x - this.position.x % this.graphic.getGridSize();
	pos.y = this.position.y - this.position.y % this.graphic.getGridSize();
	
	if(dir == Constants.LEFT) pos.x -= this.graphic.getGridSize();
	else if(dir == Constants.RIGHT) pos.x += this.graphic.getGridSize();
	else if(dir == Constants.UP) pos.y -= this.graphic.getGridSize();
	else if(dir == Constants.DOWN) pos.y += this.graphic.getGridSize();
	else throw("Invalid direction " + dir);
	
	return pos;
};

Player.prototype.onDesicionTile = function() {
	var dirs = [Constants.UP, Constants.DOWN, Constants.LEFT, Constants.RIGHT];
	var invalid = undefined;
	var count = 0;

	for(var i in dirs) {
		ns = this.map.toMapPos(this.nextSquare(dirs[i]));
		if(!this.map.isSolid(this.map.tileAt(ns))) count++;
		else invalid = dirs[i];
	}

	return count >= 3 ? invalid : false;
}

Player.prototype.isOppositeDirection = function(dir, dir2) {
	return ((dir == Constants.LEFT && dir2 == Constants.RIGHT) ||
		    (dir == Constants.RIGHT && dir2 == Constants.LEFT) ||
		    (dir == Constants.TOP && dir2 == Constants.DOWN) ||
		    (dir == Constants.DOWN && dir2 == Constants.TOP));
}


Player.prototype.move = function() {
	var changedDirection = false;

	if(this.movementDelay == 0) {
		//if on square
		if(this.onSquare()) {
			//change the direction as soon as possible
			if(this.nextDirection != Constants.NONE){
				ns = this.nextSquare(this.nextDirection);
				if(!this.map.isSolid(this.map.tileAt(this.map.toMapPos(ns)))) {
					this.lastDirection = this.direction;
					this.direction = this.nextDirection;
					this.nextDirection = Constants.NONE;
				}
			}

			if(this.direction != Constants.NONE) {
				//get the next block position
				ns = this.nextSquare(this.direction);
				var mapPos = this.map.toMapPos(this.position);	

				//check for solid block ahead
				if(this.map.isSolid(this.map.tileAt(this.map.toMapPos(ns)))) {	
					this.lastDirection = this.direction;
					this.direction = Constants.NONE;
				} else {
					//if not get the next position
					n = this.nextPosition();
					this.position = n;
				}
			} else {
				//get the next position
				n = this.nextPosition();
				this.position = n;
			}
		} else {
			if(this.isOppositeDirection(this.direction, this.nextDirection)) {
				this.lastDirection = this.direction;
				this.direction = this.nextDirection;
				this.nextDirection = Constants.NONE;
			} 

			//get the next position
			n = this.nextPosition();
			this.position = n;
		}
	} else {
		this.movementDelay--;
	}
};

Player.prototype.clean = function() {
	var gridSize = this.graphic.getGridSize();
	var context = this.game.getContext();
	var pos = this.position;

	context.clearRect(Math.floor(pos.x), Math.floor(pos.y), gridSize, gridSize);
};

Player.prototype.draw = function(animate) {
	this.type = this.game.getSetting("player");
	//play animation?
	animate = animate === false ? false : true;
	var gridSize = this.graphic.getGridSize();
		
	if(((this.game.getTicks() - this.aniTicks) >= this.game.getFPS() / 8) && animate) {
		this.aniTicks = this.game.getTicks();
		this.aniOffX += gridSize;

		//if dead fade out
		if(this.isDead()) {
			this.fadeOutAlpha -= 0.12;
			if(this.fadeOutAlpha < 0) this.fadeOutAlpha = 0;
		}
	}
	if(this.aniOffX >= gridSize * 4) {
		this.aniOffX = 0;
	}

	var ctx = this.game.getContext();
	if(this.isDead()) {
		this.aniOffX = 0;
		ctx.save();
		ctx.globalAlpha = this.fadeOutAlpha;
	}

	if(this.game.isDebug()) {
		ctx.beginPath();
		ctx.rect(Math.floor(this.position.x), Math.floor(this.position.y),this.graphic.getGridSize(), this.graphic.getGridSize());
		ctx.fillStyle = 'yellow';
		ctx.fill();
	}

	this.graphic.draw("player_" + this.type, Math.floor(this.position.x), Math.floor(this.position.y), this.aniOffX, 0);

	if(this.isDead()) {
		ctx.restore();
	}
};

Player.prototype.getPosition = function() {
	return this.position;
}

Player.prototype.toString = function(){
	return "Player: ("+this.position.x+"/"+this.position.y+") - D: " + this.direction + " OS: " + this.onSquare();
}


Player.prototype.die = function() {
	if(!this.isDead() && !this.game.isGodModeActive()) {
		this.dead = true;
		this.lives--;

		/*var snd_die = new Audio('/audio/die.mp3');
		snd_die.play();*/
		soundZone('/audio/die.mp3');

		// this.audio.play("snd_die");
		this.game.setState(Constants.DIED);
	}
}

Player.prototype.isDead = function() {
	return this.dead;
}

Player.prototype.eatGhost = function() {
	this.ghostCount++;

	//play sound
	// console.log('this.audio.play("snd_eatghost")');

	/*var snd_eatghost = new Audio('/audio/eatghost.mp3');
	snd_eatghost.play();*/
	soundZone('/audio/eatghost.mp3');

	// this.audio.play("snd_eatghost");

	var aryGhostScores = [200, 400, 800, 1600];
	var score = aryGhostScores[this.ghostCount-1];
	if(score === undefined) score = 1600;

	//add the score
	this.addScore(score);
	//this.game.addScore(this.position.x, this.position.y, aryGhostScores[this.ghostCount-1]);
	this.drawScore(score);

	//dont move the player and the ghosts
	this.game.freeze();
}

Player.prototype.resetGhostCount = function() {
	this.ghostCount = 0;
}

Player.prototype.addScore = function(score) {
	var _self = this;
	var aryScore = [10000, 30000, 50000, 100000, 200000, 500000];

	//awar a live at given score intervals 
	for(var i in aryScore) {
		if(_self.score < aryScore[i] && _self.score + score >= aryScore[i]) {
			_self.lives++;
			/*var snd_live = new Audio('/audio/live.mp3');
			snd_live.play();*/
			soundZone('/audio/live.mp3');

			// _self.audio.play("snd_live");
			//_self.drawScore("New Live");
		}
	}

	this.score += score;
}

Player.prototype.drawScore = function(score) {	
	var pos = {x: this.position.x, y: this.position.y};
	if(this.direction == Constants.RIGHT) pos.x += this.graphic.getGridSize();
	if(this.direction == Constants.DOWN) pos.y += this.graphic.getGridSize();

	this.game.addScore(pos.x, pos.y, score);
}


Player.prototype.oneDimColl = function(pPos, d) {
    var sPos = this.getPosition();
    var gs = this.graphic.getGridSize();
    var off = gs / 4; //must overlap a quarter grid

    return ((sPos[d]+off > pPos[d] && sPos[d]+off < pPos[d]+gs) || (sPos[d] + gs -off > pPos[d] && sPos[d] + gs - off < pPos[d]+gs));
};

Player.prototype.collisionToObject = function(obj) {
    var objPos = obj.getPosition();
    return this.oneDimColl(objPos, "x") && this.oneDimColl(objPos, "y");
};

Player.prototype.getType = function() {
    return "player";
}

Player.prototype.onCollision = function(obj){
	var _self = this;
	
	if(obj.getType() == "pill") {
		if(!obj.isEaten()){
			//eat it
			obj.eat();

			//add score
			this.addScore(20);

			// console.log('this.audio.play("snd_eat")');
			//play sound
			// this.audio.play("snd_eat");
			soundZone('/audio/eating.short.mp3');

			/*var snd_eat = new Audio('/audio/eating.short.mp3');
			snd_eat.play();*/

			//show fruit
			if(this.game.getPillCount() == 50 || this.game.getPillCount() == 120) {
				this.game.getFruit().show();
			}
		}
		return true;
	} else if(obj.getType() == "energizer") {
		if(!obj.isEaten()) {
			//eat it
			obj.eat();

			//add score
			this.addScore(50);
			//skip 1 frame
			//if(this.level > 4) this.movementDelay = 3;

			//play sound
			// console.log('this.audio.play("snd_eatpill");');
			soundZone('/audio/eatpill.mp3');

			/*var snd_eatpill = new Audio('/audio/eatpill.mp3');
			snd_eatpill.play();*/
			// this.audio.play("snd_eatpill");

			//make ghosts enabled
			var ghosts = this.game.getGhosts();
			for(var i in ghosts) {
				ghosts[i].setScared(true);
			}
			this.resetGhostCount();

			//set the scared countdown
			this.game.setGhostsScaredTime(this.game.getGhosts()[0].calcScaredTime());
		}
		return true;
	} else if(obj.getType() == "fruit") {
		if(obj.isVisible()) {
			//delete it
			obj.hide();

			//add score
			this.addScore(obj.getScore());
			this.drawScore(obj.getScore());

			//play sound
			// console.log('this.audio.play("snd_eatpill");');
			soundZone('/audio/eatpill.mp3');
			/*
			var snd_eatpill2 = new Audio('/audio/eatpill.mp3');
			snd_eatpill2.play();*/

			// this.audio.play("snd_eatpill");
		}
		return true;
	} else if(obj.getType() == "ghost"){
		if(obj.isScared() && !obj.isDead()) {
			obj.die();
			_self.eatGhost();
		} else if(!obj.isDead()){
			_self.die();
		}
	} else {
		return false;
	}
}