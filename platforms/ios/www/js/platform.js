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

	/*detect: function() {
		if(this.isAndroid()) return this.ANDROID;
		else if(this.isIOS()) return this.IOS;
		else return this.UNKOWN;
	},*/

	isAndroid: function() {
		var ua = navigator.userAgent;
		return (ua.match(/android/i) !== null);
	},

	isIPhone: function()  {
		var ua = navigator.userAgent;
		return (ua.match(/iphone/i) !== null);
	},

	isIPad: function() {
		//var ua = (!this.isDesktop() !== undefined ? window.device.platform : null) || navigator.userAgent;
		
		var ua = navigator.userAgent;
		return (ua.match(/ipad/i) !== null);
	},

	isIOS: function() {
		return this.isIPad() || this.isIPhone();
	},

	isTouchDevice: function() {
		return true == ("ontouchstart" in window || window.DocumentTouch && document instanceof DocumentTouch);
	},

	hasConnection: function() {
		return (navigator.connection.type !== Connection.NONE);
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
	},

	getMediaPath: function() {
		if(this.isDesktop()) {
			if(document.location.href.indexOf(":82") != -1) {
				return "/";
			} else {
				return document.location.href;
			}
		} else {
			if(this.isAndroid()) {
	            var path = window.location.pathname;
	            path = path.substr( 0, path.length - 10 );
	            return path;
            } else {
            	return "";
            }
		}
	},

	isApp: function() {
		return !(window.cordova === undefined);
	},

	isDesktop: function() {
		return !(this.isAndroid() || this.isIOS());
	},

	getAudioFormat: function(){
		return (Platform.isIOS() || Platform.isAndroid() || Platform.isSafari() || Platform.isInternetExplorer()) ? "mp3" : "ogg";
	},

	getWidth: function() {		
		var width = 0;
		if($(window).width() < 680 || $(window).height() < 900 ) width = 320;
		else width = 640;

		return width;
	}
};

window.onStart = function(callback) {
	if(!Platform.isApp()) {
		$(function(){
			callback();
		});
	} else {
        document.addEventListener('deviceready', function(){
        	setTimeout(function(){
        		callback();
        	}, 500);
        }, false);
	}
}