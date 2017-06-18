var Player = function(){
	this.maxHp = 40;
	this.hp = 40;
	this.attack = 7;
	this.randomPercent = 25;
	this.dead = false;
	this.ailments = [];

	this.fighting = false;
	this.fightxp = 0;
	this.xp = 0;
	this.level = 1;

	this.items = ['Potion','Potion','Antidote'];

	this.floor = 0;
	this.x = 0;
	this.y = 0;
	this.setPosition = function(x,y){
		this.x = x;
		this.y = y;
	};
	this.update = function(game){
		this.updateAilments(game);
		this.checkFighting(game);
	}
	this.checkFighting = function(game){
		var floor = game.dungeon.floors[this.floor];
		var room = floor.rooms[floor.roomExists(this.x,this.y)].room;
		if(!this.fighting){
			if(floor.hasMonsters(this.x,this.y)){
				this.fighting = true;
				game.addMsg('|r*****************');
				game.addMsg('|r'+room.describeEncounter());
				game.addMsg('|r*****************');
			}
		}
		else
		{
			if(!floor.hasMonsters(this.x,this.y)){
				this.fighting = false;
				game.addMsg('|g*** YOU WON ! ***');
				game.addMsg('|g You got a total of '+this.fightxp+' XP.');
				game.addMsg('|g*****************');
				this.fightxp = 0;
				var msgs = floor.describeRoom(this.x,this.y);
				for(var i = 0; i < msgs.length; i++)
				{
					game.addMsg(msgs[i]);
				}
			}
		}
	}
	this.addXp = function(xp){
		this.fightxp += xp;
	}
	this.playerDamage = function(dmg){
		this.hp = Math.max(0,this.hp-dmg);
		return this.hp;
	}
	this.recoverHp = function(hp){
		var prevHp = this.hp;
		this.hp = Math.min(this.maxHp,prevHp+hp);
		return this.hp - prevHp;
	}

	this.hasItem = function(item){
		for(var i = 0; i < this.items.length; i++){
			if(this.items[i].toLowerCase() == item.toLowerCase()) return i;
		}
		return -1;
	}
	this.nbItems = function(item){
		var count = 0;
		for(var i = 0; i < this.items.length; i++){
			if(this.items[i].toLowerCase() == item.toLowerCase()) count++;
		}
		return count;
	}
	this.useItem = function(item){
		if(this.hasItem(item) >= 0){
			this.items.splice(this.hasItem(item),1);
			switch(item){
				case 'potion':
					if(this.hp == this.maxHp){
						this.maxHp += 2;
						this.hp = this.maxHp;
						game.addMsg('|gYou drink a |oPotion|g ('+this.nbItems(item)+' left). Your maximum HP goes up by 2 !');
					}
					else game.addMsg('You drink a |oPotion|w ('+this.nbItems(item)+' left) and recover '+this.recoverHp(20)+' HP. ('+this.hp+'/'+this.maxHp+' HP left)');
				break;
				case 'antidote':
					if(this.hasAilment()){
						this.removeAilment('negative');
						game.addMsg('You drink an |oAntidote|w. You recover from all negative effects.');
					}
					else{
						game.addMsg('You drink an |oAntidote|w, however you had no negative effects.');
						this.addAilment({
							type: 'regenerate',
							hp: 30,
							hpByStep: 5,
							step: 0,
							maxStep: 8,
							positive: true,
						});
					} 

				break;
			}
		};
	}
	this.describeItems = function(){
		var msg = '';
		var items = [];
		var types = {};
		for(var i = 0; i < this.items.length; i++){
			var item = this.items[i];
			if(types[item]){
				types[item].nb++;
			}
			else{
				types[item] = {sing: item, nb: 1};
			}
		}
		for(var key in types)
		{
			var type = types[key];
			if(type.nb == 1){
				items.push(((['a','e','i','o','u'].indexOf(type.sing[0].toLowerCase()) != -1) ? 'an ': 'a ')+'|o'+type.sing+'|w');
			}
			else items.push(type.nb+' |o'+type.sing+'|ws');
		}
		for(var i = 0; i < items.length; i++){
			if(i == 0) msg += ' ';
			if(i > 0 && i < items.length-1) msg += ', ';
			if(i > 0 && i == items.length-1) msg += ' and ';
			msg += items[i];
		}
		return msg;
	}

	this.updateAilments = function(game){
		for(var i = 0; i < this.ailments.length; i++){
			var a = this.ailments[i];
			switch(a.type){
				case 'regenerate':
					a.step += game.dt*0.001;
					if(a.step >= a.maxStep){
						a.step -= a.maxStep;
						var recover = Math.min(a.hp,a.hpByStep);
						recover = this.recoverHp(recover);
						game.addMsg('|gYou recover '+recover+' HP due to regeneration. ('+this.hp+'/'+this.maxHp+' HP left)');
						a.hp -= a.hpByStep;
						if(a.hp <= 0){
							this.removeAilment('regenerate');
							game.addMsg('Your health stops regenerating.')
						} 
					}
				break;
				case 'poison':
					a.step += game.dt*0.001;
					if(a.step >= a.maxStep){
						a.step -= a.maxStep;
						var damage = Math.min(a.hp,a.hpByStep);
						this.playerDamage(damage);
						game.addMsg('|fYou lose '+damage+' HP due to poison. ('+this.hp+'/'+this.maxHp+' HP left)');
						a.hp -= a.hpByStep;
						if(a.hp <= 0){
							this.removeAilment('poison');
							game.addMsg('You are no more poisoned.')
						} 
					}
				break;
			}
		}
	}
	this.addAilment = function(elt,overwrite){
		var type = elt.type;
		for(var i = 0; i < this.ailments.length; i++){
			var a = this.ailments[i];
			//If player is already affected by this ailment
			if(a.type == type){
				switch(type){
					case 'paralysis':
						if(overwrite) this.ailments[i].characters = elt.characters;
						else{
							this.ailments[i].characters = Math.max(this.ailments[i].characters,elt.characters);
							game.addMsg('|fYou are paralysed ! Type '+this.ailments[i].characters+' characters to recover.');
						}
					break;
					case 'regenerate':
						if(overwrite) this.ailments[i] = elt;
						else{
							this.ailments[i].hp = this.ailments[i].hp + elt.hp;
							this.ailments[i].maxStep = Math.min(this.ailments[i].maxStep,elt.maxStep);
							this.ailments[i].hpByStep = Math.max(this.ailments[i].hpByStep,elt.hpByStep);
							game.addMsg('|gYour health regenerates even more.');
						}
					break;
					case 'poison':
						if(overwrite) this.ailments[i] = elt;
						else{
							this.ailments[i].hp = Math.max(this.ailments[i].hp,elt.hp);
							this.ailments[i].maxStep = elt.maxStep;
							this.ailments[i].hpByStep = elt.hpByStep;
							game.addMsg('|fThe poison\'s effect increased.');
						}
					break;
				}
				return false;
			}
		}
		switch(type){
			case 'paralysis':
				game.addMsg('|fYou are paralysed ! Type '+elt.characters+' characters to recover.');
			break;
			case 'poison':
				game.addMsg('|fYou are poisoned !');
			break;
			case 'regenerate':
				game.addMsg('|gYour health starts to regenerate.');
			break;
		}
		this.ailments.push(elt);
	}
	this.removeAilment = function(type){
		if(!type) this.ailments = []; 
		else if(type == 'negative'){
			for(var i = this.ailments.length-1; i >= 0; i--){
				if(!this.ailments[i].positive) this.ailments.splice(i,1);
			}
			return true;
		}
		for(var i = 0; i < this.ailments.length; i++){
			if(this.ailments[i].type == type){
				this.ailments.splice(i,1);
				return true;
			} 
		}
	}
	this.hasAilment = function(type){
		for(var i = 0; i < this.ailments.length; i++){
			if(!type && !this.ailments[i].positive) return this.ailments[i];
			if(this.ailments[i].type == type) return this.ailments[i];
		}
		return false;
	}
	this.die = function(){
		this.dead = true;
	}

	this.initMsg = function(){
		game.addMsg('Welcome to |yKeyboard Dungeon|w !');
		game.addMsg('Can you get to the last floor and retrieve the |yAmulet of Yendor|w?');
		game.addMsg('|i----------------');
		game.addMsg("You start with "+this.hp+' HP, '+this.describeItems()+'.');
		game.addMsg("Type |cuse |o&lt;item name&gt;|w to use one of these.");
		game.addMsg('|i----------------');
		game.addMsg("You have a |oSword|w, granting "+this.attack+" attack points.");
		game.addMsg("Type |cattack |o&lt;target name&gt;|w to use it.");
		game.addMsg('|i----------------');
		game.addMsg('');
		game.addMsg("You are standing near the dungeon's entrance.");
		var f = game.dungeon.floors[this.floor];
		var msgs = f.describeRoom(this.x,this.y);
		for(var i = 0; i < msgs.length; i++)
		{
			game.addMsg(msgs[i]);
		}
	}
};

var Command = function(){
	this.dictionary = ['attack','walk','hp','xp','use'];

	this.checkPlayerCommand = function(cmd,game){
		var ret = {};
		var p = game.player;
		if(p.hasAilment('paralysis')){
			ret.cancel = true;
			var chars = p.hasAilment('paralysis').characters;
			chars = chars-cmd.length;
			if(chars > 0){
				p.addAilment({
						type: 'paralysis',
						characters: chars
				},true);
				game.addMsg('|fYou are paralysed ! Type '+chars+' more characters to recover.');
			}
			else{
				p.removeAilment('paralysis');
				game.addMsg('You have recovered from paralysis.');
			} 
		}
		else{
			cmd = cmd.toLowerCase().split(' ').filter(function(e){return e !== '';});
			if(this.dictionary.indexOf(cmd[0]) == -1)
			{
				ret.error = 'Invalid command.';
			}
			else
			{
				ret.command = cmd[0];
				switch (cmd[0])
				{
					case 'use':
						if(cmd[2]) ret.error = 'Invalid command.';
						else {
							if(p.hasItem(cmd[1]) >= 0) ret.target = cmd[1];
							else ret.error = 'You do not have a '+cmd[1]+'.';
						} 
					break;
					case 'attack':
						var floor = game.dungeon.floors[p.floor];
						var room = floor.rooms[floor.roomExists(p.x,p.y)].room;
						if(cmd[1])
						{
							var target = room.resolveMonsterName(cmd[1]);
							if(target !== false)
							{
								ret.target = target;
							}
							else ret.error = 'Invalid target.';
						}
						else ret.error = 'You must specify a target to attack.';
						if(cmd[2]) ret.error = 'Invalid command.';
					break;
					case 'walk':
						var locations = game.dungeon.floors[p.floor].getDirections(p.x,p.y);
						if(locations.indexOf(cmd[1]) == -1)
						{
							ret.error = (['forward','left','right'].indexOf(cmd[1]) == -1) ? 'Invalid location. ' : 'A wall blocks your way. ';
							if(locations.length == 1) ret.error += 'You may |cwalk '+locations[0]+'|r.';
							if(locations.length == 2) ret.error += 'You may |cwalk '+locations[0]+'|r or |cwalk '+locations[1]+'|r.';
							if(locations.length == 3) ret.error += 'You may |cwalk '+locations[0]+'|r, |cwalk '+locations[1]+'|r or |cwalk '+locations[2]+'|r.';
						}
						if(game.dungeon.floors[p.floor].hasMonsters(p.x,p.y)) ret.error = 'You cannot leave a room during a fight.';
						if(cmd[2]) ret.error = 'Invalid command.';
						if(!ret.error) ret.location = cmd[1];
					break;
				}
			}
		}
		return ret;
	};

	this.executePlayerCommand = function(cmd,game){
		var p = game.player;
		switch (cmd.command)
		{
			case 'use':
				p.useItem(cmd.target);
			break;
			case 'attack':
				var floor = game.dungeon.floors[p.floor];
				var room = floor.rooms[floor.roomExists(p.x,p.y)].room;
				var monster = room.monsters[cmd.target];
				var damage = Math.round(p.attack*(1+p.randomPercent*0.01*(2*game.random()-1)));
				game.addMsg('You hit |o'+monster.name+'|w for '+damage+' damage.');
				snd.play('Sword1');
				var result = room.monsterDamage(cmd.target,damage);
				if(result){
					game.addMsg('|gYou killed |o'+monster.name+'|g !');
					snd.play('Annihilation1');
					p.addXp(monster.xp);
				} 
			break;
			case 'walk':
				var f = game.dungeon.floors[p.floor];
				var x = p.x;
				var y = p.y;
				if(cmd.location == 'forward') x++;
				if(cmd.location == 'right') y++;
				if(cmd.location == 'left') y--;
				var idroom = f.roomExists(x,y);
				if(idroom !== false)
				{
					if(!f.hasMonsters(p.x,p.y))
					{
						game.player.setPosition(x,y);
						game.addMsg('You walk '+cmd.location+' to the next room.'+(f.rooms[idroom].room.chest ? ' There is a chest.' : ''));
						snd.play('Movement');
						var msgs = f.describeRoom(x,y);
						for(var i = 0; i < msgs.length; i++)
						{
							game.addMsg(msgs[i]);
						}
					}
					
				} 
			break;
		}

	};

};
