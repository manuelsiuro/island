var _MAP_PIXEL_DIMENSION = 512,
	_PIXEL_UNIT_SIZE = 4, // Power of 2
	_MAP_ROUGHNESS = 8,
	_MAP,
	tiledmap,
	generate = $('#generate'),
	btnSaveMap = document.getElementById('savemap'),
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
	waterStart={r:39,g:50,b:63},
	waterEnd={r:10,g:20,b:40},
	sandStart={r:98,g:105,b:83},
	sandEnd={r:189,g:189,b:144},
	grassStart={r:67,g:100,b:18},
	grassEnd={r:22,g:38,b:3},
	mtnEnd={r:67,g:80,b:18},
	mtnStart={r:60,g:56,b:31},
	rockStart={r:130,g:130,b:130},
	rockEnd={r:90,g:90,b:90},
	snowStart={r:238,g:238,b:238},
	snowEnd={r:255,g:255,b:255},
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
	fps = 6,
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
	screen_width = (useTouch) ? screen.width : $(window).width(),
	screen_height = (useTouch) ? screen.height : $(window).height(),
	currentPlayerIndex = 0,
	_FOV = 4,
	_MVT = 2,
	pathStart = [viewportRowsCols,viewportRowsCols],
	pathEnd = [0,0],
	currentPath = [],
	sprites = [],
	sprites_img = document.createElement("img"),
	gridX = viewportOffsetRowsCols*0.5,
	gridY = viewportOffsetRowsCols*0.5;
							  
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
		tiledmap[idx].population++;
	});*/
	
	viewportCanvas.width = screen_width;
	viewportCanvas.height = screen_height;
	
	bufferMapCanvas.width = screen_width;
	bufferMapCanvas.height = screen_height;
	
	bufferFovCanvas.width = screen_width;
	bufferFovCanvas.height = screen_height;
	
	bufferMovesCanvas.width = screen_width;
	bufferMovesCanvas.height = screen_height;
	
	panelCanvas.width = screen_width;
	panelCanvas.height = screen_height;
		
	window.scrollTo( 0, 1 );
	
	// On genere le terrain sur le onload de l'image
	sprites_img.src = "img/sprites.png";	
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
		
		if (frame >= 2) frame = 0; 
	
	} else { 
		acDelta += delta; 
	} 
	
	lastUpdateTime = Date.now();
}

function update(){
	
	// Update viewport data
	viewportMap = getViewportMap(currentPlayerIndex),
	updateViewPortCollision(),
	updateViewPortFOV((viewportOffsetRowsCols*0.5), (viewportOffsetRowsCols*0.5));
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

function drawBufferPanel(){

	var index = viewportOffsetRowsCols*0.5+((viewportOffsetRowsCols*0.5)*viewportRowsCols);

	var lineHeight = 15,
		labelMarginLeft = 15,
		dataMarginLeft = 120,
		startline = 350;
	
	panelContext.clearRect(0, 0, panelCanvas.height, panelCanvas.width);
	panelContext.drawImage(sprites[_TILE_PANEL], 0, 320, 320, 160);

	panelContext.font = '14px silkscreennormal, cursive';
	panelContext.fillStyle = 'black';
	
	
	panelContext.fillText("TILEMAP", labelMarginLeft, startline);
	panelContext.fillText(getTileName(viewportMap[index].type), dataMarginLeft, startline);
	startline += lineHeight;
	
	panelContext.fillText("Population", labelMarginLeft, startline);
	panelContext.fillText(viewportMap[index].population, dataMarginLeft, startline);
	startline += lineHeight;
	
	panelContext.fillText("Wood", labelMarginLeft, startline);
	panelContext.fillText(viewportMap[index].wood, dataMarginLeft, startline);
	startline += lineHeight;
	
	panelContext.fillText("Rock", labelMarginLeft, startline);
	panelContext.fillText(viewportMap[index].rock, dataMarginLeft, startline);
	startline += lineHeight;
	
	panelContext.fillText("Cuivre", labelMarginLeft, startline);
	panelContext.fillText(viewportMap[index].cuivre, dataMarginLeft, startline);
	startline += lineHeight;
	
	panelContext.fillText("Fer", labelMarginLeft, startline);
	panelContext.fillText(viewportMap[index].fer, dataMarginLeft, startline);
	startline += lineHeight;
	
	panelContext.fillText("Or", labelMarginLeft, startline);
	panelContext.fillText(viewportMap[index].or, dataMarginLeft, startline);
	startline += lineHeight;
	
	panelContext.fillText("Grid", labelMarginLeft, startline);
	panelContext.fillText(gridX + ',' + gridY, dataMarginLeft, startline);
	startline += lineHeight;
}

function drawBufferMoves(){
	// Mouvements
	if(bMvtEnable && viewportMovesMap != null){
		
		bufferMovesContext.clearRect(0, 0, viewportCanvas.height, viewportCanvas.width);
		
		for(var i = 0; i < viewportMovesMap.length; i++){
			for(var j = 0; j < viewportMovesMap.length; j++){
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
			for(var j = 0; j < viewportFovMap.length; j++){
				if(viewportFovMap[i][j]!=2){
					bufferFovContext.drawImage(sprites[_TILE_EMPTY], i*zoom, j*zoom, zoom, zoom);
				}
			}
		}
	}
}

function drawBufferCanvasMap(){
	
	var nx = 0,
		ny = 0;
	
	for(var i = 0; i < viewportMap.length; i++){

		if( viewportMap[i].type == _TILE_WATER 
			|| viewportMap[i].type == _TILE_SAND 
			|| viewportMap[i].type == _TILE_GRASS ) {

			bufferMapContext.drawImage(sprites[viewportMap[i].type+7], nx*zoom, ny*zoom, zoom, zoom);
		} else {
			bufferMapContext.drawImage(sprites[9], nx*zoom, ny*zoom, zoom, zoom);
		}
		bufferMapContext.drawImage(sprites[viewportMap[i].type], (nx*zoom), (ny*zoom), zoom, zoom);

		if(ny==viewportOffsetRowsCols){
			ny=0;
			nx++;
		} else {
			ny++;
		}
	}
	
}



function terrainGeneration(){
	generateMap();
}
//http://nethackwiki.com/wiki/Monster#Canonical_list_of_monsters
function generateMap(){

        _MAP 			= generateTerrainMap(_MAP_PIXEL_DIMENSION, _PIXEL_UNIT_SIZE, _MAP_ROUGHNESS);
		tiledmap 		= convertToTiledMap(_MAP_PIXEL_DIMENSION, _MAP);
		tiledmap		= updateTileMap(tiledmap);

		setRandomStartPoint();
		gameLoop();
}

function updateTileMap(mapTileData){

	var x = 0,
		y = 0,
		dim = _MAP_PIXEL_DIMENSION/_PIXEL_UNIT_SIZE;
	
	for(var i = 0; i < mapTileData.length; i++){

		mapTileData[i].index = i;
		mapTileData[i].x = x;
		mapTileData[i].y = y;
		
		x++;
		if(x==dim){
			x=0;
			y++;
		}
	}
	
	return mapTileData;
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
	
function convertToTiledMap(size, mapData){
	
	var nwe = parseFloat(10)/100,
		nse = nwe + parseFloat(10)/100,
		nge = nse + parseFloat(50)/100,
		nme = nge + parseFloat(10)/100,
		nre = nme + parseFloat(10)/100,
		noe = nre + parseFloat(10)/100,
		tiles = new Array(),
		x = 0,
		y = 0;
	
	rangeWaterStart 	= 0,
	rangeWaterEnd 		= nwe,
	rangeSandStart 		= rangeWaterEnd,
	rangeSandEnd 		= nse,
	rangeGrassStart 	= rangeSandEnd,
	rangeGrassEnd 		= nge,
	rangeMountainStart 	= rangeGrassEnd,
	rangeMountainEnd 	= nme,
	rangeRockStart 		= rangeMountainEnd,
	rangeRockEnd 		= nre,
	rangeSnowStart 		= rangeRockEnd,
	rangeSnowEnd 		= noe;
	
	for(x = 0; x <= size; x = x+_PIXEL_UNIT_SIZE){
		for(y = 0; y <= size; y = y+_PIXEL_UNIT_SIZE){
			
			try{
				
				var  data = mapData[x][y];
				
				if (data >= rangeWaterStart && data <= rangeWaterEnd) {
				
					tiles.push(new Tile(_TILE_WATER));
					
				} else if (data > rangeSandStart && data <= rangeSandEnd) {
					
					tiles.push(new Tile(_TILE_SAND));
					
				} else if (data > rangeGrassStart && data <= rangeGrassEnd) {
					
					tiles.push(new Tile(_TILE_GRASS));
					
				} else if (data > rangeMountainStart && data <= rangeMountainEnd) {
					
					tiles.push(new Tile(_TILE_GRASS_MEDIUM));
					
				} else if (data > rangeRockStart && data <= rangeRockEnd) {
					
					tiles.push(new Tile(_TILE_GRASS_HARD));
					
				} else if (data > rangeSnowStart) {
					
					tiles.push(new Tile(_TILE_TREE));
				}
				
			} catch (err){
				$("#output").append(err.message+'<br>');
			}
		}
	}
	
	return tiles;
}

function setRandomStartPoint(){
	var l = tiledmap.length;
	currentPlayerIndex = getRandomInt(0, l);
}

function drawViewportPlayer(x,y,alpha){

	var _x = x*zoom || (viewportOffsetRowsCols*0.5)*zoom;
	var _y = y*zoom || (viewportOffsetRowsCols*0.5)*zoom;
	var _alpha = alpha || 1.0;
	
	viewportCtx.save();
    viewportCtx.globalAlpha = _alpha;
    viewportCtx.drawImage(sprites[_TILE_PLAYER], _x, _y, zoom, zoom);
	
	if(bPlayerSelected)
		viewportCtx.drawImage(sprites[_TILE_SELECTED], _x, _y, zoom, zoom);
		
    viewportCtx.restore();
	
}

function getCoordsFromIndex(index){
	
	return {x:tiledmap[index].x, y:tiledmap[index].y};
}

function getViewportMap(index){

	var pos = getCoordsFromIndex(index),
		offset = viewportOffsetRowsCols*0.5,
		dim = parseInt(_MAP_PIXEL_DIMENSION)/parseInt(_PIXEL_UNIT_SIZE),
		ltx = parseInt(pos.x)-parseInt(offset),
		lty = parseInt(pos.y)-parseInt(offset),
		rtx = parseInt(pos.x)+parseInt(offset),
		rty = parseInt(lty),
		lbx = parseInt(ltx),
		lby = parseInt(pos.y)+parseInt(offset),
		rbx = parseInt(rtx),
		rby = parseInt(lby),
		aView = [];
	
	for(var x = ltx; x <= rtx; x++){
		for(var y = lty; y <= lby; y++){
			if(x<0 || x>dim || y<0 || y>dim){
				var emptyTile = new Tile(_TILE_EMPTY);
				
				aView.push(emptyTile);
			} else{
				aView.push(tiledmap[x+(y*dim)]);
			}
		}
	}
	
	return aView;
}

function random_dist(max){
	return 4 + (Math.random()*max)<<0;
};

function drawViewPortMap(){
	
	viewportCtx.clearRect(0, 0, viewportCanvas.height, viewportCanvas.width);

	viewportCtx.drawImage(bufferMapCanvas, 0, 0);
	
	if(bFovEnable)
		viewportCtx.drawImage(bufferFovCanvas, 0, 0);
		
	if(bMvtEnable)
		viewportCtx.drawImage(bufferMovesCanvas, 0, 0);
	
	if(bUiEnable)	
		viewportCtx.drawImage(panelCanvas, 0, 0);	
	
		
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

function updateViewPortCollision(){
	
	viewportCollisionMap = listToMatrix(viewportMap, viewportRowsCols);
	
	// On met a plat avec que des '0' et '1' pour la collision
	for(var i=0; i < viewportRowsCols; i++){
		for(var j = 0; j < viewportRowsCols; j++){
			if( viewportCollisionMap[i][j].type == _TILE_WATER 
				|| viewportCollisionMap[i][j].type == _TILE_TREE
				|| viewportCollisionMap[i][j].type == _TILE_EMPTY ){
				viewportCollisionMap[i][j] = 1;
			} else {
				viewportCollisionMap[i][j] = 0;
			}
			
		}
	}
}

function getViewPortCollisionWorld(){
	return 	viewportCollisionMap;
}

function updateViewPortFOV(x,y){

	var plx = x,
		ply = y;
		
	viewportFovMap = listToMatrix(viewportMap, viewportRowsCols);
		
	for(var i=0; i < viewportRowsCols; i++){
		for(var j = 0; j < viewportRowsCols; j++){
			if( viewportFovMap[i][j].type == _TILE_EMPTY ){
				viewportFovMap[i][j] = 1;
			} else {
				viewportFovMap[i][j] = 0;
			}
			
		}
	}
	viewportFovMap[plx][ply] = 2;
	
	updateBufferViewObject(viewportFovMap, plx, ply, _FOV);
}


//viewportMovesMap
function updateViewPortMoves(x,y){

	var plx = x,
		ply = y;
		
	viewportMovesMap = listToMatrix(viewportMap, viewportRowsCols);
		
	for(var i=0; i < viewportRowsCols; i++){
		for(var j = 0; j < viewportRowsCols; j++){
			if( viewportMovesMap[i][j].type == _TILE_WATER 
				|| viewportMovesMap[i][j].type == _TILE_TREE
				|| viewportMovesMap[i][j].type == _TILE_EMPTY ){
				viewportMovesMap[i][j] = 1;
			} else {
				viewportMovesMap[i][j] = 0;
			}
			
		}
	}
	viewportMovesMap[plx][ply] = 2;
	
	updateBufferViewObject(viewportMovesMap, plx, ply, _MVT);
}

function getViewPortFovMap(){
	return 	viewportFovMap;
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













$( document ).ready(function() {
	init();
});










