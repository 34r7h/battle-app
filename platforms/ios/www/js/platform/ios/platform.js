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
		return false;
	},

	isIOS: function() {
		return true;
	},

	isTouchDevice: function() {
		return true == ("ontouchstart" in window || window.DocumentTouch && document instanceof DocumentTouch);
	},
	hasConnection: function() {
		var networkState = navigator.network.connection.type;
		if(networkState == Connection.ETHERNET || Connection.WIFI) return true;
		else return false;
	},

	detectOS: function() {
		return "ios";
	}
}

window.onStart = function(callback) {
	document.addEventListener("deviceready", callback, false);
}