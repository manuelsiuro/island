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
	
	panelCanvas = document.createElement('canvas'),
	panelContext = panelCanvas.getContext('2d'),
	
	
	viewportTileSize = 16,
	viewportRowsCols = 9,
	viewportOffsetRowsCols = viewportRowsCols-1,
	zoomOffset = 4,
	zoomFontOffset = zoomOffset*0.5,
	zoom = viewportTileSize*zoomOffset,
	fontSize = 14,
	pannelFontSize = zoomFontOffset * fontSize,
	viewportMap = [],
	viewportCollisionMap = null,
	viewportFovMap = null,
	viewportMovesMap = null,
	viewportWoodAxeMap = null,
	_TILE_WATER = 0,
	_TILE_SAND = 1,
	_TILE_GRASS = 2,
	_TILE_GRASS_MEDIUM = 3,
	_TILE_GRASS_HARD = 4,
	_TILE_TREE = 20,
	_TILE_TREE_2 = 21,
	_TILE_TREE_3 = 22,
	_TILE_EMPTY = 6,
	_TILE_PLAYER = 10,
	_TILE_MOVES = 11,
	_TILE_SELECTED = 12,
	_TILE_AXE = 13,
	_TILE_ATTACK = 14,
	_TILE_PANEL = 16,
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
	isIpad = navigator.userAgent.match(/iPad/i) != null,
	isIphone = navigator.userAgent.match(/iPhone/i) != null,
	isAndroid = navigator.userAgent.match(/Android/i) != null,
	useTouch = isIpad | isIphone | isAndroid,
	_SCREEN_WIDTH = 320,
	_SCREEN_HEIGHT = 240,
	currentPlayerIndex = 0,
	pathStart = [viewportRowsCols,viewportRowsCols],
	pathEnd = [0,0],
	currentPath = [],
	sprites = [],
	sprites_img = document.createElement("img"),
	_GRID_X = viewportOffsetRowsCols*0.5,
	_GRID_Y = viewportOffsetRowsCols*0.5,
	buttons = [],
	player = new Player();
							  
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
	
	/*
    btnSaveMap.onclick = function(){
        var strDataURI = viewportCanvas.toDataURL();
        window.open(strDataURI);
    };
	
	$("#output").on('click', '.plus-population', function(e){
		var idx = $("#tile-index").html();
		_TILES_MAP[idx].population++;
	});*/
	
	/*
	_SCREEN_WIDTH = $(window).width(),
	_SCREEN_HEIGHT = (useTouch) ? screen.height : $(window).height();
	*/
	_SCREEN_WIDTH = viewportCanvas.width,
	_SCREEN_HEIGHT = viewportCanvas.height;
	//viewportCanvas.width = _SCREEN_WIDTH;
	//viewportCanvas.height = _SCREEN_HEIGHT;
	
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
	
	panelContext.font = '14px silkscreennormal, cursive';
		
	window.scrollTo( 0, 1 );
	
	// On genere le terrain sur le onload de l'image
	sprites_img.src = "img/sprites.png";	
}

function terrainGeneration(){
	generateMap();
	
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
	
}

function generateMap(){

	_MAP 		= generateTerrainMap(_MAP_PIXEL_DIMENSION, _PIXEL_UNIT_SIZE, _MAP_ROUGHNESS);
	_TILES_MAP 	= convertToTiledMap(_MAP);

	setRandomStartPoint();
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
	viewportMap = getViewportMap(currentPlayerIndex);
	updateViewPortCollisionMap();
		
	if(bFovEnable)
		updateViewPortFOV((viewportOffsetRowsCols*0.5), (viewportOffsetRowsCols*0.5));
		
	if(bMvtEnable)
		updateViewPortMoves((viewportOffsetRowsCols*0.5), (viewportOffsetRowsCols*0.5));
		
	if(bWoodHaxe)
		updateViewPortWoodAxe((viewportOffsetRowsCols*0.5), (viewportOffsetRowsCols*0.5));
		
	// Draw on buffer canvas
	drawBufferCanvasMap();
	
	if(bFovEnable)
		drawBufferFOV();
		
	if(bMvtEnable)
		drawBufferMoves();
		
	if(bWoodHaxe)
		drawBufferWoodAxe();
	
	drawBufferPanel();
}

function redraw(){
	
	drawViewPortMap(),
	drawViewportPlayer();
}

var _MAP_OFFSET_X = 0;
var _MAP_OFFSET_Y = 0;

function drawViewPortMap(){
	
	// MAP
	viewportCtx.clearRect(0, 0, viewportCanvas.height, viewportCanvas.width);

	viewportCtx.drawImage(bufferMapCanvas, _MAP_OFFSET_X, _MAP_OFFSET_Y);
	
	if(bFovEnable)
		viewportCtx.drawImage(bufferFovCanvas,  _MAP_OFFSET_X, _MAP_OFFSET_Y);
		
	if(bMvtEnable)
		viewportCtx.drawImage(bufferMovesCanvas,  _MAP_OFFSET_X, _MAP_OFFSET_Y);
		
	if(bWoodHaxe)
		viewportCtx.drawImage(bufferWoodAxeCanvas,  _MAP_OFFSET_X, _MAP_OFFSET_Y);
	
	// UI --
	if(bUiEnable)	
		viewportCtx.drawImage(panelCanvas,  _MAP_OFFSET_X, _MAP_OFFSET_Y);
		
	// BUTTON
	if(bPlayerSelected){
		viewportCtx.drawImage(buttons['move'].sprite, buttons['move'].position.x*zoom, buttons['move'].position.y*zoom, buttons['move'].width*zoom, buttons['move'].height*zoom);
		viewportCtx.drawImage(buttons['axe'].sprite, buttons['axe'].position.x*zoom, buttons['axe'].position.y*zoom, buttons['axe'].width*zoom, buttons['axe'].height*zoom);
	}
		
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

function drawBufferPanel(){

	var _X = viewportOffsetRowsCols*0.5,
		_Y = viewportOffsetRowsCols*0.5,
		lineHeight 		= 15*zoomFontOffset,
		labelMarginLeft = 15*zoomFontOffset,
		dataMarginLeft 	= 120*zoomFontOffset,
		startline 		= zoom*viewportRowsCols+(45*zoomFontOffset);
	
	panelContext.clearRect(0, 0, panelCanvas.height, panelCanvas.width);
	panelContext.drawImage(sprites[_TILE_PANEL], 
		0, // x
		zoom*viewportRowsCols, // y
		zoom*viewportRowsCols, // width
		160 * (zoomOffset*0.5)	// height
		);
		
	panelContext.font = pannelFontSize+'px silkscreennormal, cursive';
	panelContext.fillStyle = 'black';
	
	panelContext.fillText("TILEMAP", labelMarginLeft, startline);
	panelContext.fillText(getTileName(viewportMap[_X][_Y].type), dataMarginLeft, startline);
	startline += lineHeight;
	
	panelContext.fillText("Population", labelMarginLeft, startline);
	panelContext.fillText(viewportMap[_X][_Y].population, dataMarginLeft, startline);
	startline += lineHeight;
	
	panelContext.fillText("Wood", labelMarginLeft, startline);
	panelContext.fillText(viewportMap[_X][_Y].wood, dataMarginLeft, startline);
	startline += lineHeight;
	
	panelContext.fillText("Rock", labelMarginLeft, startline);
	panelContext.fillText(viewportMap[_X][_Y].rock, dataMarginLeft, startline);
	startline += lineHeight;
	
	panelContext.fillText("Cuivre", labelMarginLeft, startline);
	panelContext.fillText(viewportMap[_X][_Y].cuivre, dataMarginLeft, startline);
	startline += lineHeight;
	
	panelContext.fillText("Fer", labelMarginLeft, startline);
	panelContext.fillText(viewportMap[_X][_Y].fer, dataMarginLeft, startline);
	startline += lineHeight;
	
	panelContext.fillText("Or", labelMarginLeft, startline);
	panelContext.fillText(viewportMap[_X][_Y].or, dataMarginLeft, startline);
	startline += lineHeight;
	
	/**/panelContext.fillText("Grid", labelMarginLeft, startline);
	panelContext.fillText(_GRID_X + ',' + _GRID_Y, dataMarginLeft, startline);
	startline += lineHeight;
}

function drawBufferWoodAxe(){
	
	if(bWoodHaxe && viewportWoodAxeMap != null){
		
		bufferWoodAxeContext.clearRect(0, 0, viewportCanvas.height, viewportCanvas.width);
		
		for(var i = 0; i < viewportWoodAxeMap.length; i++){
			for(var j = 0; j < viewportWoodAxeMap[i].length; j++){
				if(viewportWoodAxeMap[i][j]==2){
					bufferWoodAxeContext.drawImage(sprites[_TILE_AXE], i*zoom, j*zoom, zoom, zoom);
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
					bufferMovesContext.drawImage(sprites[_TILE_MOVES], i*zoom, j*zoom, zoom, zoom);
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
		
			bufferMapContext.drawImage(sprites[viewportMap[x][y].type], (x*zoom), (y*zoom), zoom, zoom);
		
		}
	}
}

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
				}
				
				tiles[x][y] = tempTile;
				
			} catch (err){
				console.log(err.message);
			}
		}
	}
	
	return tiles;
}

function setRandomStartPoint(){
	var l = (_TILES_MAP.length)-1;
	var randStart = getRandomInt(0, l*l);
	var p = getCoordsFromIndex(randStart);
	
	if( _TILES_MAP[p.x][p.y].type != 2){
		_TILES_MAP[p.x][p.y].type = 2;
	}
	
	currentPlayerIndex = randStart;;
	
	
}

function drawViewportPlayer(x,y,alpha){

	var _x = x*zoom || (viewportOffsetRowsCols*0.5)*zoom,
		_y = y*zoom || (viewportOffsetRowsCols*0.5)*zoom,
		_alpha = alpha || 1.0;
	
	viewportCtx.save();
    viewportCtx.globalAlpha = _alpha;
    viewportCtx.drawImage(sprites[_TILE_PLAYER], _x, _y, zoom, zoom);
	
	if(bPlayerSelected)
		viewportCtx.drawImage(sprites[_TILE_SELECTED], _x, _y, zoom, zoom);
		
    viewportCtx.restore();
}

function getCoordsFromIndex(index){
	
	var _X = index%_TILES_MAP.length,
		_Y = Math.round(index/_TILES_MAP.length);

	return {x:_X, y:_Y};
}

function getViewportMap(index){
	
	console.log(index);

	var pos = getCoordsFromIndex(index),
		offset = viewportOffsetRowsCols*0.5,
		ltx = parseInt(pos.x)-parseInt(offset),
		lty = parseInt(pos.y)-parseInt(offset),
		rtx = parseInt(pos.x)+parseInt(offset),
		lby = parseInt(pos.y)+parseInt(offset),
		aView = create2DArray(viewportRowsCols, viewportRowsCols),
		_X = 0,
		_Y = 0;
	
	console.log(pos);
		
	for(var x = ltx; x <= rtx; x++){
		_Y = 0;
		for(var y = lty; y <= lby; y++){
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

	/*if(flip){
		var m_canvas2 = document.createElement('canvas');
			m_canvas2.width = viewportTileSize;
			m_canvas2.height = viewportTileSize;
			
		var m_context2 = m_canvas2.getContext('2d');
			m_context2.scale(-1,1)
			m_context2.drawImage(m_canvas, -viewportTileSize, 0);

		return resize(m_canvas2, zoomOffset);
	}*/
	
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
		
			m_context.drawImage(sprites_img, -sprX*viewportTileSize, -sprY*viewportTileSize);
			
		
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
	
	return m_canvas;
}

function updateViewPortCollisionMap(){
	
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
}

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
				|| viewportMap[i][j].type == _TILE_EMPTY ){
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
