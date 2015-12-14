var motion = {
    start: {},
    direction: "",
    threshold: 1,

    initialize: function() {
    	var _self = this;

        motion.reinit();
        navigator.accelerometer.watchAcceleration(function(acceleration){
            //console.log(acceleration);
            var dir = motion.detectDirection(acceleration);
            if(dir != motion.direction) {
                motion.onChangeCallback(dir);
                motion.direction = dir;
            }
        }, function(){
            console.log("accelerometer error!");
        }, {
            frequency: 100
        });
    },

    detectDirection: function(next) {
       var _self = this;

        //start = next;
        var threshold = motion.getThreshold();
        var n =  {};
        n.x = parseFloat(parseFloat(next.x - motion.start.x).toFixed(2));
        n.y = parseFloat(parseFloat(next.y - motion.start.y).toFixed(2));

        if(Math.abs(n.x) > Math.abs(n.y) ) {
            if(n.x + threshold < 0) dir = "right";
            else if(n.x - threshold > 0) dir = "left";
            else {

                if(n.y - threshold > 0) dir = "down";
                else if(n.y + threshold < 0) dir = "up";
                else dir = "";
            }
        } else {

            if(n.y - threshold > 0) dir = "down";
            else if(n.y + threshold < 0) dir = "up";
            else {
                if(n.x + threshold < 0) dir = "right";
                else if(n.x - threshold > 0) dir = "left";
                else dir = "";
            }   
        }

        return dir;

        //if(Math.floor(next.x))
    },

    reinit: function() {
        navigator.accelerometer.getCurrentAcceleration(function(data){
            motion.start = data;
        }, function(){
            console.log("error!");
        }); 
    },

    onChangeCallback: function( ) {

    },

    onChange: function(callback) {
    	this.onChangeCallback = callback;
    },

    getThreshold: function() {
        return this.threshold;
    },

    setThreshold: function(t) {
       this.threshold = parseFloat(t.toFixed("2"));
    }
};