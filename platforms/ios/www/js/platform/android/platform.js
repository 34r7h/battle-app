var Platform = {
	ANDROID: "android",
	IOS: "ios",
	UNKOWN: "unkown",

	detect: function() {
		if(this.isAndroid()) return this.ANDROID;
		else if(this.isIOS()) return this.IOS;
		else return this.UNKOWN;
	},

	isAndroid: function() {
		return true;
	},

	isIOS: function() {
		return false;
	},

	isTouchDevice: function() {
		return true == ("ontouchstart" in window || window.DocumentTouch && document instanceof DocumentTouch);
	},

	hasConnection: function() {
		var networkState = navigator.connection.type;
		if(networkState == Connection.ETHERNET || Connection.WIFI) return true;
		else return false;
	},

	detectOS: function() {
		return "android";
	}
}

window.onStart = function(callback) {
	document.addEventListener("deviceready", callback, false);
}