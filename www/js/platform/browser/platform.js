var IE = (function () {
    "use strict";

    var ret, isTheBrowser,
        actualVersion,
        jscriptMap, jscriptVersion;

    isTheBrowser = false;
    jscriptMap = {
        "5.5": "5.5",
        "5.6": "6",
        "5.7": "7",
        "5.8": "8",
        "9": "9",
        "10": "10"
    };
    jscriptVersion = new Function("/*@cc_on return @_jscript_version; @*/")();

    if (jscriptVersion !== undefined) {
        isTheBrowser = true;
        actualVersion = jscriptMap[jscriptVersion];
    }

    ret = {
        isTheBrowser: isTheBrowser,
        actualVersion: actualVersion
    };

    return ret;
}());

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
		var ua = navigator.userAgent.toLowerCase();
		return ua.match(/android/i);
	},

	isIOS: function() {
		var ua = navigator.userAgent.toLowerCase();
		return (ua.match(/iPad/i) || ua.match(/iPhone/i));
	},

	isTouchDevice: function() {
		return true == ("ontouchstart" in window || window.DocumentTouch && document instanceof DocumentTouch);
	},

	hasConnection: function() {
		return true;
	},

	detectOS: function() {
		if (navigator.appVersion.indexOf("Win")!=-1) return "Windows";
		else if (navigator.appVersion.indexOf("Mac")!=-1) return "MacOS";
		else if (navigator.appVersion.indexOf("X11")!=-1) return "UNIX";
		else if (navigator.appVersion.indexOf("Linux")!=-1) return "Linux";
		else return "unkown";
	},

	detectBrowser: function() {
		var ua = navigator.userAgent.toLowerCase(); 
		if (ua.indexOf('safari') != -1){ 
			if(ua.indexOf('chrome')  > -1){
				return "chrome";
			} else {
				return "safari";
		   	}
		} else {
			if (!!window.MSStream) return "msie";
			else return "unkown";
		}
	},

	isInternetExplorer: function(){
		return this.detectBrowser() == "msie";
	},

	isSafari: function(){
		return this.detectBrowser() == "safari";
	},
	
	isCanvasSupported: function(){
		var elem = document.createElement('canvas');
		return !!(elem.getContext && elem.getContext('2d'));
	},

	getVersion: function() {
		if(this.isInternetExplorer()) {
			return parseFloat(IE.actualVersion);
		} else {
			return -1;
		}
	}
};

window.onStart = function(callback) {
	$(function(){ callback(); });
}