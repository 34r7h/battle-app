var Helper = {
	highscore: {
		getQuartes: function() {
			var month = new Date().getMonth() + 1;
			var quarters = 1;

			if(month >= 4) quarters = 2;
			if(month >= 7) quarters = 3;
			if(month >= 10) quarters = 4;

			return quarters;
		}
	},
	randomInt: function(min, max) {
		return Math.floor(Math.random() * (max - min)) + min;
	}
};
