var Highscore = function() {
	this.lastScore = 0;
	this.uid = "";
	this.rid = "";
	this.lastHighscore = {};
	this.version = 2;
}
Highscore.prototype.ping = function(callback) {
	var _self = this;
	_self.lastHighscore = {};
	$.ajax({
		type: "GET",
		url: Constants.HIGHSCORE_URL + "/ping",
		success: function(data){			
			_self.uid = data.uid;
			_self.rid = data.rid;
			callback();
		},
		error: function(){
			throw("Unabled to connect to highscore server!");
		}
	});
}

Highscore.prototype.pong = function (score, callback) {
	var _self = this;

	$.ajax({
		type: "POST",
		url: Constants.HIGHSCORE_URL + "/pong",
		data: {
			"uid": _self.uid,
			"rid": _self.rid,
			"score": score
		},
		success: function(data){
			if(data.rid) {
				_self.rid = data.rid;
				callback();
			} else {
				throw("Invalid request!");
			}
		},
		error: function(){
			throw("Unabled to connect to highscore server!");
		}
	});
};

Highscore.prototype.save = function(name, score, callback) {
	var _self = this;
	$.ajax({
		type: "POST",
		url: Constants.HIGHSCORE_URL + "/save",
		data :{
			"uid": _self.uid,
			"rid": _self.rid,
			"score": score,
			"name": name,
			"version": _self.version
		},
		success: function(data) {
			_self.clear();
			if(callback) callback();
		},
		error: function(data) {
			_self.clear();
			if(callback) callback(true);
		}
	});
}



Highscore.prototype.check = function(score, total, callback) {
	var _self = this;

	$.ajax({
		type: "POST",
		url: Constants.HIGHSCORE_URL + "/check",
		data :{
			"uid": _self.uid,
			"rid": _self.rid,
			"score": score,
			"total": total,
			"version": _self.version
		},
		success: function(data) {
			_self.lastHighscore = data;
			_self.rid = data.rid;
			if(callback) callback(data);
		},
		error: function(){
			throw("Unabled to connect to highscore server!");
		}
	});
}

Highscore.prototype.getSummary = function(version, callback) {
	var _self = this;
	$('#loading_overlay').show();
	$.ajax({
		type: "GET",
		url: Constants.HIGHSCORE_URL + "/" + version + "/summary",
		success: function(data) {
			$('#loading_overlay').hide();
			if(callback) callback(data);
		},
		error: function(xhr){
			throw("Unabled to connect to highscore server! " + xhr.responseText);
		}
	});
}

Highscore.prototype.getList = function(version, year, quarter, callback) {
	var _self = this;
	$('#loading_overlay').show();
	$.ajax({
		type: "GET",
		url: Constants.HIGHSCORE_URL + "/" + version + "/list/" + year + "/" + quarter,
		success: function(data) {
			$('#loading_overlay').hide();
			if(callback) callback(data);
		},
		error: function(xhr){
			throw("Unabled to connect to highscore server! " + xhr.responseText);
		}
	});
}

Highscore.prototype.getBestEver = function(version, callback) {
	var _self = this;
	$('#loading_overlay').show();
	$.ajax({
		type: "GET",
		url: Constants.HIGHSCORE_URL + "/" + version + "/bestever",
		success: function(data) {
			$('#loading_overlay').hide();
			if(callback) callback(data);
		},
		error: function(xhr){
			throw("Unabled to connect to highscore server! " + xhr.responseText);
		}
	});
}

Highscore.prototype.clear = function() {
	var _self = this;
	this.lastHighscore = {};
}

Highscore.prototype.getScore = function() {
	return this.lastHighscore.score;
}

Highscore.prototype.getScorePosition = function() {
	return this.lastHighscore.position;
}