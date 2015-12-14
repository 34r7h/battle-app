var Map = function (game) {
    this.height    = null;
    this.width     = null; 
    this.pillSize  = 0;
    this.game = game;
    this.graphic   = this.game.getGraphic();
    this.solidTiles = [ 0, 1, 2, 3, 4, 5, 6, 10, 12, 13, 14, 20, 21, 22, 23, 24, 30, 31, 32, 40, 41, 42, 50, 51, 52, 15, 16, 17];
    this.passableTiles = [90, 91, 92, 99, 97, 93, 94, 95, 96];
    this.arySpecialTiles = [93, 94, 95, 96, 16];
    this.fruitVisible = false;
    this.fruitTimer = 0;
    this.aniTicks = game.getTicks();
    this.aniX = 0;
    this.imgData = null;

    this.mapSrc       = [
                        [ 0,  1,  1,  1,  1,  1,  1,  1,  1, 14,  1,  1,  1,  1,  1,  1,  1,  1,  2],
                        [10, 91, 91, 91, 91, 91, 91, 91, 91, 10, 91, 91, 91, 91, 91, 91, 91, 91, 12],
                        [10, 92, 30, 32, 91, 30, 31, 32, 91, 10, 91, 30, 31, 32, 91, 30, 32, 92, 12],
                        [10, 91, 50, 52, 91, 50, 51, 52, 91, 24, 91, 50, 51, 52, 91, 50, 52, 91, 12],
                        [10, 91, 91, 91, 91, 91, 91, 91, 91, 91, 91, 91, 91, 91, 91, 91, 91, 91, 12],
                        [10, 91,  5,  6, 91, 23, 91,  5,  1, 14,  1,  6, 91, 23, 91,  5,  6, 91, 12],
                        [10, 91, 91, 91, 91, 10, 91, 91, 91, 10, 91, 91, 91, 10, 91, 91, 91, 91, 12],
                        [20,  1,  1,  2, 91,  3,  1,  6, 90, 24, 90,  5,  1,  4, 91,  0,  1,  1, 22],
                        [90, 90, 90, 12, 91, 10, 90, 90, 90, 93, 90, 90, 90, 10, 91, 10, 90, 90, 90],
                        [21, 21, 21, 22, 91, 24, 90,  0, 15, 16, 17,  2, 90, 24, 91, 20, 21, 21, 21],
                        [90, 90, 90, 90, 91, 91, 90, 10, 94, 95, 96, 12, 90, 91, 91, 90, 90, 90, 90],
                        [ 1,  1,  1,  2, 91, 23, 90, 20, 21, 21, 21, 22, 90, 23, 91,  0,  1,  1,  1],
                        [90, 90, 90, 12, 91, 10, 90, 90, 90, 97, 90, 90, 90, 10, 91, 10, 90, 90, 90],
                        [0, 21, 21, 22, 91, 24, 91,  5,  21, 14, 21,  6, 91, 24, 91, 20, 21, 21,  2],
                        [10, 91, 91, 91, 91, 91, 91, 91, 91, 10, 91, 91, 91, 91, 91, 91, 91, 91, 12],
                        [10, 91,  5,  2, 91,  5,  1,  6, 91, 24, 91,  5,  1,  6, 91,  0,  6, 91, 12],
                        [10, 92, 91, 10, 91, 91, 91, 91, 91, 99, 91, 91, 91, 91, 91, 10, 91, 92, 12],
                        [ 3,  6, 91, 24, 91, 23, 91,  5,  1, 14,  1,  6, 91, 23, 91, 24, 91,  5,  4],
                        [10, 91, 91, 91, 91, 10, 91, 91, 91, 10, 91, 91, 91, 10, 91, 91, 91, 91, 12],
                        [10, 91,  5,  1,  1, 13,  1,  6, 91, 24, 91,  5,  1, 13,  1,  1,  6, 91, 12],
                        [10, 91, 91, 91, 91, 91, 91, 91, 91, 91, 91, 91, 91, 91, 91, 91, 91, 91, 12],
                        [20, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 22]
                    ];
    
    this.map = this.cloneMap();

    this.TILES = {
    	PILL: 91,
    	SPECIAL_PILL: 92,
    	BLANK: 90
    };
};

Map.prototype.reset = function() {
    this.map = this.cloneMap();
    //this.game.getFruit().reset();
}

Map.prototype.cloneMap = function() {
    var m = new Array(this.mapSrc[0].length);
    for(var i in this.mapSrc) {
        m[i] = new Array(this.mapSrc[i].length);
        for(var j in this.mapSrc[i]) {
            m[i][j] = this.mapSrc[i][j];
        }
    }

    return m;
};

Map.prototype.isSpecialTile = function(tile) {
    return this.arySpecialTiles.indexOf(tile) != -1;
};

Map.prototype.getSize = function() {
    return {width: this.map[0].length, height: this.map.length};
};

Map.prototype.toMapPos = function(pos) {
    return {x: Math.floor(pos.x / this.graphic.getGridSize()), y: Math.floor(pos.y / this.graphic.getGridSize())};
};

Map.prototype.tileAt = function(pos) {
	return this.map[pos.y][pos.x];
};

Map.prototype.isSolid = function(tile) {
	return this.passableTiles.indexOf(tile) == -1;
};

Map.prototype.getTilePosition = function(tile) {
    var pos = [];
    for (var i in this.map) {
	    for (var j in this.map[i]) {
            if (this.map[i][j] === tile) {
            	pos.push({"x": (j*this.graphic.getGridSize()), "y": (i*this.graphic.getGridSize())});
            }
        }
    }
    
    if(pos.length == 1) return pos[0];
    else return pos;
};

Map.prototype.getTileCount = function(tile){
	var count = 0;
	for(var i in this.map) {
		for(var j in this.map[i]) {
			if(this.map[i][j] == tile) {
				count++;
			}
		}
	}
	
	return count;
}

Map.prototype.setTile = function(pos, tile) {
    this.map[pos.y][pos.x] = tile;
};

Map.prototype.drawTile = function(pos, tile){
	var tileX = tile  % 10;
	var tileY = Math.floor(tile / 10);
    //ctx.lineTo(pos.x+this.graphic.getGridSize(),pos.y+this.graphic.getGridSize());

	this.graphic.draw("tileset", pos.x, pos.y, tileX * this.graphic.getGridSize(), tileY * this.graphic.getGridSize());
}

Map.prototype.draw = function() {
    if(this.imgData == null) {
        for (var i in this.map) {
    	    for (var j in this.map[i]) {
    	       	if(this.map[i][j] == 92) {
                    //this.graphic.draw("energizer", j * this.graphic.getGridSize(), i * this.graphic.getGridSize(), this.aniX, 0);
                    this.drawTile({x: j * this.graphic.getGridSize(), y: i * this.graphic.getGridSize()}, 90);
                } else if(this.map[i][j] == 91) {
                    this.drawTile({x: j * this.graphic.getGridSize(), y: i * this.graphic.getGridSize()}, 90);
                } else {
                    this.drawTile({x: j * this.graphic.getGridSize(), y: i * this.graphic.getGridSize()}, this.map[i][j]);
                }
    	    }
        }
        this.imgData = this.game.getContext().getImageData(0,0, 19*this.graphic.getGridSize(), 22*this.graphic.getGridSize());
    } else {
        this.game.getContext().putImageData(this.imgData, 0, 0);
    }
};
