
var swipe = {
	posTouchStart: {},
	posTouchEnd: {},
	swipeDirection: "",
	swipeTolerance: 50.0,
	eventHandlers: [],
	
    initialize: function(node) {
    	this.bindEvents(node);
    },
    
    // Bind Event Listeners
    bindEvents: function(node) {
        node.addEventListener('touchstart', this.eventWrapper('onTouchStart'));
        node.addEventListener('touchend', this.eventWrapper('onTouchEnd'));
        node.addEventListener('touchmove', this.eventWrapper('onTouchMove'));
    },
    
    eventWrapper: function(handler) {
    	if(swipe[handler] !== undefined) {
    		return function(e) { swipe[handler].call(swipe, e); };
    	} else {
    		return function(){};
    	}
    },
    
    onTouchStart: function(event) {
    	event.preventDefault();
    	var x = event.touches[0].pageX;
		var y = event.touches[0].pageY;
		this.posTouchStart = {"x": x, "y": y};
    },
    
    onTouchEnd: function(event) {
        this.posTouchStart = null;
    },
   	onTouchMove: function(event) {
    	var x = event.touches[0].pageX;
		var y = event.touches[0].pageY;
		
		this.posTouchEnd = {"x": x, "y": y};

        if(this._getDistance(this.posTouchStart, this.posTouchEnd) > 10) {
            var p1 = this.posTouchStart;
            var p2 = this.posTouchEnd;
            var xdist = p1.x > p2.x ? p1.x-p2.x : p2.x - p1.x;
            var ydist = p1.y > p2.y ? p1.y-p2.y : p2.y - p1.y;


            if(ydist > xdist) {
                if(this.posTouchStart.y > this.posTouchEnd.y) {
                    this.swipeDirection = "up";
                } else {
                    this.swipeDirection = "down";
                }
            } else if(ydist < xdist) {
                if(this.posTouchStart.x > this.posTouchEnd.x) {
                    this.swipeDirection = "left";
                } else {
                    this.swipeDirection = "right";
                }
            } else {
                this.swipeDirection = "";
            }

            this.posTouchStart = this.posTouchEnd;
            
            //call the event handler
            this.onSwipe();
        }
    },
    
    onSwipe: function(handler) {
    	if(handler !== undefined) {
    		this.eventHandlers.push(handler);
    	} else {
    		for(var i in this.eventHandlers) {
    			handler = this.eventHandlers[i];
    			
	    		if(handler) {
	    			handler(this.swipeDirection);
	    		}
    		}
    	}
    },
    
    _getDistance: function(p1, p2) {
        var xdist = p1.x > p2.x ? p1.x-p2.x : p2.x - p1.x;
        var ydist = p1.y > p2.y ? p1.y-p2.y : p2.y - p1.y;

        if(p1.y == p2.y) return xdist;
        else if(p1.x == p2.x) return ydist;
        else {
            return Math.sqrt(Math.pow(ydist,2) + Math.pow(xdist,2));
        }
    },

    removeHandler: function(handler) {
    	delete this.eventHandlers[handler];
    }
};