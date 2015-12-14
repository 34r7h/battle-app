var effects = {
	
	fadeIn: function(elem, time) {
		if(elem !== undefined && elem.style !== undefined) {
			function _fadeIn(elem, time, amount) {
				if(amount < 1.0) {
					effects.show(elem);
					elem.style.opacity = "" + amount;
					amount += (1 / (time/ 10));
					
					setTimeout(function(){
						_fadeIn(elem, time, amount);
					}, 10);
				}
			}
			
			_fadeIn(elem, time, 0);
		}
	},
	
	hide: function(elem) {
		if(elem !== undefined && elem.style !== undefined) {
			elem.style.display = "none";
		}
	},
	
	show: function(elem) {
		if(elem !== undefined && elem.style !== undefined) {
			elem.style.display = "block";
		}
	}
}
