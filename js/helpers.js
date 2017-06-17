function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

var probabilityList = function(){
	this.list = [];
	this.addElement = function(elts,p){
		if(!Array.isArray(elts)) elts = [elts];
		for(var i = 0; i < elts.length; i++){
			this.list.push({p: p, elt: elts[i]});
		}
	}
	this.probabilitySum = function(){
		var sum = 0;
		for(var i = 0; i < this.list.length; i++){
			sum += this.list[i].p;
		}
		return sum;
	}
	this.pickElement = function(r){
		if(!r) r = Math;
		var position = this.probabilitySum()*r.random();
		for(var i = 0; i < this.list.length; i++){
			position -= this.list[i].p;
			if(position < 0) return this.list[i].elt;
		}
		return false;
	}
	this.subtractProbability = function(elt,p){
		for(var i = 0; i < this.list.length; i++){
			if(this.list[i].elt == elt) this.list[i].p -= Math.min(p,this.list[i].p);
		}
	}
	this.reset = function(){
		this.list = [];
	}
}
