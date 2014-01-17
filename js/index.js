var _MAP_PIXEL_DIMENSION = 64,
	_PIXEL_UNIT_SIZE = 1, // Power of 2
	_MAP_ROUGHNESS = 8,
	_FOV = 4,
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
	panelCanvas = document.createElement('canvas'),
	panelContext = panelCanvas.getContext('2d'),
	viewportTileSize = 16,
	viewportRowsCols = 13,
	viewportOffsetRowsCols = viewportRowsCols-1,
	zoom = viewportTileSize*1.5,
	viewportMap = [],
	viewportCollisionMap = null,
	viewportFovMap = null,
	viewportMovesMap = null,
	_TILE_WATER = 0,
	_TILE_SAND = 1,
	_TILE_GRASS = 2,
	_TILE_GRASS_MEDIUM = 3,
	_TILE_GRASS_HARD = 4,
	_TILE_TREE = 5,
	_TILE_EMPTY = 6,
	_TILE_PLAYER = 10,
	_TILE_MOVES = 11,
	_TILE_SELECTED = 12,
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
	_GRID_Y = viewportOffsetRowsCols*0.5;
							  
/* ------------------------------------------------------------------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------------------------------------------------------- */
function init(){
	
	/*
    btnSaveMap.onclick = function(){
        var strDataURI = viewportCanvas.toDataURL();
        window.open(strDataURI);
    };
	
	$("#output").on('click', '.plus-population', function(e){
		var idx = $("#tile-index").html();
		_TILES_MAP[idx].population++;
	});*/
	
	_SCREEN_WIDTH = $(window).width(),
	_SCREEN_HEIGHT = (useTouch) ? screen.height : $(window).height();
	
	viewportCanvas.width = _SCREEN_WIDTH;
	viewportCanvas.height = _SCREEN_HEIGHT;
	
	bufferMapCanvas.width = _SCREEN_WIDTH;
	bufferMapCanvas.height = _SCREEN_HEIGHT;
	
	bufferFovCanvas.width = _SCREEN_WIDTH;
	bufferFovCanvas.height = _SCREEN_HEIGHT;
	
	bufferMovesCanvas.width = _SCREEN_WIDTH;
	bufferMovesCanvas.height = _SCREEN_HEIGHT;
	
	panelCanvas.width = _SCREEN_WIDTH;
	panelCanvas.height = _SCREEN_HEIGHT;
	
	panelContext.font = '14px silkscreennormal, cursive';
		
	window.scrollTo( 0, 1 );
	
	// On genere le terrain sur le onload de l'image
	sprites_img.src = "img/sprites.png";	
}

function terrainGeneration(){
	generateMap();
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
			//redraw();
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
	viewportMap = getViewportMap(currentPlayerIndex),
	updateViewPortCollisionMap(),
	updateViewPortFOV((viewportOffsetRowsCols*0.5), (viewportOffsetRowsCols*0.5)),
	updateViewPortMoves((viewportOffsetRowsCols*0.5), (viewportOffsetRowsCols*0.5));
	
	// Draw on buffer canvas
	drawBufferCanvasMap(),
	drawBufferFOV(),
	drawBufferMoves(),
	drawBufferPanel();
}

function redraw(){
	
	drawViewPortMap(),
	drawViewportPlayer();
}

var _MAP_OFFSET_X = 0;
var _MAP_OFFSET_Y = 0;

function drawViewPortMap(){
	
	//_MAP_OFFSET_X+=5;
	//_MAP_OFFSET_Y+=5;
	
	viewportCtx.clearRect(0, 0, viewportCanvas.height, viewportCanvas.width);

	viewportCtx.drawImage(bufferMapCanvas, _MAP_OFFSET_X, _MAP_OFFSET_Y);
	
	if(bFovEnable)
		viewportCtx.drawImage(bufferFovCanvas,  _MAP_OFFSET_X, _MAP_OFFSET_Y);
		
	if(bMvtEnable)
		viewportCtx.drawImage(bufferMovesCanvas,  _MAP_OFFSET_X, _MAP_OFFSET_Y);
	
	if(bUiEnable)	
		viewportCtx.drawImage(panelCanvas,  _MAP_OFFSET_X, _MAP_OFFSET_Y);
	
		
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
		lineHeight 		= 15,
		labelMarginLeft = 15,
		dataMarginLeft 	= 120,
		startline 		= 350;
	
	panelContext.clearRect(0, 0, panelCanvas.height, panelCanvas.width);
	panelContext.drawImage(sprites[_TILE_PANEL], 0, 320, 320, 160);

	panelContext.font = '14px silkscreennormal, cursive';
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
	} else if( i == _TILE_TREE ){
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
					tempTile.type = _TILE_TREE;
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
	currentPlayerIndex = getRandomInt(0, l*l);
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

	if(flip){
		var m_canvas2 = document.createElement('canvas');
			m_canvas2.width = viewportTileSize;
			m_canvas2.height = viewportTileSize;
			
		var m_context2 = m_canvas2.getContext('2d');
			m_context2.scale(-1,1)
			m_context2.drawImage(m_canvas, -viewportTileSize, 0);

		return m_canvas2;
	}
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
				|| viewportMap[i][j].type == _TILE_EMPTY ){
				viewportMovesMap[i][j] = 1;
			} else {
				viewportMovesMap[i][j] = 0;
			}
		}
	}
	
	viewportMovesMap[plx][ply] = 2;
	
	updateBufferViewObject(viewportMovesMap, plx, ply, _MVT);
}

function getViewPortMovesMap(){
	return 	viewportMovesMap;
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
$( document ).ready(function() {
	init();
});
