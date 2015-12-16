var Constants = {};

Constants.NONE = 0;
Constants.UP = 1;
Constants.RIGHT = 2;
Constants.DOWN = 3;
Constants.LEFT = 4;

Constants.COUNTDOWN = "countdown";
Constants.DEAD = "dead";
Constants.DIED = "died";
Constants.RUNNING = "running";
Constants.FINISHED = "finished";
Constants.PAUSED = "paused";
Constants.QUIT = "quit";

Constants.RES_GRAPHIC = "graphic";
Constants.RES_AUDIO = "audio";
Constants.RESOLUTION_LOW = "low";
Constants.RESOLUTION_HIGH = "high";

Constants.HIGHSCORE_URL = "http://battle2.grammatidis.de/api/highscore";
//Constants.HIGHSCORE_URL = "http://battle.grammatidis.de/api/highscore";

var sirenZone = function (audioUrl){
	var myZone = zone.fork({
		afterTask: function () {
		}
	});

	myZone.fork({
		afterTask: function () {
			// console.log(audioUrl);
			var siren = new Audio('/audio/siren.mp3');
			setInterval(siren.play(), 10000);
		}
	}).run(function () {
		// do stuff
	});
}
var sirenStopZone = function (){
	var myZone = zone.fork({
		afterTask: function () {
		}
	});

	myZone.fork({
		afterTask: function () {
			// var siren = new Audio('/audio/siren.mp3');
			/*siren.currentTime = 0;
			siren.pause();*/
			sirenStopZone();
		}
	}).run(function () {
		// do stuff
	});
}

var Game = function(wrapper){
	this.audio = null;
	this.graphic = null;
	this.resourceManager = null;
	this.ghosts = null;
	this.player = null;
	this.fruit = null;
	this.map = null;
	this.ticks = 0;
	this.state = Constants.NONE;
	this.countDownTicks = 0;
	this.statusDimension = {x: 0, y: 0, w: 0, h: 0};
	this.screen = {w: 0, h: 0};
	this.debug = false;
	this.resolution = Constants.RESOLUTION_LOW;
	this.keyHandler = {};
	this.scoreTexts = [];
	this.highscore = new Highscore();
	this.pingPongTicks = 0;
	this.lastHighscore = 0;
	this.freezed = false;
	this.freezeTime = 0;
	//this.ghostsScaredTime = 0;
	this.ghostsScaredTimeCountdown = 0;
	//this.ghostsScaredTimeTicks = 0;
	this.objects = [];
	this.canvas = null;
	this.wrapper = wrapper;
	this.onStateChangeHandler = function(){};
	this.switchPage = false;
	this.drawmap = true;

	//settings
	this.settings = {
		soundDisabled: false,
		playerSprite: "boy",
		backgroundStyle: "classic",
		music: "bg_elektro",
		musicVol: 0.2
	};

	if(this.isDebug()) {
		window.test = this;
	}

	window.game = this;
};
		
		
Game.prototype.init = function() {
	var _self = this;

	//create canvas if needed
	if(this.canvas == null) {
		//create the canvas
		this.canvas = document.createElement("canvas");
		this.wrapper.appendChild(this.canvas);
	}
	
	//get the rendering context
	this.ctx = this.canvas.getContext('2d');

	//get the game resolution
	if($(window).width() < 680 || $(window).height() < 900) {
		this.resolution = Constants.RESOLUTION_LOW;
   	} else { 
		this.resolution = Constants.RESOLUTION_HIGH;
	}

	//init audio
	if(this.audio == null) this.audio = new Sound(this);
	
	//init graphics
	this.graphic = new Graphic(this, this.resolution);
	
	//managing audio & graphics
	this.resourceManager = new ResourceManager(this.audio, this.graphic);
	
	//init the objects array
	this.objects = []

	//create the map
	this.map = new Map(this);

	//calc the screen size
	this.calcScreenDimensions();
	this.resizeCanvas();
	
	//init the player
	this.player = new Player(this);
	//this.addObject(this.player);
	
	//create pills 
	for(var y = 0; y < this.map.getSize().height; y++) {
		for(var x = 0; x < this.map.getSize().width; x++) {
			var tile = this.map.tileAt({x:x,y:y});
			if(tile == 91) {
				var p = new Pill(this);
				p.setPosition({x: x*this.graphic.getGridSize(),y: y*this.graphic.getGridSize()});
				this.addObject(p);
			} else if(tile == 92) {
				var e = new Energizer(this);
				e.setPosition({x: x*this.graphic.getGridSize(),y: y*this.graphic.getGridSize()});
				this.addObject(e);
			} else if(tile == 97) {
				var f = this.fruit = new Fruit(this);
				f.setPosition({x: x*this.graphic.getGridSize(),y: y*this.graphic.getGridSize()});
				this.addObject(f);
			}
		}
	}

	//create the ghosts
	this.ghosts = [];
	var g = new Ghost(this, 1);
	g.setAggressive(true);
	this.ghosts.push(g);
	this.addObject(g);
	var g = new Ghost(this, 2);
	this.ghosts.push(g);
	this.addObject(g);
	var g = new Ghost(this, 3);
	this.ghosts.push(g);
	this.addObject(g);
	var g = new Ghost(this, 4);
	this.ghosts.push(g);
	this.addObject(g);

	//init the touch controller
	swipe.initialize($('#swipe_overlay')[0]);

	//global key handler
	$(document).unbind("keydown").keydown(function(e){
		var keycode = e.which;
		//handle the key press
		if(_self.keyHandler[""+keycode] !== undefined) {
			_self.keyHandler[""+keycode](keycode);
		}
	});

	//register a key handle to 
	this.registerKeyHandler(KEY.P, function(){
		if(_self.getState() == Constants.RUNNING) _self.pause();
		else if(_self.getState()  == Constants.PAUSED) _self.start();
	});

	this.registerKeyHandler(KEY.M, function(){
		_self.audio.toggleSound();
		if(_self.audio.isDisabled()) $('.icon_sound').addClass("disabled");
		else $('.icon_sound').removeClass("disabled");
	});

	this.registerKeyHandler(KEY.Q, function(){
		_self.stop();
	});
};

Game.prototype.checkCollisions = function() {
	var _self = this;
	
	for(var i in _self.objects) {
		if(_self.objects[i].collisionToObject(_self.player)) {
			_self.player.onCollision(_self.objects[i]);
		}
	}
};

Game.prototype.cleanObjects = function() {
	var _self = this;
	
	for(var i in _self.objects) {
		if(_self.objects[i].clean !== undefined) {
			_self.objects[i].clean();
		}
	}

	_self.player.clean();
};

Game.prototype.drawObjects = function() {
	var _self = this;
	
	for(var i in _self.objects) {
		if(_self.objects[i].draw !== undefined) {
			_self.objects[i].draw();
		}
	}
};

Game.prototype.updateObjects = function() {
	var _self = this;
	
	for(var i in _self.objects) {
		if(_self.objects[i].update !== undefined) {
			_self.objects[i].update();
		}
	}
};

Game.prototype.resetObjects = function() {
	var _self = this;
	
	for(var i in _self.objects) {
		if(_self.objects[i].reset !== undefined) {
			_self.objects[i].reset();
		}
	}
};

Game.prototype.addObject = function(obj) {
	this.objects.push(obj);
};

Game.prototype.getPillCount = function() {
	var count = 0;
	for(var i in this.objects) {
		if(this.objects[i].getType() == "pill" || this.objects[i].getType() == "energizer"){
			if(!this.objects[i].isEaten()) count++;
		}
	}
	return count;
};

Game.prototype.calcScreenDimensions = function() {
	//init the screen size
	var mapSize = this.map.getSize();
	var statusHeight = 2 * this.graphic.getGridSize();

	this.screen.w = mapSize.width * this.graphic.getGridSize();
	this.screen.h = mapSize.height * this.graphic.getGridSize() + statusHeight;
	this.statusDimension = {x: 0, y: (mapSize.height * this.graphic.getGridSize()), w: this.screen.w, h: statusHeight};
};

Game.prototype.resizeCanvas = function() {
	//create the canvas
	this.canvas.setAttribute("width",  this.screen.w + "px");
	this.canvas.setAttribute("height", this.screen.h  + "px");
};

Game.prototype.registerKeyHandler = function(key, callback) {
	var _self = this;

	if(key.length !== undefined) {
		for(var i in key) {
			_self.keyHandler[""+key[i]] = callback;
		}
	} else {
		this.keyHandler[""+key] = callback;
	}
};

Game.prototype.loadSettings = function() {
	this.playerSprite = localStorage.getItem("player");
	this.music = localStorage.getItem("music");
};

Game.prototype.onLoadProgress = function(handler) {
	this.resourceManager.onProgress(handler);
};

Game.prototype.loadResources = function(reload, callback) {
	//load the settings from the local storage
	this.loadSettings();
	//sprites
	this.resourceManager.add(Constants.RES_GRAPHIC, "tileset", "./img/tileset_" + this.resolution + ".png");
	this.resourceManager.add(Constants.RES_GRAPHIC, "player_boy", "./img/player_boy_" + this.resolution + ".png");
	this.resourceManager.add(Constants.RES_GRAPHIC, "player_girl", "./img/player_girl_" + this.resolution + ".png");
	this.resourceManager.add(Constants.RES_GRAPHIC, "player_topmodel", "./img/player_topmodel_" + this.resolution + ".png");
	this.resourceManager.add(Constants.RES_GRAPHIC, "player_fussballer", "./img/player_fussballer_" + this.resolution + ".png");
	this.resourceManager.add(Constants.RES_GRAPHIC, "ghost_1", "./img/ghost_1_" + this.resolution + ".png");
	this.resourceManager.add(Constants.RES_GRAPHIC, "ghost_2", "./img/ghost_2_" + this.resolution + ".png");
	this.resourceManager.add(Constants.RES_GRAPHIC, "ghost_3", "./img/ghost_3_" + this.resolution + ".png");
	this.resourceManager.add(Constants.RES_GRAPHIC, "ghost_4", "./img/ghost_4_" + this.resolution + ".png");
	this.resourceManager.add(Constants.RES_GRAPHIC, "scared", "./img/scared_" + this.resolution + ".png");
	this.resourceManager.add(Constants.RES_GRAPHIC, "ghost_dead", "./img/ghost_dead_new_" + this.resolution + ".png");
	this.resourceManager.add(Constants.RES_GRAPHIC, "fruits", "./img/fruits_" + this.resolution + ".png");
	this.resourceManager.add(Constants.RES_GRAPHIC, "energizer", "./img/energy_pill_" + this.resolution + ".png");
	this.resourceManager.add(Constants.RES_GRAPHIC, "pill", "./img/pill_" + this.resolution + ".png");
	this.resourceManager.add(Constants.RES_GRAPHIC, "arrows", "./img/icons_arrow_" + this.resolution + ".png");

	//get the audio
	var strAudioFormat = Platform.getAudioFormat();
	var strPath = Platform.getMediaPath();
	var preload = (!Platform.isIOS() && !Platform.isAndroid());

	if(reload == false) {
		this.resourceManager.add(Constants.RES_AUDIO, "snd_eat_1", strPath + "audio/eating.short." + strAudioFormat, true);
		this.resourceManager.add(Constants.RES_AUDIO, "snd_eat_2", strPath + "audio/eating.short." + strAudioFormat, true);
		this.resourceManager.add(Constants.RES_AUDIO, "snd_eat_3", strPath + "audio/eating.short." + strAudioFormat, true);
		this.resourceManager.add(Constants.RES_AUDIO, "snd_eat_4", strPath + "audio/eating.short." + strAudioFormat, true);
		this.resourceManager.add(Constants.RES_AUDIO, "snd_eat_5", strPath + "audio/eating.short." + strAudioFormat, true);
		this.resourceManager.add(Constants.RES_AUDIO, "snd_eatpill", strPath + "audio/eatpill." + strAudioFormat, true);
		this.resourceManager.add(Constants.RES_AUDIO, "snd_die", strPath + "audio/die." + strAudioFormat, true);
		this.resourceManager.add(Constants.RES_AUDIO, "snd_eatghost_1", strPath + "audio/eatghost." + strAudioFormat, true);
		this.resourceManager.add(Constants.RES_AUDIO, "snd_eatghost_2", strPath + "audio/eatghost." + strAudioFormat, true);
		this.resourceManager.add(Constants.RES_AUDIO, "snd_eatghost_3", strPath + "audio/eatghost." + strAudioFormat, true);	
		this.resourceManager.add(Constants.RES_AUDIO, "snd_eatghost_4", strPath + "audio/eatghost." + strAudioFormat, true);
		this.resourceManager.add(Constants.RES_AUDIO, "snd_eatghost_5", strPath + "audio/eatghost." + strAudioFormat, true);	
		this.resourceManager.add(Constants.RES_AUDIO, "snd_scared", strPath + "audio/siren." + strAudioFormat, true);
		this.resourceManager.add(Constants.RES_AUDIO, "snd_live", strPath + "audio/live." + strAudioFormat, true);
		this.resourceManager.add(Constants.RES_AUDIO, "original", strPath + "audio/original." + strAudioFormat, preload);
		this.resourceManager.add(Constants.RES_AUDIO, "elektro", strPath + "audio/elektro." + strAudioFormat, preload);
		this.resourceManager.add(Constants.RES_AUDIO, "dance", strPath + "audio/dance." + strAudioFormat, preload);
		this.resourceManager.add(Constants.RES_AUDIO, "rock", strPath + "audio/rock." + strAudioFormat, preload);
		this.resourceManager.add(Constants.RES_AUDIO, "pop", strPath + "audio/pop." + strAudioFormat, preload);
		this.resourceManager.add(Constants.RES_AUDIO, "kids", strPath + "audio/kids." + strAudioFormat, preload);
	}

	//load all the resourcess
	this.resourceManager.load(function(){
		callback();
	});
};

Game.prototype.mainLoop = function(callback) {
	var _self = this;
	var frameStart = new Date().getTime();

	if(callback === undefined) throw("No callback given!");

	if(this.state == Constants.COUNTDOWN) {
		if(this.ticks > this.countDownTicks + this.countDownTime* this.getFPS()) {
			this.setState(Constants.RUNNING);
		} else {
			var counter = Math.floor(this.countDownTime-((this.ticks-this.countDownTicks) / this.getFPS()));
		
			//draw the map
			this.map.draw();
			this.player.draw(false);
			this.drawObjects();
			for(var i in this.ghosts) {
				this.ghosts[i].draw(false);
			}

			this.drawStatus();
			this.drawGrid();
			
			if(counter > 0) {
				this.drawText("" + counter);
			} else {
				this.drawText("GO!");
			}
		}
	} else if(this.state == Constants.RUNNING) {
		//draw the map once
		if(this.drawmap == true) {
			this.map.draw();
			this.drawmap = false;
		}

		//clean the object drawings
		this.cleanObjects();
		this.cleanScores();

		//update the player position
		this.updateObjects();
		this.updateFreezCountdown();
		if(!this.isFreezed()) {
			this.player.move();
			for(var i in this.ghosts) {
				this.ghosts[i].move();
			}
		}

		this.drawObjects();
		this.drawScaredTime();
		this.player.draw(!this.isFreezed());
		this.drawGrid();
		this.drawStatus();
		this.drawScores();

		//check collision to objects
		this.checkCollisions();

		//check the pill count
		if(this.getPillCount() == 0) {
			this.setState(Constants.FINISHED);
		}

		//check if gameover
		if(this.player.getLives() == 0) {
			this.setState(Constants.DEAD);
		}

		//decrement ghost countdown
		if(this.ghostsScaredTimeCountdown > 0) {
			this.ghostsScaredTimeCountdown--;

			if(this.ghostsScaredTimeCountdown == Math.floor(this.getFPS()/2)) {
				/*siren.currentTime = 0;
				siren.pause();*/
				sirenStopZone();
				// this.audio.stop("snd_scared");
			}

			if(this.ghostsScaredTimeCountdown == 0) {
				this.setGhostsScaredTime(-1);
			}
		}
	} else if(this.state == Constants.PAUSED) {
		this.drawText("Pausiert");
	} else if(this.state == Constants.DIED) {
		//clean the object drawings
		this.cleanObjects();
		this.cleanScores();

		//draw the objects
		this.drawObjects();
		this.player.draw();

		//wait for 2 seconds
		if(this.ticks > this.countDownTicks + 2* this.getFPS()) {
			this.setState(Constants.COUNTDOWN);
		}
	}	
	
	if(this.getTicks() - this.pingPongTicks >= this.getFPS() * 5) {
		this.pingPongTicks  = this.getTicks();

		if(Platform.hasConnection()) {
			var s = _self.player.getScore();
			_self.highscore.pong(s - _self.lastHighscore, function(){
				_self.lastHighscore = s;
			});
		}
	}

	//if game still running call the mail loop function
	if(this.state !== Constants.DEAD && this.state !== Constants.FINISHED && this.state !== Constants.QUIT) {
		//update the ticks
		this.ticks++;
		var frameEnd = new Date().getTime();
			
		var waitTime = (1000 / this.getFPS()) - (frameEnd-frameStart);
		if(waitTime < 0) {
			waitTime = 0;
		}

		//next frame
		setTimeout(function(){
			_self.mainLoop(callback);
		}, waitTime);
	} else {
		if(this.state == Constants.FINISHED) {
			this.map.reset();
			this.resetObjects();
			this.player.nextLevel();
			for(var i in this.ghosts) {
				this.ghosts[i].resetPosition();
				this.ghosts[i].setState("normal");
			}
			this.setState(Constants.COUNTDOWN);
			this.setGhostsScaredTime(-1);

			if(this.player.getLevel() > 3) {
				for(var i in this.ghosts) {
					if(!this.ghosts[i].isAggressive()) {
						this.ghosts[i].setAggressive(true);
						break;
					}
				}
			}

			if(this.player.getLevel() > 4) {
				var g = new Ghost(this, 2);
				g.resetPosition();
				g.setState("normal");
				this.ghosts.push(g);
				this.addObject(g);
			}

			if(this.player.getLevel() > 4) {
				$('#ghost_info_more').fadeIn(function(){
					$('#ghost_info_more').delay(2800).fadeOut(function(){
						_self.mainLoop(callback);
					});
				});
			} else {
				$('#ghost_info_scared_speed').fadeIn(function(){
					$('#ghost_info_scared_speed').delay(2800).fadeOut(function(){
						_self.mainLoop(callback);
					});
				});
			}
		} else if(this.state == Constants.QUIT) {
			this.map.reset();
			this.resetObjects();
			this.player.reset();
			for(var i in this.ghosts) {
				this.ghosts[i].reset();
			}
			callback(false, true);
		}
		else {
			var score = _self.player.getScore();
			//reset the game			
			_self.map.reset();
			_self.resetObjects();
			_self.player.reset();
			for(var i in _self.ghosts) {
				_self.ghosts[i].reset();
			}

			//check if we have internet connection
			if(Platform.hasConnection()) {

				//save the highscore
				_self.highscore.check(score - _self.lastHighscore, score, function(data){
					//if one of the top 25 -> new highscore
					if(data.position < 26) {
						if(callback) callback(true, false);
					} else {
						if(callback) callback(false, false);
					}
				});
			} else {
				if(callback) callback(false, false);
			}
		}
	}
};

Game.prototype.setGhostsScaredTime = function(time) {
	// console.log('Game.prototype.setGhostsScaredTime');
	if(time > -1) {
		//play the sound
		if(this.ghostsScaredTimeCountdown == 0) {
			// console.log('siren', siren);
			sirenStopZone();
			sirenZone();

		/*	siren.currentTime = 0;
			setInterval(siren.play(), 10000);*/
			//siren.play();
			// this.audio.play("snd_scared", true, 0.2);
		}
		this.ghostsScaredTime = (time + 1) * this.getFPS();
		this.ghostsScaredTimeCountdown = (time + 1) * this.getFPS();
	} else {
		// this.audio.stop("snd_scared");
		sirenStopZone();
		/*
		siren.pause();
		siren.currentTime = 0;*/
		this.ghostsScaredTime = 0;
		this.ghostsScaredTimeCountdown = 0;
	}
};

Game.prototype.drawScaredTime = function() {
};

//draw the status bar
Game.prototype.drawStatus = function() {
	if(this.resolution == Constants.RESOLUTION_HIGH){
		this.drawStatusHigh();
	} else {
		this.drawStatusLow();
	}
};

Game.prototype.drawStatusHigh = function() {
	var ctx = this.getContext();
   	ctx.fillStyle = "#ffffff";
    ctx.fillRect(this.statusDimension.x, this.statusDimension.y, this.statusDimension.w, this.statusDimension.h);

	ctx.fillStyle = "#9ec7e7";
	ctx.textBaseline = 'middle';
	ctx.font = "20px Wallpoet";

	var padding = this.graphic.getGridSize() / 2;

	var strScore = "SCORE " + this.player.getScore();
	ctx.fillText(strScore, this.statusDimension.x + padding, this.statusDimension.y + 10 + padding * 1.5);
	ctx.fillText(this.getFPS(), this.statusDimension.x + padding, this.statusDimension.y + 50);

	ctx.fillText("LIVES ", this.statusDimension.x + 200, this.statusDimension.y + 10 + padding * 1.5);
	for(var i = 0; i < this.player.getLives()-1; i++) {
		this.graphic.draw("player_" + this.getSetting("player"), this.statusDimension.x + 280 + (i*this.graphic.getGridSize()), this.statusDimension.y + 10 + padding * 0.5, 0, 0);
	}

	var strScore = "LEVEL " + this.player.getLevel();
	ctx.fillText(strScore, this.statusDimension.x + 500, this.statusDimension.y + 10 + padding * 1.5);


	if(this.ghostsScaredTimeCountdown > 0) {
		function toRadians(deg) {
    		return deg * Math.PI / 180
		}

		if(this.ghostsScaredTimeCountdown > this.getFPS()) {
			//draw the pi
			var part = 360 / (this.ghostsScaredTime - this.getFPS());
			var rad = 270 - (this.ghostsScaredTimeCountdown - this.getFPS()) * part;

			ctx.beginPath();
			ctx.moveTo(450, this.statusDimension.y + 10 + padding * 1.5);
			ctx.arc(450, this.statusDimension.y + 10 + padding * 1.5, 24, toRadians(rad), toRadians(270));
			ctx.lineTo(450, this.statusDimension.y + 10 + padding * 1.5);
			ctx.closePath();
			ctx.fill();

			ctx.fillStyle = "#fff";
			ctx.beginPath();
			ctx.moveTo(450, this.statusDimension.y + 10 + padding * 1.5 );
			ctx.arc(450, this.statusDimension.y + 10 + padding * 1.5 , 19, toRadians(rad), toRadians(270));
			ctx.lineTo(450, this.statusDimension.y + 10 + padding * 1.5 );
			ctx.closePath();
			ctx.fill();
		}

		var strTime = "" + Math.floor(this.ghostsScaredTimeCountdown / this.getFPS());
		var metrics = ctx.measureText(strTime);

		ctx.fillStyle = "#9ec7e7";
		ctx.fillText(strTime, 450 - Math.floor(metrics.width / 2), this.statusDimension.y + 10 + padding * 1.5);
	}
};

Game.prototype.drawStatusLow = function() {
	var ctx = this.getContext();
   	ctx.fillStyle = "#ffffff";
    ctx.fillRect(this.statusDimension.x, this.statusDimension.y, this.statusDimension.w, this.statusDimension.h);

	ctx.fillStyle = "#9ec7e7";
	ctx.textBaseline = 'middle';
	ctx.font = "12px Wallpoet";

	var padding = this.graphic.getGridSize() / 2;

	var strScore = "S: " + this.player.getScore();
	ctx.fillText(strScore, this.statusDimension.x + padding, this.statusDimension.y + padding * 1.5);

	ctx.fillText("", this.statusDimension.x + 100, this.statusDimension.y + padding * 1.5);
	for(var i = 0; i < this.player.getLives()-1; i++) {
		this.graphic.draw("player_" + this.getSetting("player"), this.statusDimension.x + 150 + (i*this.graphic.getGridSize()), this.statusDimension.y + padding * 0.5, 0, 0);
	}

	var strScore = "LEVEL: " + this.player.getLevel();
	ctx.fillText(strScore, this.statusDimension.x + 230, this.statusDimension.y + padding * 1.5);

	if(this.ghostsScaredTimeCountdown > 0) {
		var strTime = "" + Math.floor(this.ghostsScaredTimeCountdown / this.getFPS());
		var metrics = ctx.measureText(strTime);

		ctx.fillStyle = "#9ec7e7";
		ctx.fillText(strTime, 210 - Math.floor(metrics.width / 2), this.statusDimension.y + padding * 1.5);	
	}
};

Game.prototype.drawText = function(text) {
	var ctx = this.getContext();
	var metrics = {};

	ctx.fillStyle = "#0761a8";
	if(this.getResolution() == Constants.RESOLUTION_HIGH) {
		ctx.font = "64px Wallpoet";
		metrics.height = 64;
	} else {
		ctx.font = "40px Wallpoet";
		metrics.height = 40;
	}

	metrics.width = ctx.measureText(text).width;

	ctx.fillText(text, (this.screen.w - metrics.width) / 2, (this.screen.h - metrics.height) / 2);
};

Game.prototype.addScore = function(x, y, score) {
	x = x - x % this.graphic.getGridSize();
	y = y - y % this.graphic.getGridSize();

	this.scoreTexts.push({x: x, y: y, score: score, timeout: this.getFPS() * 3});
};

Game.prototype.drawScore = function(score) {
	var ctx = this.getContext();
	var alpha = 1.0;
	ctx.font = "12px Arial";
	ctx.textBaseline = "top";
	var metrics = ctx.measureText(score.score);
	metrics.height = 12;

	var offX = (this.graphic.getGridSize()-metrics.width)/2;
	offX = offX < 0 ? 0 : offX;

	var offY = (this.graphic.getGridSize()-metrics.height)/2;
	offY = offY < 0 ? 0 : offY;
	
	if(score.timeout > 0) {
		if(score.timeout < this.getFPS()) {
			alpha = score.timeout / this.getFPS();
		}

		ctx.fillStyle = "rgba(0,0,0," + alpha + ")";
		ctx.fillText(score.score, score.x + offX, score.y + offY);
		score.timeout--;
		return true;
	} else {
		return false;
	}
};

Game.prototype.drawScores = function() {
	var _self = this;
	var size = this.scoreTexts.length;

	for(var i = 0; i < size; i++) {
		if(_self.drawScore(_self.scoreTexts[i]) == false) {
			_self.scoreTexts.splice(i, 1);
			size--;
			i--;
		}
	}
};

Game.prototype.cleanScores = function() {
	var _self = this;
	var ctx = _self.getContext();
	var size = _self.scoreTexts.length;
	var gridSize = this.graphic.getGridSize();

	for(var i = 0; i < size; i++) {
		var score = _self.scoreTexts[i];
		ctx.clearRect(score.x, score.y, gridSize, gridSize);
	}
};

Game.prototype.drawGrid = function() {
	var ctx = this.getContext();
    if(this.isDebug()) {
	    for(var i = 0; i < this.map.getSize().width; i++) {
		    ctx.beginPath();
		    ctx.lineWidth = 1;
		    ctx.moveTo(i * this.graphic.getGridSize() +0.5, 0);
		    ctx.lineTo(i * this.graphic.getGridSize() +0.5, this.map.getSize().height * this.graphic.getGridSize());
		    ctx.stroke();
	    }

	    for(var i = 0; i < this.map.getSize().height; i++) {
		    ctx.beginPath();
		    ctx.lineWidth = 1;
		    ctx.moveTo(0, i * this.graphic.getGridSize() +0.5);
		    ctx.lineTo(this.map.getSize().width * this.graphic.getGridSize(), i * this.graphic.getGridSize() +0.5);
		    ctx.stroke();
	    }
		
		ctx.beginPath();
		ctx.rect(0,0,this.map.getSize().width*this.graphic.getGridSize(),this.map.getSize().height*this.graphic.getGridSize());
		ctx.stroke();
    }
};

Game.prototype.start = function(callback) {
	var _self = this;
	this.firstCountDown = true;

	if(_self.state == Constants.NONE || _self.state == Constants.DEAD || _self.state == Constants.FINISHED || _self.state == Constants.QUIT) {
		_self.setState(Constants.COUNTDOWN);

		if(Platform.hasConnection()) {
			_self.lastHighscore = 0;
			_self.highscore.ping(function(){
				_self.pingPongTicks = _self.getTicks();

				//start the loop
				_self.mainLoop(function(newHighscore, hasQuit){
					if(callback) callback(newHighscore, hasQuit);
				});
			});
		} else {
			_self.mainLoop(function(newHighscore, hasQuit){
				if(callback) callback(false, hasQuit);
			});
		}
	} else if(_self.state == Constants.PAUSED) {
		_self.setState(Constants.RUNNING);
	}
};

Game.prototype.pause = function(){
	if(this.state == Constants.RUNNING) {
		this.setState(Constants.PAUSED);
	}
};

Game.prototype.isPaused = function() {
	return (this.state == Constants.PAUSED);
}

Game.prototype.stop = function(switchPage){
	this.setState(Constants.QUIT);
	this.switchPage = switchPage || false;
};

Game.prototype.setState = function(s) {
	this.state = s;
	this.drawmap = true;
	
	if(this.state == Constants.COUNTDOWN) {
		this.setGhostsScaredTime(-1);
		this.countDownTicks = this.ticks;
		if(this.firstCountDown) {
			this.countDownTime = 4;
			this.firstCountDown = false;
		} else {
			this.countDownTime = 1;
		}

		//reset player
		this.player.resetPosition();

		//reset ghosts
		for(var i in this.ghosts) {
			this.ghosts[i].reset();
		}
		
		//play intro sound
		if(this.getSetting("music") == "original") {
			this.audio.play("original", false, this.getSetting("musicVol"));
		}
	} else if(this.state == Constants.DIED) {
		sirenStopZone();
		/*
		siren.pause();
		siren.currentTime = 0;*/
		// this.audio.stop("snd_scared");
		this.countDownTicks = this.ticks;
	} else if (this.state == Constants.QUIT) {
		this.player.reset();
		//reset ghosts
		for(var i in this.ghosts) {
			this.ghosts[i].reset();
		}
		this.map.reset();
		//if(this.onQuitHandler) this.onQuitHandler();
	}

	if(this.onStateChangeHandler) {
		this.onStateChangeHandler(s);
	}
};

Game.prototype.onStateChange = function(h){
	this.onStateChangeHandler = h;
};

Game.prototype.getAudio = function() {
	//console.log('Game.prototype.getAudio');
	return this.audio;
};

Game.prototype.setAudio = function(a) {
	//console.log('Game.prototype.setAudio', a);

	this.audio = a;
};

Game.prototype.getGraphic = function() {
	return this.graphic;
};

Game.prototype.getMap = function() {
	return this.map;
};


Game.prototype.getState = function(){
	return this.state;
};

Game.prototype.getCanvas = function(){
	return this.canvas;
}

Game.prototype.setCanvas = function(c) {
	this.canvas = c;
}

Game.prototype.getContext = function() {
	return this.ctx;
};

Game.prototype.getFPS = function(){
	return 32 + 3*(this.player.getLevel()-1);
};

//get movement speed in pixels per frame
Game.prototype.getSpeed = function(){
	return this.graphic.getGridSize() / 8;
};

Game.prototype.getTicks = function() {
	return this.ticks;
};

Game.prototype.getGhosts = function() {
	return this.ghosts;
};

Game.prototype.getFruit = function() {
	return this.fruit;
};

Game.prototype.getPlayer = function() {
	return this.player;
};

Game.prototype.isGodModeActive = function() {
	return false;
};


Game.prototype.isDebug = function() {
	return false;
};


Game.prototype.isFreezed = function(){
	return this.freezed;
};

Game.prototype.freeze = function() {
	this.freezed = true;
	this.freezeTime = Math.floor(this.getFPS() - this.getFPS() / 4);
};

Game.prototype.updateFreezCountdown = function() {
	if(this.isFreezed()) {
		this.freezeTime--;
		if(this.freezeTime == 0) this.freezed = false;
	}
};

Game.prototype.saveSettings = function(key, value) {
	localStorage.setItem(key, value);
};

Game.prototype.getSetting = function(key) {
	return localStorage.getItem(key);
};


Game.prototype.onQuit = function(callback) {
	this.onQuitHandler = callback;
};

Game.prototype.getResolution = function() {
	return this.resolution;
};

Game.prototype.getHighscore = function() {
	return this.highscore;
};

Game.prototype.isActive = function() {
	return (this.getState() == Constants.RUNNING || this.getState() == Constants.COUNTDOWN || this.getState() == Constants.PAUSED || this.getState() == Constants.DIED);
};

Game.prototype.destroy = function() {
	this.stop();
	//$(this.canvas).remove();
	//delete this;
};

Game.prototype.nextDirection = function(dir) {
	this.playerNextDir = dir;
};