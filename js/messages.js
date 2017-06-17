var Message = function(source,type){
	this.source = source;
	this.type = type;
	this.print = function(){
		var ret = '<span style="color:white">';
		var rem = source;
		while(rem)
		{
			if(rem.substring(0,1) == '|')
			{
				var col = 'white';
				switch(rem.substring(1,2))
				{
					case 'r': col = 'red'; break;
					case 'o': col = 'orange'; break;
					case 'y': col = 'yellow'; break;
					case 'g': col = 'lime'; break;
					case 'c': col = 'cyan'; break;
					case 'b': col = 'blue'; break;
					case 'f': col = 'fuchsia'; break;
					case 'i': col = 'grey'; break;
				}
				rem = rem.substr(2);
				ret += '</span><span style="color:'+col+'">';
			}
			else
			{
				ret += rem.substring(0,1);
				rem = rem.substr(1);
			}
		}
		ret += '</span>';
		return ret;
	}
}

var Input = function()
{
	this.content = '';
	this.maxlength = 20;
	this.update = function(){
		$("#input").html(">"+this.content);
	}
	this.update();
	this.keypress = function(e){
		var s = String.fromCharCode(e.which);
		const chars = 'abcdefghijklmnopqrstuvwxyz0123456789 ABCDEFGHIJKLMNOPQRSTUWVXYZ';
		if(chars.indexOf(s) != -1)
		{
			this.content = (this.content+s).substring(0,this.maxlength);
		}
		else
		{
			if(e.which == 8) //Backspace
			{
				this.content = this.content.substring(0,this.content.length-1);
			}
			if(e.which == 13) //Enter
			{
				game.addCommand(this.content);
				this.content = '';
			}
		} 
		this.update();
	}
}



