function resizeScreen()
{
	const FONT_WIDTH = 20, FONT_HEIGHT = 21;
	const NB_LINES = 36, NB_COLS = 67;
	const INITIAL_WIDTH = NB_COLS * FONT_WIDTH, INITIAL_HEIGHT = NB_LINES * FONT_HEIGHT;
	const INITIAL_RATIO = INITIAL_WIDTH/INITIAL_HEIGHT;
	const NB_LINES_BOTTOM = 1;
	var ratio = $("body").width()/$("body").height();
	if(ratio > INITIAL_RATIO) //La page est trop longue
	{
		$("#screen").height($("body").height());
		$('#screen').width($("body").height()*INITIAL_RATIO);
	}
	else //La page est trop haute
	{
		$("#screen").width($("body").width());
		$('#screen').height($("body").width()/INITIAL_RATIO);
	}
	var fontWidth = $("#screen").width()/NB_COLS;
	$("#screen").css("font-size",fontWidth+"px");
	$("#messages").css("bottom",Math.floor(NB_LINES_BOTTOM*fontWidth*FONT_HEIGHT/FONT_WIDTH)+"px");
}