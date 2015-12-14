var RRArray = function(size) {
	this.data = new Array(size);
	this.index = 0;
	this.size = size;
}

RRArray.prototype.add = function(value) {
	this.data[this.index] = value;

	this.index++;
	if(this.index == this.size) this.index = 0;
}

RRArray.prototype.avg = function(){
	var s = 0;
	for(var i =0; i < this.data.length;i++) {
		s += this.data[i];
	}
	return s / this.data.length;
}