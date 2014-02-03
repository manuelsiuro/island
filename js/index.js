//https://github.com/flashhawk/spp.js
var _MAP_PIXEL_DIMENSION = 64,
	_PIXEL_UNIT_SIZE = 1, // Power of 2
	_MAP_ROUGHNESS = 8,
	_FOV = 3,
	_MVT = 2,
	_MAP,
	_TILES_MAP,
	viewportCanvas = document.getElementById('viewport'),
	viewportCtx = viewportCanvas.getContext("2d"),
	bufferMapCanvas = document.createElement('canvas'),
	bufferMapContext = bufferMapCanvas.getContext('2d'),
	bufferFovCanvas = document.createElement('canvas'),
	bufferFovContext = bufferFovCanvas.getContext('2d'),
	bufferMovesCanvas = document.createElement('canvas'),
	bufferMovesContext = bufferMovesCanvas.getContext('2d'),
	bufferWoodAxeCanvas = document.createElement('canvas'),
	bufferWoodAxeContext = bufferWoodAxeCanvas.getContext('2d'),
	bufferPlayersCanvas = document.createElement('canvas'),
	bufferPlayersContext = bufferPlayersCanvas.getContext('2d'),
	bufferAttackCanvas = document.createElement('canvas'),
	bufferAttackContext = bufferAttackCanvas.getContext('2d'),
	bufferBuildCanvas = document.createElement('canvas'),
	bufferBuildContext = bufferBuildCanvas.getContext('2d'),
	panelCanvas = document.createElement('canvas'),
	panelContext = panelCanvas.getContext('2d'),
	panelBuildCanvas = document.createElement('canvas'),
	panelBuildContext = panelBuildCanvas.getContext('2d'),
	widgetBuildCanvas = document.createElement('canvas'),
	widgetBuildContext = widgetBuildCanvas.getContext('2d'),
	viewportTileSize = 16,
	viewportRowsCols = 9,
	viewportOffsetRowsCols = viewportRowsCols-1,
	zoomOffset = 4,
	zoomFontOffset = zoomOffset*0.5,
	zoomIconOffset = zoomFontOffset,
	zoom = viewportTileSize*zoomOffset,
	fontSize = 14,
	pannelFontSize = zoomFontOffset * fontSize,
	viewportMap = [],
	viewportCollisionMap = create2DArray(viewportRowsCols, viewportRowsCols),
	viewportFovMap = create2DArray(viewportRowsCols, viewportRowsCols),
	viewportMovesMap = create2DArray(viewportRowsCols, viewportRowsCols),
	viewportWoodAxeMap = create2DArray(viewportRowsCols, viewportRowsCols),
	viewportPlayersMap = create2DArray(viewportRowsCols, viewportRowsCols),
	viewportAttackMap = create2DArray(viewportRowsCols, viewportRowsCols),
	viewportBuildMap = create2DArray(viewportRowsCols, viewportRowsCols),
	_TILE_WATER = 0,
	_TILE_SAND = 1,
	_TILE_GRASS = 2,
	_TILE_GRASS_MEDIUM = 3,
	_TILE_GRASS_HARD = 4,
	_TILE_XXXXX = 5,
	_TILE_EMPTY = 6,
	_TILE_COLOR_WATER = 7,
	_TILE_COLOR_SAND = 8,
	_TILE_COLOR_GRASS = 9,
	_TILE_PLAYER = 10,
	_TILE_MOVES = 11,
	_TILE_SELECTED = 12,
	_TILE_AXE = 13,
	_TILE_ATTACK = 14,
	_TILE_PLAYER_1 = 15,
	_TILE_PANEL = 16,
	_TILE_HOUSE = 18,
	_TILE_HAMMER = 19,
	_TILE_TREE = 20,
	_TILE_TREE_2 = 21,
	_TILE_TREE_3 = 22,
	_TILE_FARM = 23,
	_TILE_SAWMILL = 24,
	_TILE_STONE_QUARRY = 25,
	_TILE_CONFIRM = 26,
	_TILE_CANCEL = 27,
	_TILE_GOLD = 28,
	_TILE_WOOD = 29,
	_TILE_WHEAT = 30,
	_TILE_BRICK = 31,
	rangeWaterStart = 0,
	rangeWaterEnd = 0,
	rangeSandStart = 0,
	rangeSandEnd = 0,
	rangeGrassStart = 0,
	rangeGrassEnd = 0,
	rangeMountainStart = 0,
	rangeMountainEnd = 0,
	rangeRockStart = 0,
	rangeRockEnd = 0,
	rangeSnowStart = 0,
	rangeSnowEnd = 0,
	animation = null,
	fps = 30,
	frame = 0,
	lastUpdateTime = 0,
	acDelta = 0,
	msPerFrame = 1000/fps,
	bFovEnable = true,
	bRedraw = true,
	bUpdate = true,
	bMvtEnable = false,
	bUiEnable = true,
	bPlayerSelected = false,
	bWoodHaxe = false,
	bAttack = false,
	bBuild = false,
	bPannelBuildVisible = false,
	isIpad = navigator.userAgent.match(/iPad/i) != null,
	isIphone = navigator.userAgent.match(/iPhone/i) != null,
	isAndroid = navigator.userAgent.match(/Android/i) != null,
	useTouch = isIpad | isIphone | isAndroid,
	_SCREEN_WIDTH = 320,
	_SCREEN_HEIGHT = 240,
	pathStart = [viewportRowsCols,viewportRowsCols],
	pathEnd = [0,0],
	currentPath = [],
	sprites = [],
	sprites_img = document.createElement("img"),
	_GRID_X = viewportOffsetRowsCols*0.5,
	_GRID_Y = viewportOffsetRowsCols*0.5,
	_BUILD_X = 0,
	_BUILD_Y = 0,
	buttons = [],
	players = [],
	selectedPlayer = 0,
	currentTurnTeam = 0,
	_MAP_OFFSET_X = 0,
	_MAP_OFFSET_Y = 0,
	_PANEL_BUILD_OFFSET_X = 0,
	_PANEL_BUILD_OFFSET_Y = -(viewportRowsCols*zoom),
	_WIDGET_BUILD_OFFSET_X = 0,
	_WIDGET_BUILD_OFFSET_Y = 0,
	tween,
	tweenwidgetBuild, 
	_BUILDING_HOUSE = new Buildings(_TILE_HOUSE),
	_BUILDING_FARM = new Buildings(_TILE_FARM),
	_BUILDING_SAWMILL = new Buildings(_TILE_SAWMILL),
	_BUILDING_STONE_QUARRY = new Buildings(_TILE_STONE_QUARRY),
	buildingsList = [_TILE_HOUSE, _TILE_FARM, _TILE_SAWMILL, _TILE_STONE_QUARRY],
	buildingsObjectList = [_BUILDING_HOUSE, _BUILDING_FARM, _BUILDING_SAWMILL, _BUILDING_STONE_QUARRY],
	widgetBuildIndex = 0;
							  
/* ------------------------------------------------------------------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------------------------------------------------------- */
function resizeGame() {
	
		var gameArea = document.getElementById('viewport');
		var widthToHeight = 2 / 3;
		var newWidth = window.innerWidth;
		var newHeight = window.innerHeight;
		var newWidthToHeight = newWidth / newHeight;
		
		if (newWidthToHeight > widthToHeight) {
			newWidth = newHeight * widthToHeight;
			gameArea.style.height = newHeight + 'px';
			gameArea.style.width = newWidth + 'px';
		} else {
			newHeight = newWidth / widthToHeight;
			gameArea.style.width = newWidth + 'px';
			gameArea.style.height = newHeight + 'px';
		}
		
		gameArea.style.marginTop = (-newHeight / 2) + 'px';
		gameArea.style.marginLeft = (-newWidth / 2) + 'px';
		
		//zoomOffset
		if(newWidth<= 320){
			zoomOffset = 2,
			zoomFontOffset = zoomOffset*0.5,
			pannelFontSize = zoomFontOffset * fontSize,
			zoom = viewportTileSize*zoomOffset;
		}
		
		var gameCanvas = document.getElementById('viewport');
		gameCanvas.width = newWidth;
		gameCanvas.height = newHeight;
	}
	
window.addEventListener('resize', resizeGame, false);
window.addEventListener('orientationchange', resizeGame, false);
		
function init(){
	
	resizeGame();
	
	_SCREEN_WIDTH = viewportCanvas.width,
	_SCREEN_HEIGHT = viewportCanvas.height;
	
	bufferMapCanvas.width = _SCREEN_WIDTH;
	bufferMapCanvas.height = _SCREEN_HEIGHT;
	
	bufferFovCanvas.width = _SCREEN_WIDTH;
	bufferFovCanvas.height = _SCREEN_HEIGHT;
	
	bufferMovesCanvas.width = _SCREEN_WIDTH;
	bufferMovesCanvas.height = _SCREEN_HEIGHT;
	
	panelCanvas.width = _SCREEN_WIDTH;
	panelCanvas.height = _SCREEN_HEIGHT;
	
	bufferWoodAxeCanvas.width = _SCREEN_WIDTH;
	bufferWoodAxeCanvas.height = _SCREEN_HEIGHT;
	
	bufferAttackCanvas.width = _SCREEN_WIDTH;
	bufferAttackCanvas.height = _SCREEN_HEIGHT;
	
	bufferBuildCanvas.width = _SCREEN_WIDTH;
	bufferBuildCanvas.height = _SCREEN_HEIGHT;
	
	bufferPlayersCanvas.width = _SCREEN_WIDTH;
	bufferPlayersCanvas.height = _SCREEN_HEIGHT;
	
	panelBuildCanvas.width = _SCREEN_WIDTH;
	panelBuildCanvas.height = _SCREEN_HEIGHT;
	
	widgetBuildCanvas.width = _SCREEN_WIDTH*buildingsList.length;
	widgetBuildCanvas.height = _SCREEN_HEIGHT;
	
	panelContext.font = '14px silkscreennormal, cursive';
	widgetBuildContext.font = '14px silkscreennormal, cursive';
	
	_BUILDING_HOUSE.name = "HOUSE",
	_BUILDING_HOUSE.description = [
		"HOUSE, Lorem ipsum dolor sit", 
		"consectetur adipisicing elit", 
		"sed do eiusmod tempor incidi", 
		"ut labore et dolore magna al"],
	_BUILDING_HOUSE.cost.or = 4,
	_BUILDING_HOUSE.cost.wood = 4,
	
	_BUILDING_FARM.name = "FARM",
	_BUILDING_FARM.description = [
		"FARM, Lorem ipsum dolor situ", 
		"consectetur adipisicing elit", 
		"sed do eiusmod tempor incidi", 
		"ut labore et dolore magna al"],
	_BUILDING_FARM.cost.or = 8,
	_BUILDING_FARM.cost.wood = 8,
	
	_BUILDING_SAWMILL.name = "SAW MILL",
	_BUILDING_SAWMILL.description = [
		"SAW MILL, Lorem ipsum dolora", 
		"consectetur adipisicing elit", 
		"sed do eiusmod tempor incidi", 
		"ut labore et dolore magna al"],
	_BUILDING_SAWMILL.cost.or = 12,
	_BUILDING_SAWMILL.cost.wood = 20,
	
	_BUILDING_STONE_QUARRY.name = "STONE QUARRY",
	_BUILDING_STONE_QUARRY.description = [
		"STONE QUARRY, Lorem ipsum do", 
		"consectetur adipisicing elit", 
		"sed do eiusmod tempor incidi", 
		"ut labore et dolore magna al"],
	_BUILDING_STONE_QUARRY.cost.or = 22,
	_BUILDING_STONE_QUARRY.cost.wood = 30,
		
	window.scrollTo( 0, 1 );
	
	// On genere le terrain 'terrainGeneration' sur le onload de l'image 'sprites_img'
	sprites_img.src = "img/sprites.png";	
}

function terrainGeneration(){
	

	buttons['move'] = {				
		sprite: makeButton({x:5, y:15, width:1, height:1, icon: _TILE_MOVES}),
		width: 1,
		height: 1,
		position: {
			x: 0,
			y: 9
		},
		action: 'move',
		value: 'move'
	};
	
	buttons['axe'] = {				
		sprite: makeButton({x:5, y:15, width:1, height:1, icon: _TILE_AXE}),
		width: 1,
		height: 1,
		position: {
			x: 1,
			y: 9
		},
		action: 'axe',
		value: 'axe'
	};
	
	buttons['attack'] = {				
		sprite: makeButton({x:5, y:15, width:1, height:1, icon: _TILE_ATTACK}),
		width: 1,
		height: 1,
		position: {
			x: 2,
			y: 9
		},
		action: 'attack',
		value: 'attack'
	};
	
	buttons['build'] = {				
		sprite: makeButton({x:5, y:15, width:1, height:1, icon: _TILE_HAMMER}),
		width: 1,
		height: 1,
		position: {
			x: 3,
			y: 9
		},
		action: 'build',
		value: 'build'
	};
	
	buttons['btn_fov'] = {
		sprite: makeButton({x:5, y:15, width:1, height:1, flip: true}),
		width: 1,
		height: 1,
		position: {
			x: 6,
			y: 9
		},
		action: 'btn_fov',
		value: 'btn_fov'
	};
	
	buttons['btn_left'] = {				
		sprite: makeButton({x:6, y:15, width:1, height:1, flip: true}),
		width: 1,
		height: 1,
		position: {
			x: 7,
			y: 9
		},
		action: 'btn_left',
		value: 'btn_left'
	};
	
	buttons['btn_right'] = {				
		sprite: makeButton({x:6, y:15, width:1, height:1}),
		width: 1,
		height: 1,
		position: {
			x: 8,
			y: 9
		},
		action: 'btn_right',
		value: 'btn_right'
	};
	
	buttons['btn_buy_house'] = {				
		sprite: makeButton({x:5, y:15, width:1, height:1, icon: _TILE_CONFIRM}),
		width: 1,
		height: 1,
		position: {
			x: 7,
			y: 7
		},
		action: 'btn_buy_house',
		value: 'btn_buy_house'
	};
	
	buttons['btn_cancel_house'] = {				
		sprite: makeButton({x:5, y:15, width:1, height:1, icon: _TILE_CANCEL}),
		width: 1,
		height: 1,
		position: {
			x: 1,
			y: 7
		},
		action: 'btn_cancel_house',
		value: 'btn_cancel_house'
	};
	
	buttons['btn_widget_build_left'] = {				
		sprite: makeButton({x:6, y:15, width:1, height:1, flip: true}),
		width: 1,
		height: 1,
		position: {
			x: 1,
			y: 2
		},
		action: 'btn_widget_build_left',
		value: 'btn_widget_build_left'
	};
	
	buttons['btn_widget_build_right'] = {				
		sprite: makeButton({x:6, y:15, width:1, height:1}),
		width: 1,
		height: 1,
		position: {
			x: 7,
			y: 2
		},
		action: 'btn_widget_build_right',
		value: 'btn_widget_build_right'
	};
	
	
	// Add random player
	var team = 0;
	for(var i = 0; i< 6; i++){
		players[i] = new Player(i,team);
		if(team==1)team=-1;
		team++;
	}
	
	// On dessine une seule foi la liste de batiments dispo
	updateBuildWidget();
	
	generateMap();
	
}

function generateMap(){

	_MAP 		= generateTerrainMap(_MAP_PIXEL_DIMENSION, _PIXEL_UNIT_SIZE, _MAP_ROUGHNESS);
	_TILES_MAP 	= convertToTiledMap(_MAP);

	for(var i =0; i< players.length; i++){
		setRandomStartPoint(i);
	}
	
	

	gameLoop();
}

function gameLoop() {
	
	animation 	= window.requestAnimationFrame(gameLoop);
	
	var delta = Date.now() - lastUpdateTime; 
	
	if (acDelta > msPerFrame) { 
		
		acDelta = 0; 
		
		if(bUpdate){
			update();
			bUpdate = false;
		}
		
		TWEEN.update();
		
		redraw();
		
		frame++;
		
		if (frame >= fps) frame = 0; 
	
	} else { 
		acDelta += delta; 
	} 
	
	lastUpdateTime = Date.now();
}

function update(){
	
	// Update viewport data
	viewportMap = getViewportMap(players[selectedPlayer]);
	//updateViewPortCollisionMap();
		
	if(bFovEnable)
		updateViewPortFOV((viewportOffsetRowsCols*0.5), (viewportOffsetRowsCols*0.5));
		
	if(bMvtEnable)
		updateViewPortMoves((viewportOffsetRowsCols*0.5), (viewportOffsetRowsCols*0.5));
		
	if(bWoodHaxe)
		updateViewPortWoodAxe((viewportOffsetRowsCols*0.5), (viewportOffsetRowsCols*0.5));
	
	if(bAttack)
		updateViewPortAttack((viewportOffsetRowsCols*0.5), (viewportOffsetRowsCols*0.5));
		
	if(bBuild)
		updateViewPortBuild((viewportOffsetRowsCols*0.5), (viewportOffsetRowsCols*0.5));
		
	updateViewPortPlayers();
	
	if(bBuild)
		updatePanelBuild();
	
	
		
	// Draw on buffer canvas
	drawBufferCanvasMap();
	
	if(bFovEnable)
		drawBufferFOV();
		
	if(bMvtEnable)
		drawBufferMoves();
		
	if(bWoodHaxe)
		drawBufferWoodAxe();
	
	drawBufferPlayers();
	
	if(bAttack)
		drawBufferAttack();
		
	if(bBuild)
		drawBufferBuild();
	
	drawBufferPanel();
}

function redraw(){
	drawViewPortMap();
}

function drawViewPortMap(){
	
	// MAP
	viewportCtx.clearRect(0, 0, viewportCanvas.height, viewportCanvas.width);

	viewportCtx.drawImage(bufferMapCanvas, _MAP_OFFSET_X, _MAP_OFFSET_Y);
	
	viewportCtx.drawImage(bufferPlayersCanvas, _MAP_OFFSET_X, _MAP_OFFSET_Y);
	
	// Layers
	if(bMvtEnable)
		viewportCtx.drawImage(bufferMovesCanvas,  _MAP_OFFSET_X, _MAP_OFFSET_Y);
		
	if(bWoodHaxe)
		viewportCtx.drawImage(bufferWoodAxeCanvas,  _MAP_OFFSET_X, _MAP_OFFSET_Y);
		
	if(bAttack)
		viewportCtx.drawImage(bufferAttackCanvas,  _MAP_OFFSET_X, _MAP_OFFSET_Y);
	
	if(bBuild)
		viewportCtx.drawImage(bufferBuildCanvas,  _MAP_OFFSET_X, _MAP_OFFSET_Y);
	
	if(bFovEnable)
		viewportCtx.drawImage(bufferFovCanvas,  _MAP_OFFSET_X, _MAP_OFFSET_Y);
	
	// UI --
	if(bUiEnable) {	
		viewportCtx.drawImage(panelCanvas,  _MAP_OFFSET_X, _MAP_OFFSET_Y);
		
		// BUTTON
		if(bPlayerSelected){
			viewportCtx.drawImage(buttons['move'].sprite, 
									buttons['move'].position.x*zoom, 
									buttons['move'].position.y*zoom, 
									buttons['move'].width*zoom, 
									buttons['move'].height*zoom);
									
			viewportCtx.drawImage(buttons['axe'].sprite, 
									buttons['axe'].position.x*zoom, 
									buttons['axe'].position.y*zoom, 
									buttons['axe'].width*zoom, 
									buttons['axe'].height*zoom);
									
			viewportCtx.drawImage(buttons['attack'].sprite, 
									buttons['attack'].position.x*zoom, 
									buttons['attack'].position.y*zoom, 
									buttons['attack'].width*zoom, 
									buttons['attack'].height*zoom);
									
			viewportCtx.drawImage(buttons['build'].sprite, 
									buttons['build'].position.x*zoom, 
									buttons['build'].position.y*zoom, 
									buttons['build'].width*zoom, 
									buttons['build'].height*zoom);
		}
	}
	
	viewportCtx.drawImage(buttons['btn_fov'].sprite, 
							buttons['btn_fov'].position.x*zoom, 
							buttons['btn_fov'].position.y*zoom, 
							buttons['btn_fov'].width*zoom, 
							buttons['btn_fov'].height*zoom);
							
	viewportCtx.drawImage(buttons['btn_right'].sprite, 
							buttons['btn_right'].position.x*zoom, 
							buttons['btn_right'].position.y*zoom, 
							buttons['btn_right'].width*zoom, 
							buttons['btn_right'].height*zoom);
							
	viewportCtx.drawImage(buttons['btn_left'].sprite, 
							buttons['btn_left'].position.x*zoom, 
							buttons['btn_left'].position.y*zoom, 
							buttons['btn_left'].width*zoom, 
							buttons['btn_left'].height*zoom);
	
	viewportCtx.drawImage(panelBuildCanvas,  _PANEL_BUILD_OFFSET_X, _PANEL_BUILD_OFFSET_Y);
	
	if(bPannelBuildVisible)
		viewportCtx.drawImage(widgetBuildCanvas, _WIDGET_BUILD_OFFSET_X, _WIDGET_BUILD_OFFSET_Y);
	
	
	// Collision and Astar
	/*if(viewportCollisionMap != null && currentPath.length > 0 && frame == 0){
		
		var rp = 0;
		var index = parseInt(currentPath[rp][1])+(parseInt(currentPath[rp][0])*parseInt(viewportRowsCols));
		
			currentPlayerIndex = viewportMap[index].index;
	}*/
	
	/*if(viewportCollisionMap != null && currentPath.length > 0 && frame == 1){
		
		var rp = 0;
		pathStart 	= [currentPath[rp][0],currentPath[rp][1]];
		pathEnd 	= [currentPath[currentPath.length-1][0],currentPath[currentPath.length-1][1]];
		
		console.info("");
		console.log(pathStart);
		console.log(pathEnd);
		
		currentPath = [];
		currentPath = findPath(getViewPortCollisionWorld(),pathStart,pathEnd);
		currentPath.shift();

		console.log(currentPath);
		console.info("");
	}*/
}


// https://github.com/sole/tween.js/blob/master/src/Tween.js
function tweenPannelBuild(positionStart, positionEnd, show){

	tween = new TWEEN.Tween( positionStart )
	.to( positionEnd, 1000 )
	.easing( TWEEN.Easing.Exponential.InOut )
	.onUpdate( function () {
		
		_PANEL_BUILD_OFFSET_X = this.x;
		_PANEL_BUILD_OFFSET_Y = this.y;

	} )
	.onComplete ( function () {
		
		if(show)
			bPannelBuildVisible = true;
		else
			widgetBuildIndex = 0;
		
	} )
	.start();
}

function updatePanelBuild(){
	
	console.log("updatePanelBuild widgetBuildIndex:"+widgetBuildIndex);
	
	panelBuildContext.clearRect(0, 0, viewportCanvas.height, viewportCanvas.width);
	
	panelBuildContext.save();
	panelBuildContext.beginPath();
	panelBuildContext.rect(0, 0, (viewportRowsCols*zoom), (viewportRowsCols*zoom));
	panelBuildContext.fillStyle = '#E5C481';
	panelBuildContext.fill();
	panelBuildContext.lineWidth = 1;
	panelBuildContext.strokeStyle = '#B7863C';
	panelBuildContext.stroke();
	panelBuildContext.restore();
	
	//widgetBuildIndex

	if(widgetBuildIndex < buildingsList.length-1){

		panelBuildContext.drawImage(buttons['btn_widget_build_left'].sprite, 
									buttons['btn_widget_build_left'].position.x*zoom, 
									buttons['btn_widget_build_left'].position.y*zoom, 
									buttons['btn_widget_build_left'].width*zoom, 
									buttons['btn_widget_build_left'].height*zoom);
	}


	if(widgetBuildIndex > 0){	
		panelBuildContext.drawImage(buttons['btn_widget_build_right'].sprite, 
									buttons['btn_widget_build_right'].position.x*zoom, 
									buttons['btn_widget_build_right'].position.y*zoom, 
									buttons['btn_widget_build_right'].width*zoom, 
									buttons['btn_widget_build_right'].height*zoom);
	}

	panelBuildContext.drawImage(buttons['btn_cancel_house'].sprite, 
								buttons['btn_cancel_house'].position.x*zoom, 
								buttons['btn_cancel_house'].position.y*zoom, 
								buttons['btn_cancel_house'].width*zoom, 
								buttons['btn_cancel_house'].height*zoom);
								
	panelBuildContext.drawImage(buttons['btn_buy_house'].sprite, 
								buttons['btn_buy_house'].position.x*zoom, 
								buttons['btn_buy_house'].position.y*zoom, 
								buttons['btn_buy_house'].width*zoom, 
								buttons['btn_buy_house'].height*zoom);

}

function updateBuildWidget(){
	
	widgetBuildContext.clearRect(0, 0, viewportCanvas.height, viewportCanvas.width);
	widgetBuildContext.font = pannelFontSize+'px silkscreennormal, cursive';
	widgetBuildContext.fillStyle = 'black';
	
	var startX = 4;
	var startXdescription = 0.5;
	
	var m_canvas = document.createElement('canvas');
			m_canvas.width = viewportTileSize * 5;
			m_canvas.height = viewportTileSize * 1;
			
			var m_context = m_canvas.getContext('2d');
				m_context.drawImage(sprites_img, -10*viewportTileSize, -2*viewportTileSize);
				
			m_canvas = resize(m_canvas, zoomOffset);
	
	for(var i=0; i<buildingsList.length; i++){
		
		// Name
		widgetBuildContext.drawImage(m_canvas, (startX-2)*zoom, 0, 5*zoom, zoom);
		widgetBuildContext.fillText(buildingsObjectList[i].name, (startX-1.2)*zoom, 0.7*zoom);
		
		// Big Icon
		widgetBuildContext.drawImage(sprites[buildingsList[i]], (startX-0.5)*zoom, 1.2*zoom, zoom*2, zoom*2);
		
		// Gold
		widgetBuildContext.drawImage(sprites[_TILE_GOLD], 			(startX-1)*zoom, 3.2*zoom, zoom, zoom);
		widgetBuildContext.fillText(buildingsObjectList[i].cost.or, (startX)*zoom, 3.8*zoom);
		
		// Wood
		widgetBuildContext.drawImage(sprites[_TILE_WOOD], 				(startX+1)*zoom, 3.2*zoom, zoom, zoom);
		widgetBuildContext.fillText(buildingsObjectList[i].cost.wood, 	(startX+2)*zoom, 3.8*zoom);
		
		// Description
		for (var j = 0; j < buildingsObjectList[i].description.length; j++) {				
			widgetBuildContext.fillText(buildingsObjectList[i].description[j], startXdescription*zoom , 5*zoom + (j*(zoom*0.5)));		
		};
		
		startX += viewportRowsCols;
		startXdescription += viewportRowsCols;
	}
}

function tweenWidgetBuild(positionStart, positionEnd){

	tweenwidgetBuild = new TWEEN.Tween( positionStart )
	.to( positionEnd, 500 )
	.easing( TWEEN.Easing.Exponential.InOut )
	.onUpdate( function () {
		
		_WIDGET_BUILD_OFFSET_X = this.x;
		_WIDGET_BUILD_OFFSET_Y = this.y;

	} )
	.start();
}

function drawBufferPlayers(){
	
	bufferPlayersContext.clearRect(0, 0, viewportCanvas.height, viewportCanvas.width);

	for(var i = 0; i < viewportPlayersMap.length; i++){
		for(var j = 0; j < viewportPlayersMap[i].length; j++){
			if(viewportPlayersMap[i][j]==2){
				
				
				for(var p = 0; p < players.length; p++ ){
					if( players[p].map_index == viewportMap[i][j].index ){
						if(players[p].team == 0){
							bufferPlayersContext.drawImage(sprites[_TILE_PLAYER], i*zoom, j*zoom, zoom, zoom);
						} else {
							bufferPlayersContext.drawImage(sprites[_TILE_PLAYER_1], i*zoom, j*zoom, zoom, zoom);
						}
						
					}
				}
				
				
			}
		}
	}
	
	if(bPlayerSelected)
		bufferPlayersContext.drawImage(sprites[_TILE_SELECTED], (viewportOffsetRowsCols*0.5)*zoom, (viewportOffsetRowsCols*0.5)*zoom, zoom, zoom);
}


function drawBufferPanel(){

	var _X = viewportOffsetRowsCols*0.5,
		_Y = viewportOffsetRowsCols*0.5,
		lineHeight 		= 15*zoomFontOffset,
		labelMarginLeft = 15*zoomFontOffset,
		dataMarginLeft 	= 120*zoomFontOffset,
		startline 		= zoom*viewportRowsCols+(45*zoomFontOffset);
		
	var m_canvas = document.createElement('canvas');
		m_canvas.width = viewportTileSize * 3;
		m_canvas.height = viewportTileSize * 1;
		
		var m_context = m_canvas.getContext('2d');
			m_context.drawImage(sprites_img, -10*viewportTileSize, -3*viewportTileSize);
			
		m_canvas = resize(m_canvas, zoomOffset);
	
	panelContext.clearRect(0, 0, panelCanvas.height, panelCanvas.width);
	
	panelContext.drawImage(sprites[_TILE_PANEL], 
		0, // x
		zoom*viewportRowsCols, // y
		zoom*viewportRowsCols, // width
		160 * (zoomOffset*0.5)	// height
		);
		
	panelContext.font = pannelFontSize+'px silkscreennormal, cursive';
	panelContext.fillStyle = 'black';
	
	// Line 1
	panelContext.drawImage(sprites[_TILE_GOLD], 0.5*zoom, 10*zoom, zoom, zoom);
	panelContext.fillText(players[selectedPlayer].or, 1.5*zoom, 10.6*zoom);
	
	panelContext.drawImage(sprites[_TILE_WOOD], 3*zoom, 10*zoom, zoom, zoom);
	panelContext.fillText(players[selectedPlayer].wood, 4*zoom, 10.6*zoom);
	
	panelContext.drawImage(sprites[_TILE_BRICK], 5.5*zoom, 10*zoom, zoom, zoom);
	panelContext.fillText(players[selectedPlayer].brick, 6.5*zoom, 10.6*zoom);
	
	// Line 2
	panelContext.drawImage(sprites[_TILE_WHEAT], 0.5*zoom, 11*zoom, zoom, zoom);
	panelContext.fillText(players[selectedPlayer].wheat, 1.5*zoom, 11.6*zoom);
	
	//Life bar
	panelContext.drawImage(m_canvas, 0.25*zoom, 0.25*zoom, 3*zoom, zoom);
	
	// Line 3
	panelContext.drawImage(sprites[_TILE_MOVES], 0.5*zoom, 12*zoom, zoom, zoom);
	panelContext.fillText(players[selectedPlayer].currentmoves + "/" + players[selectedPlayer].moves, 1.5*zoom, 12.6*zoom);
	
	// XP Bar
	panelContext.drawImage(m_canvas, 5.75*zoom, 0.25*zoom, 3*zoom, zoom);
	
	/*panelContext.fillText("TILEMAP", labelMarginLeft, startline);
	panelContext.fillText(getTileName(viewportMap[_X][_Y].type), dataMarginLeft, startline);
	startline += lineHeight;*/
	
	/*panelContext.fillText("Population", labelMarginLeft, startline);
	panelContext.fillText(viewportMap[_X][_Y].population, dataMarginLeft, startline);
	startline += lineHeight;*/
	
	/*panelContext.fillText("Life", labelMarginLeft, startline);
	panelContext.fillText(players[selectedPlayer].life, dataMarginLeft, startline);
	startline += lineHeight;
	
	panelContext.fillText("XP", labelMarginLeft, startline);
	panelContext.fillText(players[selectedPlayer].xp, dataMarginLeft, startline);
	startline += lineHeight;
	
	panelContext.fillText("FOV Attack", labelMarginLeft, startline);
	panelContext.fillText(players[selectedPlayer].range_attack, dataMarginLeft, startline);
	startline += lineHeight;
	
	panelContext.fillText("Moves", labelMarginLeft, startline);
	panelContext.fillText(players[selectedPlayer].currentmoves + "/" + players[selectedPlayer].moves, dataMarginLeft, startline);
	startline += lineHeight;
	
	panelContext.fillText("Wood", labelMarginLeft, startline);
	panelContext.fillText(players[selectedPlayer].wood, dataMarginLeft, startline);
	startline += lineHeight;
	
	panelContext.fillText("Gold", labelMarginLeft, startline);
	panelContext.fillText(players[selectedPlayer].or, dataMarginLeft, startline);
	startline += lineHeight;*/
	
	/*panelContext.fillText("Rock", labelMarginLeft, startline);
	panelContext.fillText(players[selectedPlayer].rock, dataMarginLeft, startline);
	startline += lineHeight;
	
	panelContext.fillText("Cuivre", labelMarginLeft, startline);
	panelContext.fillText(players[selectedPlayer].cuivre, dataMarginLeft, startline);
	startline += lineHeight;
	
	panelContext.fillText("Fer", labelMarginLeft, startline);
	panelContext.fillText(players[selectedPlayer].fer, dataMarginLeft, startline);
	startline += lineHeight;
	
	panelContext.fillText("Or", labelMarginLeft, startline);
	panelContext.fillText(players[selectedPlayer].or, dataMarginLeft, startline);
	startline += lineHeight;*/
	
	/*panelContext.fillText("Grid", labelMarginLeft, startline);
	panelContext.fillText(_GRID_X + ',' + _GRID_Y, dataMarginLeft, startline);
	startline += lineHeight;*/
}



function drawBufferWoodAxe(){
	
	if(bWoodHaxe && viewportWoodAxeMap != null){
		
		bufferWoodAxeContext.clearRect(0, 0, viewportCanvas.height, viewportCanvas.width);
		
		for(var i = 0; i < viewportWoodAxeMap.length; i++){
			for(var j = 0; j < viewportWoodAxeMap[i].length; j++){
				if(viewportWoodAxeMap[i][j]==2){
					bufferWoodAxeContext.drawImage(sprites[_TILE_AXE], (i*zoom)+(zoom*0.25), (j*zoom)+(zoom*0.25), viewportTileSize*(zoomOffset*0.5), viewportTileSize*(zoomOffset*0.5));
				}
			}
		}
	}
}

function drawBufferMoves(){
	// Mouvements
	if(bMvtEnable && viewportMovesMap != null){
		
		bufferMovesContext.clearRect(0, 0, viewportCanvas.height, viewportCanvas.width);
		
		for(var i = 0; i < viewportMovesMap.length; i++){
			for(var j = 0; j < viewportMovesMap[i].length; j++){
				if(viewportMovesMap[i][j]==2){
					bufferMovesContext.drawImage(sprites[_TILE_MOVES], (i*zoom)+(zoom*0.25), (j*zoom)+(zoom*0.25), viewportTileSize*(zoomOffset*0.5), viewportTileSize*(zoomOffset*0.5));
				}
			}
		}
	}
}

function drawBufferAttack(){
	
	if(bAttack && viewportAttackMap != null){
	
		bufferAttackContext.clearRect(0, 0, viewportCanvas.height, viewportCanvas.width);
	
		for(var i = 0; i < viewportAttackMap.length; i++){
			for(var j = 0; j < viewportAttackMap[i].length; j++){
				if(viewportAttackMap[i][j]==2){
					bufferAttackContext.drawImage(sprites[_TILE_ATTACK], (i*zoom)+(zoom*0.25), (j*zoom)+(zoom*0.25), viewportTileSize*(zoomOffset*0.5), viewportTileSize*(zoomOffset*0.5));
				}
			}
		}
	}
}

function drawBufferBuild(){
	
	if(bBuild && viewportBuildMap != null){
		bufferBuildContext.clearRect(0, 0, viewportCanvas.height, viewportCanvas.width);
		
		for(var i = 0; i < viewportBuildMap.length; i++){
			for(var j = 0; j < viewportBuildMap[i].length; j++){
				if(viewportBuildMap[i][j]==2){
					bufferBuildContext.drawImage(sprites[_TILE_HAMMER], (i*zoom)+(zoom*0.25), (j*zoom)+(zoom*0.25), viewportTileSize*(zoomOffset*0.5), viewportTileSize*(zoomOffset*0.5));
				}
			}
		}
		
	}
	
}

function drawBufferFOV(){
	// FOV Shadow
	if(bFovEnable && viewportFovMap != null){
		
		bufferFovContext.clearRect(0, 0, viewportCanvas.height, viewportCanvas.width);
		
		for(var i = 0; i < viewportFovMap.length; i++){
			for(var j = 0; j < viewportFovMap[i].length; j++){
				if(viewportFovMap[i][j]!=2){
					bufferFovContext.drawImage(sprites[_TILE_EMPTY], i*zoom, j*zoom, zoom, zoom);
				}
			}
		}
	}
}

function drawBufferCanvasMap(){
	
	for(var x = 0; x < viewportMap.length; x++){
		for(var y = 0; y < viewportMap[x].length; y++){
			
			if( viewportMap[x][y].type == _TILE_WATER 
				|| viewportMap[x][y].type == _TILE_SAND 
				|| viewportMap[x][y].type == _TILE_GRASS ) {

				bufferMapContext.drawImage(sprites[viewportMap[x][y].type+7], x*zoom, y*zoom, zoom, zoom);
				
			} else {
			
				bufferMapContext.drawImage(sprites[9], x*zoom, y*zoom, zoom, zoom);
			}
		
			
			//bufferMapContext.drawImage(sprites[viewportMap[x][y].type], (x*zoom), (y*zoom), zoom, zoom);
			if(viewportMap[x][y].flip){
				bufferMapContext.drawImage(sprites[viewportMap[x][y].type], (x*zoom), (y*zoom), zoom, zoom);
				//flipImage(sprites[viewportMap[x][y].type], bufferMapContext, x, y, true, false);
			} else {
				bufferMapContext.drawImage(sprites[viewportMap[x][y].type], (x*zoom), (y*zoom), zoom, zoom);
			}
		
		}
	}
}

function flipImage(image, ctx, x, y, flipH, flipV) {
    var scaleH = flipH ? -1 : 1, // Set horizontal scale to -1 if flip horizontal
        scaleV = flipV ? -1 : 1, // Set verical scale to -1 if flip vertical
        posX = flipH ? (1*zoom) * -1 : 0, // Set x position to -100% if flip horizontal 
        posY = flipV ? (1*zoom) * -1 : 0; // Set y position to -100% if flip vertical
    
    ctx.save(); // Save the current state
    ctx.scale(scaleH, scaleV); // Set scale to flip the image
    ctx.drawImage(image, posX, posY, zoom, zoom); // draw the image
    ctx.restore(); // Restore the last saved state
};

function getTileName(i){
	
	var name = "";
	
	if( i == _TILE_WATER ){
		name = "WATER";
	} else if( i == _TILE_SAND ){
		name = "SAND";
	} else if( i == _TILE_GRASS ){
		name = "GRASS";
	} else if( i == _TILE_GRASS_MEDIUM ){
		name = "GRASS_MEDIUM";
	} else if( i == _TILE_GRASS_HARD ){
		name = "GRASS_HARD";
	} else if( i == _TILE_TREE || i == _TILE_TREE_2 || i == _TILE_TREE_3 ){
		name = "TREE";
	}
	
	return name;
}
	
function convertToTiledMap(mapData){
	
	var tiles 				= create2DArray(_MAP_PIXEL_DIMENSION, _MAP_PIXEL_DIMENSION),
		rangeWaterStart 	= 0,
		rangeWaterEnd 		= 0.3,
		rangeSandStart 		= rangeWaterEnd,
		rangeSandEnd 		= 0.4,
		rangeGrassStart 	= rangeSandEnd,
		rangeGrassEnd 		= 0.7,
		rangeMountainStart 	= rangeGrassEnd,
		rangeMountainEnd 	= 0.8,
		rangeRockStart 		= rangeMountainEnd,
		rangeRockEnd 		= 0.9,
		rangeSnowStart 		= rangeRockEnd,
		rangeSnowEnd 		= 1.0;
		
		var tilesTree = [_TILE_TREE, _TILE_TREE_2, _TILE_TREE_3];
	
	for(x = 0; x < _MAP_PIXEL_DIMENSION; x++){
		for(y = 0; y < _MAP_PIXEL_DIMENSION; y++){
			
			try{
				
				var data = mapData[x][y];
				var tempTile = new Tile(_TILE_WATER);
					tempTile.index = (y*_MAP_PIXEL_DIMENSION)+x;
					tempTile.x = x;
					tempTile.y = y;
				
				if (data >= rangeWaterStart && data <= rangeWaterEnd) {
					tempTile.type = _TILE_WATER;
				} else if (data > rangeSandStart && data <= rangeSandEnd) {
					tempTile.type = _TILE_SAND;
				} else if (data > rangeGrassStart && data <= rangeGrassEnd) {
					tempTile.type = _TILE_GRASS;
				} else if (data > rangeMountainStart && data <= rangeMountainEnd) {
					tempTile.type = _TILE_GRASS_MEDIUM;
				} else if (data > rangeRockStart && data <= rangeRockEnd) {
					tempTile.type = _TILE_GRASS_HARD;
				} else if (data > rangeSnowStart) {
					var r = Math.random()*3<<0;
					tempTile.type = tilesTree[r];
					tempTile.wood = ++r;
					tempTile.flip = getRandomBoolean();
				}
				
				tiles[x][y] = tempTile;
				
			} catch (err){
				console.log(err.message);
			}
		}
	}
	
	return tiles;
}

function setRandomStartPoint(selectedPlayer){
	
	var l = _TILES_MAP.length-1,
		randStart = getRandomInt(0, l*l),
		p = getCoordsFromIndex(randStart);
	
	if( _TILES_MAP[p.x][p.y].type != 2){
		_TILES_MAP[p.x][p.y].type = 2;
	}
	
	players[selectedPlayer].x = p.x;
	players[selectedPlayer].y = p.y;
	players[selectedPlayer].map_index = _TILES_MAP[p.x][p.y].index;
}

/*function drawViewportPlayer(x,y,alpha){

	var _x = x*zoom || (viewportOffsetRowsCols*0.5)*zoom,
		_y = y*zoom || (viewportOffsetRowsCols*0.5)*zoom,
		_alpha = alpha || 1.0;
	
	viewportCtx.save();
    viewportCtx.globalAlpha = _alpha;
    viewportCtx.drawImage(sprites[_TILE_PLAYER], _x, _y, zoom, zoom);
	
	if(bPlayerSelected)
		viewportCtx.drawImage(sprites[_TILE_SELECTED], _x, _y, zoom, zoom);
		
    viewportCtx.restore();
}*/

function getCoordsFromIndex(index){
	
	var _X = index%_TILES_MAP.length,
		_Y = Math.round(index/_TILES_MAP.length);

	return {x:_X, y:_Y};
}

function getViewportMap(entity){
	
	//console.log(index);
	//console.dir(players[selectedPlayer]);

	var pos = entity;
		offset = viewportOffsetRowsCols*0.5,
		ltx = parseInt(pos.x)-parseInt(offset),
		lty = parseInt(pos.y)-parseInt(offset),
		mX = ltx+viewportRowsCols,
		mY = lty+viewportRowsCols,
		aView = create2DArray(viewportRowsCols, viewportRowsCols),
		_X = 0,
		_Y = 0;
		
	//console.dir(pos);
	//console.dir(_TILES_MAP[pos.x][pos.y]);
	
	for(var x = ltx; x < mX; x++){

		_Y = 0;

		for(var y = lty; y < mY; y++){
			
			if( x > -1 && x < _MAP_PIXEL_DIMENSION && y > -1 && y < _MAP_PIXEL_DIMENSION){
				
				aView[_X][_Y] = _TILES_MAP[x][y];
				
			} else {
				
				var tempTile = new Tile(_TILE_EMPTY);
					tempTile.index = (y*_MAP_PIXEL_DIMENSION)+x;
					tempTile.x = x;
					tempTile.y = y;
				
				aView[_X][_Y] = tempTile;
			}
			_Y++;
		}
		_X++;
	}
	
	return aView;
}
	
/**
* makeSprite
* @param {int} x
* @param {int} y
* @param {boolean} flip
* @return {object} m_canvas
*/
function makeSprite(x,y, flip){
	
	var m_canvas = document.createElement('canvas');
		m_canvas.width = viewportTileSize;
		m_canvas.height = viewportTileSize;
		
	var m_context = m_canvas.getContext('2d');
	
	m_context.drawImage(sprites_img, -x*viewportTileSize, -y*viewportTileSize);

	if(flip){
		var m_canvas2 = document.createElement('canvas');
			m_canvas2.width = viewportTileSize;
			m_canvas2.height = viewportTileSize;
			
		var m_context2 = m_canvas2.getContext('2d');
			m_context2.scale(-1,1)
			m_context2.drawImage(m_canvas, -viewportTileSize, 0);
			
			m_canvas2 = resize(m_canvas2, zoomOffset);

		return m_canvas2;
	}
	
	m_canvas = resize(m_canvas, zoomOffset);
	
	return m_canvas;
}

function makeButton(args){
	
	if(!args.width){
		args.width = 1;
	}
	
	if(!args.height){
		args.height = 1;
	}
	
	var m_canvas = document.createElement('canvas');
		m_canvas.width = viewportTileSize * args.width;
		m_canvas.height = viewportTileSize * args.height;
		
	var m_context = m_canvas.getContext('2d');
		m_context.drawImage(sprites_img, -args.x*viewportTileSize, -args.y*viewportTileSize);
	
	if(args.icon){
		var sprX = 0,
			sprY = 0;
		
		if(args.icon == _TILE_MOVES)
			sprX = 4,
			sprY = 0;
		
		if(args.icon == _TILE_AXE)
			sprX = 6,
			sprY = 3;
			
		if(args.icon == _TILE_ATTACK )
			sprX = 11,
			sprY = 4;
			
		if(args.icon == _TILE_HAMMER )
			sprX = 12,
			sprY = 4;
			
		if(args.icon == _TILE_CONFIRM )
			sprX = 7,
			sprY = 1;
			
		if(args.icon == _TILE_CANCEL )
			sprX = 5,
			sprY = 1;
		
			m_context.drawImage(sprites_img, -sprX*viewportTileSize, -sprY*viewportTileSize);
			
		
	}
	
	if(args.flip){
		var m_canvas2 = document.createElement('canvas');
			m_canvas2.width = viewportTileSize * args.width;
			m_canvas2.height = viewportTileSize * args.height;
			
		var m_context2 = m_canvas2.getContext('2d');
			m_context2.scale(-1,1)
			m_context2.drawImage(m_canvas, -m_canvas2.width, 0);

		
		m_canvas2 = resize(m_canvas2, zoomOffset);
		
		return m_canvas2;
	}

	if(args.text || args.label){
		var font_size = 10,
			color = 'white',
			text = args.text,
			x = (m_canvas.width*0.5)<<0,
			y = (m_canvas.height*0.5)<<0;

		/*if(args.label){
			font_size = '10px';
			color = 'white';
			text = args.label;
			y = (m_canvas.height*0.8)<<0;
		}*/

		m_context.fillStyle = color;        	
		m_context.font = font_size+'px silkscreennormal, cursive';
		m_context.textBaseline = 'middle';
		m_context.textAlign = 'center';
		m_context.fillText(text, x, y);
	}
	
	m_canvas = resize(m_canvas, zoomOffset);
	
	return m_canvas;
}

function makePanel(x,y,w,h){
	
	var m_canvas = document.createElement('canvas');
		m_canvas.width = w;
		m_canvas.height = h;
		
	var m_context = m_canvas.getContext('2d');
		m_context.drawImage(sprites_img, -x*viewportTileSize, -y*viewportTileSize);
	
	m_canvas = resize(m_canvas, zoomOffset);
	
	return m_canvas;
}

/*function updateViewPortCollisionMap(){
	
	viewportCollisionMap = create2DArray(viewportRowsCols, viewportRowsCols);
	
	// On met a plat avec que des '0' et '1' pour la collision
	for(var i = 0; i < viewportRowsCols; i++){
		for(var j = 0; j < viewportRowsCols; j++){
			if( viewportMap[i][j].type == _TILE_WATER 
				|| viewportMap[i][j].type == _TILE_TREE
				|| viewportMap[i][j].type == _TILE_TREE_2
				|| viewportMap[i][j].type == _TILE_TREE_3
				|| viewportMap[i][j].type == _TILE_EMPTY ){
				viewportCollisionMap[i][j] = 1;
			} else {
				viewportCollisionMap[i][j] = 0;
			}
		}
	}
}*/

function getViewPortCollisionMap(){
	return 	viewportCollisionMap;
}

function updateViewPortFOV(x,y){

	var plx = x,
		ply = y;
		
	viewportFovMap = create2DArray(viewportRowsCols, viewportRowsCols);

	for(var i=0; i < viewportRowsCols; i++){
		for(var j = 0; j < viewportRowsCols; j++){
			if( viewportMap[i][j].type == _TILE_EMPTY ){
				viewportFovMap[i][j] = 1;
			} else {
				viewportFovMap[i][j] = 0;
			}
		}
	}
	
	viewportFovMap[plx][ply] = 2;
	
	updateBufferViewObject(viewportFovMap, plx, ply, _FOV);
}

function getViewPortFovMap(){
	return 	viewportFovMap;
}

function updateViewPortMoves(x,y){

	var plx = x,
		ply = y;
		
	viewportMovesMap = create2DArray(viewportRowsCols, viewportRowsCols);
		
	for(var i=0; i < viewportRowsCols; i++){
		for(var j = 0; j < viewportRowsCols; j++){
			if( viewportMap[i][j].type == _TILE_WATER 
				|| viewportMap[i][j].type == _TILE_TREE
				|| viewportMap[i][j].type == _TILE_TREE_2
				|| viewportMap[i][j].type == _TILE_TREE_3
				|| viewportMap[i][j].type == _TILE_EMPTY
				|| viewportMap[i][j].type == _TILE_HOUSE
				|| viewportMap[i][j].type == _TILE_FARM
				|| viewportMap[i][j].type == _TILE_SAWMILL
				|| viewportMap[i][j].type == _TILE_STONE_QUARRY
				 ){
				viewportMovesMap[i][j] = 1;
			} else {
				viewportMovesMap[i][j] = 0;
			}
		}
	}
	
	updateBufferViewObject(viewportMovesMap, plx, ply, _MVT);
}

function getViewPortMovesMap(){
	return 	viewportMovesMap;
}

function updateViewPortWoodAxe(x,y){
	
	var plx = x,
		ply = y;
		
	viewportWoodAxeMap = create2DArray(viewportRowsCols, viewportRowsCols);
	
	// check Top
	if( viewportMap[x][y-1].type == _TILE_TREE
		|| viewportMap[x][y-1].type == _TILE_TREE_2
		|| viewportMap[x][y-1].type == _TILE_TREE_3
	){
		viewportWoodAxeMap[x][y-1] = 2;
	}
	// check Right
	if( viewportMap[x+1][y].type == _TILE_TREE 
		|| viewportMap[x+1][y].type == _TILE_TREE_2 
		|| viewportMap[x+1][y].type == _TILE_TREE_3 
	){
		viewportWoodAxeMap[x+1][y] = 2;
	}
	// check Bottom
	if( viewportMap[x][y+1].type == _TILE_TREE 
		|| viewportMap[x][y+1].type == _TILE_TREE_2 
		|| viewportMap[x][y+1].type == _TILE_TREE_3 
	){
		viewportWoodAxeMap[x][y+1] = 2;
	}
	// check Left
	if( viewportMap[x-1][y].type == _TILE_TREE 
		|| viewportMap[x-1][y].type == _TILE_TREE_2 
		|| viewportMap[x-1][y].type == _TILE_TREE_3 
	){
		viewportWoodAxeMap[x-1][y] = 2;
	}
}

function updateViewPortPlayers(){
	
	viewportPlayersMap = create2DArray(viewportRowsCols, viewportRowsCols);
	
	for(var i = 0; i < viewportPlayersMap.length; i++){
		for(var j = 0; j < viewportPlayersMap[i].length; j++){
			for(var p = 0; p < players.length; p++ ){
				if( players[p].map_index == viewportMap[i][j].index
					&& players[p].alive ){
					viewportPlayersMap[i][j] = 2;
				}
			}
		}
	}
}

function updateViewPortAttack(x,y){
	
	var plx = x,
		ply = y;
	
	viewportAttackMap = create2DArray(viewportRowsCols, viewportRowsCols);
	
	for(var i = 0; i < viewportAttackMap.length; i++){
		for(var j = 0; j < viewportAttackMap[i].length; j++){
			if( viewportMap[i][j].type == _TILE_WATER 
				|| viewportMap[i][j].type == _TILE_TREE
				|| viewportMap[i][j].type == _TILE_TREE_2
				|| viewportMap[i][j].type == _TILE_TREE_3
				|| viewportMap[i][j].type == _TILE_EMPTY ){
				viewportAttackMap[i][j] = 1;
			} else {
				viewportAttackMap[i][j] = 0;
			}
		}
	}
	
	updateBufferViewObject(viewportAttackMap, plx, ply, players[selectedPlayer].range_attack);
	
	
	// On enleve toutes les zones que ne sont pas un player
	for(var i = 0; i < viewportAttackMap.length; i++){
		for(var j = 0; j < viewportAttackMap[i].length; j++){
			
			if( viewportAttackMap[i][j] == 2 
			&& viewportPlayersMap[i][j] != 2 ){
				
				viewportAttackMap[i][j] = 0;
				
			}
			
			for(var p = 0; p < players.length; p++ ){
				
				if( players[p].map_index == viewportMap[i][j].index 
					&& players[p].map_index != players[selectedPlayer].map_index
					&& players[p].team == players[selectedPlayer].team 
					) {
						viewportAttackMap[i][j] = 0;
				}
			}
			
		}
	}
}


function updateViewPortBuild(x,y){
	
	var plx = x,
		ply = y;
	
	viewportBuildMap = create2DArray(viewportRowsCols, viewportRowsCols);
	
	for(var i=0; i < viewportRowsCols; i++){
		for(var j = 0; j < viewportRowsCols; j++){
			if( viewportMap[i][j].type == _TILE_WATER 
				|| viewportMap[i][j].type == _TILE_TREE
				|| viewportMap[i][j].type == _TILE_TREE_2
				|| viewportMap[i][j].type == _TILE_TREE_3
				|| viewportMap[i][j].type == _TILE_EMPTY
				|| viewportMap[i][j].type == _TILE_GRASS_MEDIUM
				|| viewportMap[i][j].type == _TILE_GRASS_HARD
				|| viewportMap[i][j].type == _TILE_SAND
				|| viewportMap[i][j].type == _TILE_HOUSE
				|| viewportMap[i][j].type == _TILE_FARM
				|| viewportMap[i][j].type == _TILE_SAWMILL
				|| viewportMap[i][j].type == _TILE_STONE_QUARRY
				 ){
				viewportBuildMap[i][j] = 1;
			} else {
				viewportBuildMap[i][j] = 0;
			}
		}
	}
	
	updateBufferViewObject(viewportBuildMap, plx, ply, _MVT);
	
}

function updateBufferViewObject(map, x, y, r){
	
	checkNWquad( map, x, y, r, 1.0, 0.0, 1);
	checkNEquad( map, x, y, r, 1.0, 0.0, 1);
	
	checkENquad( map, x, y, r, 1.0, 0.0, 1);
	checkESquad( map, x, y, r, 1.0, 0.0, 1);
	
	checkSEquad( map, x, y, r, 1.0, 0.0, 1);
	checkSWquad( map, x, y, r, 1.0, 0.0, 1);
	
	checkWSquad( map, x, y, r, 1.0, 0.0, 1);
	checkWNquad( map, x, y, r, 1.0, 0.0, 1);
}


/* ------------------------------------------------------------------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------------------------------------------------------- */
/**
 	* resize : Takes an image and a scaling factor and returns the scaled image and copied, pixel by pixel into another offscreen canvas with the new size.
	* @param {object} img
	* @param {int} scale
	* @param {boolean} alpha
	* @return {object} scaled  'canvas'
	*/
    function resize( img, scale ) {
		
        var widthScaled = img.width * scale;
        var heightScaled = img.height * scale;

        var orig = document.createElement('canvas');
        orig.width = img.width;
        orig.height = img.height;
        var origCtx = orig.getContext('2d');
        origCtx.drawImage(img, 0, 0);
        var origPixels = origCtx.getImageData(0, 0, img.width, img.height);

        var scaled = document.createElement('canvas');
        scaled.width = widthScaled;
        scaled.height = heightScaled;
        var scaledCtx = scaled.getContext('2d');
        var scaledPixels = scaledCtx.getImageData( 0, 0, widthScaled, heightScaled );

        for( var y = 0; y < heightScaled; y++ ) {
            for( var x = 0; x < widthScaled; x++ ) {
                var index = (Math.floor(y / scale) * img.width + Math.floor(x / scale)) * 4;
                var indexScaled = (y * widthScaled + x) * 4;
                scaledPixels.data[ indexScaled ] = origPixels.data[ index ];
                scaledPixels.data[ indexScaled+1 ] = origPixels.data[ index+1 ];
                scaledPixels.data[ indexScaled+2 ] = origPixels.data[ index+2 ];
                scaledPixels.data[ indexScaled+3 ] = origPixels.data[ index+3 ];
            }
        }
        scaledCtx.putImageData( scaledPixels, 0, 0 );
        return scaled;
    }
/* ------------------------------------------------------------------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------------------------------------------------------- */


$( document ).ready(function() {
	init();
});
