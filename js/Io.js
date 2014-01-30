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
	var nIndex = 0;
	
	if( event.keyCode == 38 ){
		// UP
		nIndex = players[selectedPlayer].map_index - _MAP_PIXEL_DIMENSION;
		if(nIndex>=0)
			players[selectedPlayer].map_index = nIndex;
			
		bUpdate = true;
		
	} else if( event.keyCode == 39 ){
		// RIGHT
		nIndex = ++players[selectedPlayer].map_index;
		if(nIndex <= maxIndex)
			players[selectedPlayer].map_index = nIndex;
			
		bUpdate = true;

	} else if( event.keyCode == 40 ){
		// DOWN
		nIndex = players[selectedPlayer].map_index + _MAP_PIXEL_DIMENSION;
		if(nIndex <= maxIndex)
			players[selectedPlayer].map_index = nIndex;
			
		bUpdate = true;

	} else if( event.keyCode == 37 ){
		// LEFT
		nIndex = --players[selectedPlayer].map_index;
		if(nIndex>=0)
			players[selectedPlayer].map_index = nIndex;
			
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

	/*
	console.log("x:" + x + " y:" + y);
	console.log("_GRID_X:" + _GRID_X + " _GRID_X:" + _GRID_Y);
	console.log("_TILES_MAP index:" + viewportMap[_GRID_X][_GRID_Y].index);
	console.info("---");
	//return false;*/
	
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
		
		
		
		// Select Player
		if(typeof viewportPlayersMap[_GRID_X][_GRID_Y] != 'undefined'){
			if(viewportPlayersMap[_GRID_X][_GRID_Y] == 2 
				&& !bMvtEnable 
				&& !bWoodHaxe
				&& !bAttack  ){
				
				for(var p = 0; p < players.length; p++ ){
					
					if( players[p].x == viewportMap[_GRID_X][_GRID_Y].x 
						&& players[p].y == viewportMap[_GRID_X][_GRID_Y].y ){
						
						selectedPlayer = p;
						
						if(bPlayerSelected){
							bMvtEnable = false;
							bWoodHaxe = false;
						} else {
							bPlayerSelected = true;	
						}
						
						bUpdate = true;
					}
				}
			}  
		}
		
		// Map Layer move attack cutWood build
		if(typeof viewportMap[_GRID_X][_GRID_Y] != 'undefined'){
			
			
			
			
			//build
			if( viewportBuildMap[_GRID_X][_GRID_Y] == 2
				&& bBuild 
				&& !bPannelBuildVisible 
				&& notPlayerGrid(_GRID_X, _GRID_Y) 
				&& players[selectedPlayer].currentmoves <  players[selectedPlayer].moves ){
					
					//console.log("build");
					
					//bPannelBuildVisible = true;
					
					var positionA = {x: 0, y: -(viewportRowsCols*zoom), rotation: 0};
					var positionB = {x: 0, y: 0, rotation: 0};
					tweenPannelBuild(positionA, positionB, true);
					
					_BUILD_X = _GRID_X;
					_BUILD_Y = _GRID_Y;
					
			}
			
			
			//attack
			if( viewportAttackMap[_GRID_X][_GRID_Y] == 2
				&& bAttack 
				&& notPlayerGrid(_GRID_X, _GRID_Y) 
				&& players[selectedPlayer].currentmoves <  players[selectedPlayer].moves ){
					
					for(var p = 0; p < players.length; p++ ){
						if( players[p].map_index == viewportMap[_GRID_X][_GRID_Y].index
							&& players[p].map_index != players[selectedPlayer].map_index
							&& players[p].team != players[selectedPlayer].team ){
								
								//console.log('=>'+players[p].map_index);
								
								if( players[p].life > 0) {
									players[p].life--;
									players[selectedPlayer].xp++;
									players[selectedPlayer].or += 1;
								} else {
									players[p].alive = false;
									players[selectedPlayer].xp += 10;
									players[selectedPlayer].or += 10;
								}
								
								players[selectedPlayer].currentmoves++;
								bAttack = false;
								bUpdate = true;
						}
					}
					
			}
			
			// MOVE
			if( viewportMap[_GRID_X][_GRID_Y].type != _TILE_TREE 
				&& viewportMap[_GRID_X][_GRID_Y].type != _TILE_TREE_2 
				&& viewportMap[_GRID_X][_GRID_Y].type != _TILE_TREE_3 
				&& viewportMap[_GRID_X][_GRID_Y].type != _TILE_WATER
				&& viewportMovesMap[_GRID_X][_GRID_Y] == 2
				&& bMvtEnable 
				&& notPlayerGrid(_GRID_X, _GRID_Y) 
				&& players[selectedPlayer].currentmoves <  players[selectedPlayer].moves ){
				
					var nIndex = 0;
					var maxIndex = _MAP_PIXEL_DIMENSION*_MAP_PIXEL_DIMENSION;
					var bMoved = false;
					
					// UP
					if( _GRID_Y < viewportOffsetRowsCols*0.5) {
						
						var nline = (viewportOffsetRowsCols*0.5) - _GRID_Y;
							nIndex = players[selectedPlayer].map_index - (_MAP_PIXEL_DIMENSION*nline);
							
						if(nIndex>=0){
							players[selectedPlayer].map_index = nIndex;
							players[selectedPlayer].y -= nline;
							bMoved = true;
						}
					}
					
					// DOWN
					if( _GRID_Y > viewportOffsetRowsCols*0.5) {
						
						var nline = _GRID_Y - (viewportOffsetRowsCols*0.5);
							nIndex = players[selectedPlayer].map_index + (_MAP_PIXEL_DIMENSION*nline);
						
						if(nIndex <= maxIndex) {
							players[selectedPlayer].map_index = nIndex;
							players[selectedPlayer].y += nline;
							bMoved = true;
						}
						
					}
					
					// LEFT
					if( _GRID_X < viewportOffsetRowsCols*0.5) {
						
						
						var nline = (viewportOffsetRowsCols*0.5) - _GRID_X;
							nIndex = players[selectedPlayer].map_index-nline;
						
						if(nIndex>=0) {
							players[selectedPlayer].map_index = nIndex;
							players[selectedPlayer].x -= nline;
							bMoved = true;
						}
						
					}
					
					// RIGHT
					if( _GRID_X > viewportOffsetRowsCols*0.5) {
						
						var nline = _GRID_X - (viewportOffsetRowsCols*0.5);
							nIndex = players[selectedPlayer].map_index+nline;
						
						if(nIndex <= maxIndex) {
							players[selectedPlayer].map_index = nIndex;
							players[selectedPlayer].x += nline;
							bMoved = true;
						}
					}
					
					if(bMoved){
						players[selectedPlayer].currentmoves++;
						bMvtEnable = false;
						bUpdate = true;
					}
						
					
					
			}
			
			
			// Map Layer Cut WOOD
			if( ( viewportMap[_GRID_X][_GRID_Y].type == _TILE_TREE 
				|| viewportMap[_GRID_X][_GRID_Y].type == _TILE_TREE_2 
				|| viewportMap[_GRID_X][_GRID_Y].type == _TILE_TREE_3 ) 
				&& viewportWoodAxeMap[_GRID_X][_GRID_Y] == 2
				&& bWoodHaxe 
				&& notPlayerGrid(_GRID_X, _GRID_Y) 
				&& players[selectedPlayer].currentmoves <  players[selectedPlayer].moves ){
					
					if( _TILES_MAP[viewportMap[_GRID_X][_GRID_Y].x][viewportMap[_GRID_X][_GRID_Y].y].wood > 0 ) {
						
						_TILES_MAP[viewportMap[_GRID_X][_GRID_Y].x][viewportMap[_GRID_X][_GRID_Y].y].wood--;
						players[selectedPlayer].wood++;
						players[selectedPlayer].currentmoves++;
						
						if(_TILES_MAP[viewportMap[_GRID_X][_GRID_Y].x][viewportMap[_GRID_X][_GRID_Y].y].wood==0){
							_TILES_MAP[viewportMap[_GRID_X][_GRID_Y].x][viewportMap[_GRID_X][_GRID_Y].y].type = _TILE_GRASS;
							bWoodHaxe = false;
							bUpdate = true;
						}
						
						if(_TILES_MAP[viewportMap[_GRID_X][_GRID_Y].x][viewportMap[_GRID_X][_GRID_Y].y].wood==1){
							_TILES_MAP[viewportMap[_GRID_X][_GRID_Y].x][viewportMap[_GRID_X][_GRID_Y].y].type = _TILE_TREE;
							bUpdate = true;
						}
						
						if(_TILES_MAP[viewportMap[_GRID_X][_GRID_Y].x][viewportMap[_GRID_X][_GRID_Y].y].wood==2){
							_TILES_MAP[viewportMap[_GRID_X][_GRID_Y].x][viewportMap[_GRID_X][_GRID_Y].y].type = _TILE_TREE_2;
							bUpdate = true;
						}
						
					}
			}
		}
		
		// Pannel button
		for (key in buttons) {	
			if( _GRID_X >= buttons[key].position.x 
				&& _GRID_X < buttons[key].position.x + (buttons[key].width) 
				&& _GRID_Y >= buttons[key].position.y 
				&& _GRID_Y < buttons[key].position.y + (buttons[key].height) ){
					
				if( key == 'move' 
					&& bPlayerSelected
					&& players[selectedPlayer].currentmoves < players[selectedPlayer].moves ){

					// Disable other actions
						bWoodHaxe = false;
						bAttack = false;
						bBuild = false;
						
						bMvtEnable = !bMvtEnable;
						bUpdate = true;
				}
				
				if( key == 'axe' 
					&& bPlayerSelected
					&& players[selectedPlayer].currentmoves < players[selectedPlayer].moves ){

					// Disable other actions
						bMvtEnable = false;
						bAttack = false;
						bBuild = false;
						
						bWoodHaxe = !bWoodHaxe;
						bUpdate = true;
				}
				
				//
				if( key == 'attack' 
					&& bPlayerSelected
					&& players[selectedPlayer].currentmoves < players[selectedPlayer].moves ){

					// Disable other actions
						bMvtEnable = false;
						bWoodHaxe = false;
						bBuild = false;
						
						bAttack = !bAttack;
						bUpdate = true;
				}
				
				if( key == 'build' 
					&& bPlayerSelected
					&& players[selectedPlayer].currentmoves < players[selectedPlayer].moves ){

					// Disable other actions
						bMvtEnable = false;
						bWoodHaxe = false;
						bAttack = false;
						
						bBuild = !bBuild;
						bUpdate = true;
				}
				
				if( key == 'btn_fov' ){
					bFovEnable = !bFovEnable;
					bUpdate = true;
				}
				
				if( key == 'btn_right' ){
					
					var t = selectedPlayer+1;
					
					if( t < players.length ) {
						selectedPlayer++;
						bUpdate = true;
					} else {
						selectedPlayer = 0;
						bUpdate = true;
					}
				}
				
				if( key == 'btn_left' ){

					var t = selectedPlayer-1;
					
					if( t >= 0 ) {
						selectedPlayer--;
						bUpdate = true;
					} else {
						selectedPlayer = players.length-1;
						bUpdate = true;
					}
				}
				
				if( key == 'btn_widget_build_left' ){
					
					console.log('btn_widget_build_left');
					
					if(widgetBuildIndex < buildingsList.length-1){
						var positionA = {x: _WIDGET_BUILD_OFFSET_X, y: _WIDGET_BUILD_OFFSET_Y, rotation: 0};
						var positionB = {x: _WIDGET_BUILD_OFFSET_X-(9*zoom), y: 0, rotation: 0};
						tweenWidgetBuild(positionA, positionB);
						widgetBuildIndex++;
						/**/
						bBuild = true;
						bUpdate = true;
						
					}
				}
				
				if( key == 'btn_widget_build_right' ){
					
					console.log('btn_widget_build_right');
					
					if(widgetBuildIndex > 0){
						var positionA = {x: _WIDGET_BUILD_OFFSET_X, y: _WIDGET_BUILD_OFFSET_Y, rotation: 0};
						var positionB = {x: _WIDGET_BUILD_OFFSET_X+(9*zoom), y: 0, rotation: 0};
						tweenWidgetBuild(positionA, positionB);
						widgetBuildIndex--;
						
						bBuild = true;
						bUpdate = true;
					}
				}
				
				if( key == 'btn_buy_house' ){
					
					/*
					console.log("btn_buy_house");
					console.log("_BUILD_X:"+_BUILD_X);
					console.log("_BUILD_Y:"+_BUILD_Y);
					console.log("_BUILD_Y:"+_BUILD_Y);
					*/
					//alert(widgetBuildIndex);

					if(bPannelBuildVisible){
				
						var positionA = {x: 0, y: -(viewportRowsCols*zoom), rotation: 0};
						var positionB = {x: 0, y: 0, rotation: 0};
						tweenPannelBuild(positionB, positionA, false);
						
						var building = buildingsObjectList[widgetBuildIndex];
						
						//console.dir(building);
						
						if( players[selectedPlayer].or >= building.cost.or 
							&& players[selectedPlayer].wood >= building.cost.wood ){
							
							//viewportMap[_BUILD_X][_BUILD_Y].type = _TILE_HOUSE;
							_TILES_MAP[viewportMap[_BUILD_X][_BUILD_Y].x][viewportMap[_BUILD_X][_BUILD_Y].y].type = buildingsList[widgetBuildIndex];
						
							players[selectedPlayer].currentmoves++;
							players[selectedPlayer].or -= building.cost.or;
							players[selectedPlayer].wood -= building.cost.wood;
						}
						
						_WIDGET_BUILD_OFFSET_X = 0;
						_WIDGET_BUILD_OFFSET_Y = 0;
						
						bPannelBuildVisible = false;
						bBuild = false;
						bUpdate = true;
					}
				}
				
				//btn_cancel_house
				if( key == 'btn_cancel_house' ){
					var positionA = {x: 0, y: -(viewportRowsCols*zoom), rotation: 0};
					var positionB = {x: 0, y: 0, rotation: 0};
					tweenPannelBuild(positionB, positionA, false);
						
					_WIDGET_BUILD_OFFSET_X = 0;
					_WIDGET_BUILD_OFFSET_Y = 0;
					
					bPannelBuildVisible = false;
					bBuild = false;
					bUpdate = true;
				}
				
			}
		}
		
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


