var game, input, command;

var test;
$(document).ready(function(){
	resizeScreen();
	$(window).on("resize",resizeScreen);

	game = new Game();
	game.createDungeon();
	setInterval(function(){game.checkUpdate()},game.dtCheckUpdate);

	input = new Input();
	$(document).keypress(function(e){input.keypress(e);});

	command = new Command();
});
