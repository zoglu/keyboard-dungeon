var Game = function(){
	this.random = new Math.seedrandom();

	this.msglist = [];
	this.commands = [];

	this.player = new Player();
	this.dungeon;

	this.dt = 10;
	this.dtCheckUpdate = 50;
	this.startTime = Date.now();
	this.pauseTime = 0;
	this.currentTime = 0;

	this.createDungeon = function(){
		this.dungeon = new Dungeon(6);
		this.player.initMsg();
	}


	this.addMsg = function(msg){
		if(!(msg instanceof Message))
		{
			var msgstr = msg.toString();
			msg = new Message(msgstr,'');
		}
		this.msglist.push(msg);
	};


	this.checkUpdate = function(){
		var newTime = Date.now() - this.startTime;
		while(newTime - this.currentTime - this.pauseTime > this.dt){
			if(this.isPaused()){
				this.pauseTime += this.dt;
			}
			else {
				if(this.player.hp > 0) this.update();
				this.currentTime += this.dt;
				if(this.player.hp == 0 && !this.player.dead){
					this.player.die();
					this.addMsg('|r*** YOU DIED ***');
				}
			} 
		}
		this.updateMsg();
	}
	this.isPaused = function(){
		return !document.hasFocus();
	}
	this.update = function(){
		//Compute all received commands and run player actions
		for(var i = 0; i < this.commands.length; i++){
			this.addMsg('|i>'+this.commands[i]);
			cmd = command.checkPlayerCommand(this.commands[i],this);
			if(cmd.error){
				this.addMsg('|r'+cmd.error);
			}
			else if(!cmd.cancel) command.executePlayerCommand(cmd,this);
		}
		this.commands = [];
		//Compute all player status
		this.player.update(this);
		//Compute all monster actions & status
		this.dungeon.update(this);
	};

	this.updateMsg = function(){
		var content = '';
		if(this.isPaused())
		{
			content = '*** GAME PAUSED ***';
		}
		else
		{
			this.msglist.forEach(function(msg){
				content += (content ? '<br/>' : '') + msg.print();
			});
		}
		$("#messages").html(content);
	};
	this.addCommand = function(cmd){
		this.commands.push(cmd);
	}
};
