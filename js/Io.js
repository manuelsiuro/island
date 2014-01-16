if (useTouch) {
	viewportCanvas.addEventListener('touchstart', touchClick, false);
	document.body.onload = scrollToTop;
} else {
	viewportCanvas.addEventListener('mousedown', mouseClick, false);
	viewportCanvas.addEventListener('mousemove', mouseMove, false);
}

document.addEventListener('keydown', function(event) {
    onDownCallback(event);
});

document.addEventListener('keyup', function(event) {
    onUpCallback(event);
});

function onDownCallback(event){
	//console.log("KEY_DOWN : " + event.keyCode);
}

function onUpCallback(event){
	
	//console.log("KEY_UP : " + event.keyCode);
	
	var maxIndex = _MAP_PIXEL_DIMENSION*_MAP_PIXEL_DIMENSION;
	var save = currentPlayerIndex;
	var nIndex = 0;
	
	if( event.keyCode == 38 ){
		// UP
		nIndex = currentPlayerIndex - _MAP_PIXEL_DIMENSION;
		if(nIndex>=0)
			currentPlayerIndex = nIndex;
			
		bUpdate = true;
		
	} else if( event.keyCode == 39 ){
		// RIGHT
		nIndex = ++currentPlayerIndex;
		if(nIndex <= maxIndex)
			currentPlayerIndex = nIndex;
			
		bUpdate = true;

	} else if( event.keyCode == 40 ){
		// DOWN
		nIndex = currentPlayerIndex + _MAP_PIXEL_DIMENSION;
		if(nIndex <= maxIndex)
			currentPlayerIndex = nIndex;
			
		bUpdate = true;

	} else if( event.keyCode == 37 ){
		// LEFT
		nIndex = --currentPlayerIndex;
		if(nIndex>=0)
			currentPlayerIndex = nIndex;
			
		bUpdate = true;
		
	} else if( event.keyCode == 70 ){ // f
		// FOV
		bFovEnable = !bFovEnable;
		bUpdate = true;
		
	} else if( event.keyCode == 77 ){ // m
		// MOVES
		bMvtEnable = !bMvtEnable;
		bUpdate = true;
	}
}

/* ------------------------------------------------------------------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------------------------------------------------------- */
function touchClick(ev) {
	
    var touch = ev.touches[0];

    handleClick(touch.pageX, touch.pageY);
	
    if (ev != null) {
        ev.stopPropagation();
        ev.preventDefault();
    }
    return false;
}

function mouseClick(ev) {
    handleClick(ev.clientX, ev.clientY);
}

function mouseMove(ev) {
    handleMove(ev.clientX, ev.clientY);
}


function handleClick(x, y) {	

	var html = '';
	var obj = viewportCanvas;
    var _off = $(viewportCanvas).offset();
    x = x - _off.left;
    y = y - _off.top;
	
	var offsetA = viewportTileSize;
	var offsetB = zoom;
	
	var lastIndex = currentPlayerIndex;
	
	_GRID_X = Math.round((x-offsetA)/offsetB);
    _GRID_Y = Math.round((y-offsetA)/offsetB);


console.log("_GRID_X:" + _GRID_X + " _GRID_X:" + _GRID_Y);

	/*console.log("x:" + x + " y:" + y);
	console.log("_GRID_X:" + _GRID_X + " _GRID_X:" + _GRID_Y);
	console.log("currentPlayerIndex:" + currentPlayerIndex);
	console.log("_TILES_MAP index:" + viewportMap[_GRID_X][_GRID_Y].index);
	console.info("---");*/
	
	try {
		
		

		/*
		pathStart 	= [viewportOffsetRowsCols*0.5,viewportOffsetRowsCols*0.5];
		pathEnd 	= [_GRID_X,_GRID_Y];
		currentPath = [];
		currentPath = findPath(getViewPortCollisionWorld(),pathStart,pathEnd);
		console.log(currentPath);
		currentPath.shift(); // enleve le premier qui est le point de depart
		//astarFadeStep = currentPath.length;
		console.log(currentPath);
		*/
		
		
		
		// Test if center of grid, if true it's current selected player
		/**/
		if ( _GRID_X == viewportOffsetRowsCols*0.5 && _GRID_Y == viewportOffsetRowsCols*0.5){
			
			bPlayerSelected = !bPlayerSelected;
			bMvtEnable = !bMvtEnable;
			
			//currentPlayerIndex = viewportMap[_GRID_X][_GRID_Y].index;
			bUpdate = true;
			
			
		}
		
		/**/
		if( viewportMap[_GRID_X][_GRID_Y].type != _TILE_TREE 
			&& viewportMap[_GRID_X][_GRID_Y].type != _TILE_WATER
			&& viewportMovesMap[_GRID_X][_GRID_Y] == 2
			&& bMvtEnable 
			&& _GRID_X != _GRID_Y ){
			
				currentPlayerIndex = viewportMap[_GRID_X][_GRID_Y].index;
				console.dir(viewportMap[_GRID_X][_GRID_Y]);
				bUpdate = true;
		}
		
		/*if( !bMvtEnable ){
			
			console.log(html);

		}*/
		
		// On est dans le panel
		/*if(_GRID_Y >= viewportRowsCols ){
			bUpdate = true;
		}*/
		
	}catch(err){}
	
}

function handleMove(x, y) {
	//console.log("handleMove:" + x + " " + y);
}


