var monsterList =
{
	default:
	{
		/* BASE STATS*/
		maxHp: 10,
		attack: 4,
		attackVar: 25,
		xp: 3,
		/*Mutators*/
		rndHp: 20,
		rndAttack: 20,
		/*Initial percentage multiplier for 1st move's cast*/
		minInitialCast: 25,
		maxInitialCast: 50,
		moveset: 
		{
			attack: 
			{
				minCast: 6,
				maxCast: 8,
			}
		},
		decision: function(game){
			var keys = [];
			for(var key in this.moveset){
				keys.push(key);
			}
			this.nextMove = keys[Math.floor(game.random()*keys.length)]
		},
		action: function(game){
			return false;
		}
	},
	slime:
	{
		maxHp : 11,
		attack : 3.5,
		xp: 3,
	},
	rat:
	{
		maxHp : 7,
		attack : 5.5,
		xp: 3,
	},
	bat:
	{
		maxHp : 8,
		attack : 3.5,
		xp: 4,
		moveset: 
		{
			attack: 
			{
				minCast: 6,
				maxCast: 8,
			},
			paralysis: 
			{
				minCast: 6,
				maxCast: 8,
			}
		},
		action: function(game){
			var p = game.player;
			switch(this.nextMove)
			{
				case 'paralysis':
					game.addMsg('|o'+this.name+'|w emits ultrasounds !');
					p.addAilment({
						type: 'paralysis',
						characters: Math.floor(10+game.random()*10),
					});
				break;
			}
		},
		decision: function(game){
			if(this.paralysisLeft > 0)
			{
				var keys = ['attack','paralysis'];
				this.nextMove = keys[Math.floor(game.random()*keys.length)];
				if(this.nextMove == 'paralysis') this.paralysisLeft--;
			}
			else this.nextMove = 'attack';
		},
	},
	snake:
	{
		maxHp : 10,
		attack : 4.5,
		xp: 4,
		moveset: 
		{
			attack: 
			{
				minCast: 5,
				maxCast: 9,
			},
			poison: 
			{
				minCast: 7,
				maxCast: 9,
			}
		},
		action: function(game){
			var p = game.player;
			switch(this.nextMove)
			{
				case 'poison':
					var damage = Math.round(this.attack*(1+this.attackVar*0.01*(2*game.random()-1)));
					var hpleft = p.playerDamage(damage);
					game.addMsg('|o'+this.name+'|w takes a poisonous bite for '+damage+' damage ! ('+hpleft+' HP left)');
					p.addAilment({
						type: 'poison',
						step: 0,
						maxStep: 2,
						hp: 15,
						hpByStep: 2,
					});
				break;
			}
		},
		decision: function(game){
			var keys = ['attack','poison'];
			this.nextMove = keys[Math.floor(game.random()*keys.length)];
		},
	},
}


var Monster = function(type,name){
	if(!name) return false;
	this.name = capitalizeFirstLetter(name);
	this.plural = monsterList[type].plural ? monsterList[type].plural : type+'s';

	if(!type) type = 'default';
	this.type = type;


	this.maxHp = Math.round((monsterList[type].maxHp ? monsterList[type].maxHp : monsterList.default.maxHp) * (1+(2*game.random()-1)*0.01*(monsterList[type].rndHp ? monsterList[type].rndHp : monsterList.default.rndHp)));
	this.hp = this.maxHp
	this.xp = monsterList[type].xp ? monsterList[type].xp : monsterList.default.xp;
	this.attack = Math.round((monsterList[type].attack ? monsterList[type].attack : monsterList.default.attack) * (1+(2*game.random()-1)*0.01*(monsterList[type].rndAttack ? monsterList[type].rndAttack : monsterList.default.rndAttack)));
	this.attackVar = monsterList[type].attackVar ? monsterList[type].attackVar : monsterList.default.attackVar;

	this.cast = 0;
	this.initialCast = Math.round(game.random()*((monsterList[type].maxInitialCast ? monsterList[type].maxInitialCast : monsterList.default.maxInitialCast) - (monsterList[type].minInitialCast ? monsterList[type].minInitialCast : monsterList.default.minInitialCast)) + (monsterList[type].minInitialCast ? monsterList[type].minInitialCast : monsterList.default.minInitialCast));
	this.targetCast = 0;

	this.nextMove = '';
	this.moveset = monsterList[type].moveset ? monsterList[type].moveset : monsterList.default.moveset;
	this.decision = monsterList[type].decision ? monsterList[type].decision : monsterList.default.decision;
	this.action = monsterList[type].action ? monsterList[type].action : monsterList.default.action;
	this.pastMoves = [];

	switch(this.type){
		case 'bat':
			this.paralysisLeft = 2;
		break;
	}

	this.update = function(game){
		var dt = game.dt;
		this.cast += dt*0.001;
		if(this.cast >= this.targetCast){
			if(this.nextMove == 'attack') this.actionAttack(game);
			else this.action(game);
			this.pastMoves.push(this.nextMove);
			this.cast -= this.targetCast;
			this.decision(game);
			this.setTargetCast();
		}
	};
	this.setTargetCast = function(){
		var move = this.moveset[this.nextMove];
		this.targetCast = move.minCast + game.random() * (move.maxCast - move.minCast);
		if(this.initialCast){
			this.cast += this.targetCast*0.01*this.initialCast;
			this.initialCast = 0;
		} 
	}
	this.actionAttack = function(game){
		var p = game.player;
		var damage = Math.round(this.attack*(1+this.attackVar*0.01*(2*game.random()-1)));
		var hpleft = p.playerDamage(damage);
		game.addMsg('|o'+this.name+'|w hits you for '+damage+' damage ! ('+hpleft+' HP left)');
		snd.play('Blow1');
	};
}
