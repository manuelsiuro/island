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
	
	var dim = mapDimension/unitSize;
	var save = currentPlayerIndex;
	var nIndex = 0;
	
	if( event.keyCode == 38 ){
		// UP
		nIndex = currentPlayerIndex - dim;
		if(nIndex>=0)
			currentPlayerIndex = nIndex;
		
	} else if( event.keyCode == 39 ){
		// RIGHT
		nIndex = ++currentPlayerIndex;
		if(nIndex <= tiledmap.length)
			currentPlayerIndex = nIndex;

	} else if( event.keyCode == 40 ){
		// DOWN
		nIndex = currentPlayerIndex + dim;
		if(nIndex <= tiledmap.length)
			currentPlayerIndex = nIndex;

	} else if( event.keyCode == 37 ){
		// LEFT
		nIndex = --currentPlayerIndex;
		if(nIndex>=0)
			currentPlayerIndex = nIndex;
	} else if( event.keyCode == 70 ){ // f
		// FOV
		bFovEnable = !bFovEnable;
	} else if( event.keyCode == 77 ){ // m
		// MOVES
		bMvtEnable = !bMvtEnable;
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
	
	gridX = Math.round((x-offsetA)/offsetB);
    gridY = Math.round((y-offsetA)/offsetB);
	//var dim = 9;
	var index = parseInt(gridY)+(parseInt(gridX)*parseInt(viewportRowsCols));
	//var index = parseInt(gridX)+(parseInt(gridY)*parseInt(dim));
	
	
	
	//html += "<p>viewportTileSize:" + viewportTileSize + "</p>";
	//html += "<p>viewportRowsCols:" + viewportRowsCols + "</p>";
	
	html += "<p>xy:" + x + " " + y + "</p>";
	html += "<p>grid:" + gridX + " " + gridY + "</p>";
	html += "<p>local index:" + index + "</p>";
	
	try {

		/*
		pathStart 	= [viewportOffsetRowsCols*0.5,viewportOffsetRowsCols*0.5];
		pathEnd 	= [gridX,gridY];
		currentPath = [];
		
		
		currentPath = findPath(getViewPortCollisionWorld(),pathStart,pathEnd);
		
		console.log(currentPath);
		
		currentPath.shift(); // enleve le premier qui est le point de depart
		//astarFadeStep = currentPath.length;
		console.log(currentPath);
		*/
		//setFovCollisionWorld(world, gridX, gridY);
		
		
		// Test if center of grid, if true it's current selected player
		if ( gridX == viewportOffsetRowsCols*0.5 && gridY == viewportOffsetRowsCols*0.5){
			
			bPlayerSelected = !bPlayerSelected;
			bMvtEnable = !bMvtEnable;
			
		} 
		
		
		if( viewportMap[index].type != _TILE_TREE 
			&& viewportMap[index].type != _TILE_WATER
			&& viewportMovesMap[gridX][gridY] == 2
			&& bMvtEnable ){
			
				currentPlayerIndex = viewportMap[index].index;
				bUpdate = true;
		}
		
		if( !bMvtEnable ){
			
			console.log(html);

		}
		
		// On est dans le panel
		if(gridY >= viewportRowsCols ){
			bUpdate = true;
		}
		
		
		/*html += "<p>population:" + viewportMap[index].population + " <a class='plus-population button'>+</a></p>";
		html += "<p>map index:<span id='tile-index'>" + viewportMap[index].index + "</span></p>";
		html += "<p>tiledmap:" + getTileName(viewportMap[index].type) + "</p>";
		html += "<p>wood:" + viewportMap[index].wood + "</p>";
		html += "<p>rock:" + viewportMap[index].rock + "</p>";
		html += "<p>cuivre:" + viewportMap[index].cuivre + "</p>";
		html += "<p>fer:" + viewportMap[index].fer + "</p>";
		html += "<p>or:" + viewportMap[index].or + "</p>";*/
		
		
	}catch(err){}
	
	//$("#output").html(html);
}

function handleMove(x, y) {
	//console.log("handleMove:" + x + " " + y);
}


