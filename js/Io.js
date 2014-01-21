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


    var _off = $(viewportCanvas).offset();

	_GRID_X = ((x - _off.left)/zoom<<0),
    _GRID_Y = ((y - _off.top)/zoom<<0);

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
			
			//bPlayerSelected = !bPlayerSelected;
			if(bPlayerSelected){
				
				bPlayerSelected = false;
				bMvtEnable = false;
				bWoodHaxe = false;
				
			} else {
				bPlayerSelected = true;	
			}
			bUpdate = true;
		}
		
		if(typeof viewportMap[_GRID_X][_GRID_Y] != 'undefined'){
			
			// MOVE
			if( viewportMap[_GRID_X][_GRID_Y].type != _TILE_TREE 
				&& viewportMap[_GRID_X][_GRID_Y].type != _TILE_TREE_2 
				&& viewportMap[_GRID_X][_GRID_Y].type != _TILE_TREE_3 
				&& viewportMap[_GRID_X][_GRID_Y].type != _TILE_WATER
				&& viewportMovesMap[_GRID_X][_GRID_Y] == 2
				&& bMvtEnable 
				&& notPlayerGrid(_GRID_X, _GRID_Y) ){
				
					var nIndex = 0;
					var maxIndex = _MAP_PIXEL_DIMENSION*_MAP_PIXEL_DIMENSION;
					
					// UP
					if( _GRID_Y < viewportOffsetRowsCols*0.5) {
						
						var nline = (viewportOffsetRowsCols*0.5) - _GRID_Y;
							nIndex = currentPlayerIndex - (_MAP_PIXEL_DIMENSION*nline);
							
						if(nIndex>=0)
							currentPlayerIndex = nIndex;
					}
					
					// DOWN
					if( _GRID_Y > viewportOffsetRowsCols*0.5) {
						
						var nline = _GRID_Y - (viewportOffsetRowsCols*0.5);
							nIndex = currentPlayerIndex + (_MAP_PIXEL_DIMENSION*nline);
						
						if(nIndex <= maxIndex)
							currentPlayerIndex = nIndex;
						
					}
					
					// LEFT
					if( _GRID_X < viewportOffsetRowsCols*0.5) {
						
						
						var nline = (viewportOffsetRowsCols*0.5) - _GRID_X;
							nIndex = currentPlayerIndex-nline;
						
						if(nIndex>=0)
							currentPlayerIndex = nIndex;
						
					}
					
					// RIGHT
					if( _GRID_X > viewportOffsetRowsCols*0.5) {
						
						var nline = _GRID_X - (viewportOffsetRowsCols*0.5);
							nIndex = currentPlayerIndex+nline;
						
						if(nIndex <= maxIndex)
							currentPlayerIndex = nIndex;
					}
					
					//console.dir(viewportMap[_GRID_X][_GRID_Y]);
					bMvtEnable = false;
					bPlayerSelected = false;
					bUpdate = true;
			}
			
			
			// CUT WOOD
			if( ( viewportMap[_GRID_X][_GRID_Y].type == _TILE_TREE 
				|| viewportMap[_GRID_X][_GRID_Y].type == _TILE_TREE_2 
				|| viewportMap[_GRID_X][_GRID_Y].type == _TILE_TREE_3 ) 
				&& viewportWoodAxeMap[_GRID_X][_GRID_Y] == 2
				&& bWoodHaxe 
				&& notPlayerGrid(_GRID_X, _GRID_Y) ){
					
					if( _TILES_MAP[viewportMap[_GRID_X][_GRID_Y].x][viewportMap[_GRID_X][_GRID_Y].y].wood > 0 ) {
						
						_TILES_MAP[viewportMap[_GRID_X][_GRID_Y].x][viewportMap[_GRID_X][_GRID_Y].y].wood--;
						bWoodHaxe = false;
						
						if(_TILES_MAP[viewportMap[_GRID_X][_GRID_Y].x][viewportMap[_GRID_X][_GRID_Y].y].wood==0){
						
							_TILES_MAP[viewportMap[_GRID_X][_GRID_Y].x][viewportMap[_GRID_X][_GRID_Y].y].type = _TILE_GRASS;
							bUpdate = true;
						}
					}
			}
			
		}
		
		
		
		for (key in buttons) {	
			if( _GRID_X >= buttons[key].position.x 
				&& _GRID_X < buttons[key].position.x + (buttons[key].width) 
				&& _GRID_Y >= buttons[key].position.y 
				&& _GRID_Y < buttons[key].position.y + (buttons[key].height) ){
					
				if( key == 'move' && bPlayerSelected ){
					// Disable other actions
					bWoodHaxe = false;
					
					bMvtEnable = !bMvtEnable;
					bUpdate = true;
				}
				
				if( key == 'axe' && bPlayerSelected ){
					// Disable other actions
					bMvtEnable = false;
					
					bWoodHaxe = !bWoodHaxe;
					bUpdate = true;
				}

			}
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

function notPlayerGrid(x, y){

	if(_GRID_X == viewportOffsetRowsCols*0.5 && _GRID_Y == viewportOffsetRowsCols*0.5){
		return false;
	}else{
		return true;
	}

}

function handleMove(x, y) {
	//console.log("handleMove:" + x + " " + y);
}


