//Décrit un donjon : tableau d'étages
var Dungeon = function(n){
	n = parseInt(n);
	if(!n || n < 1) n = 1;

	this.floors = [];
	for(var i = 0; i < n; i++)
	{
		this.floors.push(new Floor(i));
	}
	this.update = function(game){
		var p = game.player;
		var floor = this.floors[p.floor];
		var room = floor.rooms[floor.roomExists(p.x,p.y)].room;
		room.update(game);
	}
}
//Décrit un étage : un objet contenant différentes salles positionnées avec leur contenu
var Floor = function(f){
	this.floor = f;
	this.startX = 0;
	this.startY = 0;
	this.endX = 7;
	this.endY = 0;
	this.rooms = [];

	this.initFloor = function(){
		//Création des salles
		for(var i = this.startX; i <= this.endX; i++){
			var newRoom = new Room();
			var x = i;
			var y = 0;
			this.rooms.push({x:x, y:y, room: newRoom, monsters: false});
		}

		var pList = new probabilityList();
		pList.addElement([
			{type:'slime', maxDistance: 4},
			{type:'rat', maxDistance: 4},
			{type:'snake', minDistance: 3},
			{type:'bat', minDistance: 3},
		],8);
		var maxXpRoom = 1;

		//Déterminer quelles salles auront des monstres, ainsi que le nombre maximal d'XP en valeur par salle.
		var percentMonsters = 80;
		var nbMonsterRooms = Math.round((this.rooms.length-2)*percentMonsters/100);
		for(var i = 0; i < nbMonsterRooms; i++){

			var room;
			do{
				var id = 1+Math.floor(game.random()*(this.rooms.length-2));
				room = this.rooms[id];
			} while(room.monsters == true);
			room.monsters = true;

			//On détermine un nombre de points d'XP maximal pour cette salle puis on place les monstres disponibles
			var thisMaxXp = maxXpRoom*(game.random()*0.4+0.8);
			var pick;
			var distanceRoom = Math.abs(room.x) + Math.abs(room.y);

			var monstersAvailable = true;
			while(monstersAvailable && thisMaxXp > 0 && (pick = pList.pickElement(game)))
			{
				var monstersAvailable = false;
				//On place un monstre s'il est à la bonne distance
				if(((!pick.minDistance) || pick.minDistance <= distanceRoom) && ((!pick.maxDistance) || pick.maxDistance >= distanceRoom)){
					pList.subtractProbability(pick,1);
					var monster = room.room.addMonster(pick.type);
					thisMaxXp -= monster.xp;
				}
				//On regarde s'il est toujours possible de placer un monstre au vu des probas et de la distance
				for(var j = 0; j < pList.list.length; j++)
				{
					var m = pList.list[j];
					if(m.p > 0 && (distanceRoom >= m.elt.minDistance || (!m.elt.minDistance)) && (distanceRoom <= m.elt.maxDistance || (!m.elt.maxDistance)) ){
						monstersAvailable = true;
						break;
					} 
				}
			}
		}

		//Ajout de clés aux salles qui ont des monstres
		var nbKeyRooms = Math.floor(nbMonsterRooms*(0.2+0.3*game.random()));
		var nbKeyRooms = nbMonsterRooms-1;
		for(var i = 0; i < nbKeyRooms; i++){
			var room;
			do{
				var id = 1+Math.floor(game.random()*(this.rooms.length-2));
				room = this.rooms[id];
				roomContents = room.room;
			} while(roomContents.key || !room.monsters);
			roomContents.setKey(true);
		}

		//Ajout d'un coffre aux salles
		var percentChest = 40;
		var chestItems = ['potion','antidote'];
		var nbChestRooms = Math.round((this.rooms.length-2)*percentChest/100);
		for(var i = 0; i < nbChestRooms; i++){
			var room;
			do{
				var id = 1+Math.floor(game.random()*(this.rooms.length-2));
				room = this.rooms[id].room;
			} while(room.chest);
			room.setChest(chestItems[Math.floor(game.random()*chestItems.length)]);
		}



	}
	this.initFloor();
	
	//Renvoie les directions possibles ("forward","left","right") à partir d'une position donnée.
	this.getDirections = function(x,y){
		if(this.roomExists(x,y) !== false)
		{
			var dirs = [];
			if(this.roomExists(x+1,y) !== false) dirs.push("forward");
			if(this.roomExists(x,y-1) !== false) dirs.push("left");
			if(this.roomExists(x,y+1) !== false) dirs.push("right");
			return dirs;
		}
		return [];
	}
	//Dit si la salle de position (x,y) existe et si oui, donne son rang
	this.roomExists = function(x,y){
		for(var i = 0; i < this.rooms.length; i++)
		{
			var room = this.rooms[i];
			if(room.x == x && room.y == y) return i;
		}
		return false;
	}
	this.describeRoom = function(x,y){
		
		var msgs = [];
		if(this.roomExists(x,y) !== false)
		{
			var room = this.rooms[this.roomExists(x,y)].room;

			if(!this.hasMonsters(x,y))
			{
				//Coffre
				if(room.chest)
				{
					if(['potion','antidote'].indexOf(room.chest) != -1) msgs.push('There is a chest on the ground, which seems to contain a flask.');
					else msgs.push('There is a chest on the ground.');
					if(game.player.hasItem('Key')) msgs.push('You have '+game.player.describeItems('Key')+', so you may |copen chest|w.');
				} 

				var locations = this.getDirections(x,y);
				var msg = '';
				if(locations.length == 1) msg = 'You may '+(room.chest ? 'then' : 'now')+' |cwalk '+locations[0]+'|w.';
				if(locations.length == 2) msg = 'You may '+(room.chest ? 'then' : 'now')+' |cwalk '+locations[0]+'|w or |cwalk '+locations[1]+'|w.';
				if(locations.length == 3) msg = 'You may '+(room.chest ? 'then' : 'now')+' |cwalk '+locations[0]+'|w, |cwalk '+locations[1]+'|w or |cwalk '+locations[2]+'|w.';
				if(msg) msgs.push(msg);
			}

			//msgs = ['You may |copen chest|w, |cmove forward|w, |cmove left|w or |cmove right|w.'];
		}
		return msgs;
	}
	this.hasMonsters = function(x,y){
		var i = this.roomExists(x,y);
		if(i === false) return false;
		else return this.rooms[i].room.monsters.length != 0;
	}
}
//Décrit une salle et son contenu : monstres, coffres etc.
var Room = function(){
	this.chest = false;
	this.key = false;
	this.monsters = []; //Tableau de monstres
	this.monstersNames = []; //Noms déjà choisis pour les monstres

	//Ajoute un monstre à la salle.
	this.addMonster = function(type)
	{
		if(!type) return false;
		var name = type;
		//On compte les monstres de ce type déjà présents.
		var letter = 'A';
		for(var i = 0; i < this.monstersNames.length; i++){
			var monster = this.monstersNames[i];
			if(monster.type == type) letter = String.fromCharCode(letter.charCodeAt(0) + 1);
		}
		if(letter != 'A') name = name+letter; //Si la lettre n'est pas A, on l'ajoute au nom du monstre
		if(letter == 'B') //Si la lettre est B, il faut ajouter la lettre A au monstre qui n'en porte pas
		for(var i = 0; i < this.monsters.length; i++){
			var monster = this.monsters[i];
			if(monster.name.toLowerCase() == type) this.monsters[i].name = this.monsters[i].name+'A';
		}
		var monster = new Monster(type,name);
		this.monsters.push(monster);
		this.monstersNames.push({type: type, name:name});
		return monster;
	}

	//Retourne l'indice d'un monstre de la salle étant donné son nom.
	this.resolveMonsterName = function(name){
		for(var i = 0; i < this.monsters.length; i++){
			var monster = this.monsters[i];
			if(monster.name.toLowerCase() == name.toLowerCase()) return i;
		}
		for(var i = 0; i < this.monsters.length; i++){
			var monster = this.monsters[i];
			if(monster.type.toLowerCase() == name.toLowerCase()) return i;
		}
		return false;
	}
	this.monsterDamage = function(i,damage){
		var monster = this.monsters[i];
		monster.hp -= damage;
		if(monster.hp <= 0){
			this.monsters.splice(i,1);
			return true;
		} 
		return false;
	}
	this.describeEncounter = function(){
		var msg = 'You encounter';
		var enemies = [];
		var types = {};
		for(var i = 0; i < this.monsters.length; i++){
			var monster = this.monsters[i];
			if(types[monster.type]){
				types[monster.type].nb++;
			}
			else{
				types[monster.type] = {sing: monster.type, plural: monster.plural, nb: 1};
			}
		}
		for(var key in types)
		{
			var type = types[key];
			if(type.nb == 1){
				enemies.push('a '+type.sing);
			}
			else enemies.push(type.nb+' '+type.plural);
		}
		for(var i = 0; i < enemies.length; i++){
			if(i == 0) msg += ' ';
			if(i > 0 && i < enemies.length-1) msg += ', ';
			if(i > 0 && i == enemies.length-1) msg += ' and ';
			msg += enemies[i];
		}
		msg += ' !';
		return msg;
	}
	this.update = function(game){
		for(var i = 0; i < this.monsters.length; i++){
			var monster = this.monsters[i];
			monster.update(game);
		}
	}
	this.setChest = function(item){
		this.chest = item;
	}
	this.setKey = function(bool){
		this.key = bool;
	}
}