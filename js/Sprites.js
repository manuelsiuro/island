/* ------------------------------------------------------------------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------------------------------------------------------- */


sprites_img.onload = function(){
	
	sprites[_TILE_WATER] = makeSprite(18,2, false);
	sprites[_TILE_SAND] = makeSprite(19,2, false);
	sprites[_TILE_GRASS] = makeSprite(19,3, false);
	
	sprites[_TILE_GRASS_MEDIUM] = makeSprite(4,1, false);
	sprites[_TILE_GRASS_HARD] = makeSprite(3,1, false);
	sprites[_TILE_TREE] = makeSprite(1,6, false);
	sprites[_TILE_EMPTY] = makeSprite(7,0, false);
	
	sprites[7] = makeSprite(0,0, false); // water color
	sprites[8] = makeSprite(2,0, false); // sand color
	sprites[9] = makeSprite(0,1, false); // grass color
	
	sprites[_TILE_PLAYER] = makeSprite(0,3, true); // grass color
	sprites[_TILE_MOVES] = makeSprite(4,0, true); // moves
	sprites[_TILE_SELECTED] = makeSprite(5,0, true); // selected
	sprites[_TILE_PANEL] = makePanel(10,11,160,80);
	
	terrainGeneration();
	
};

sprites_img.setAttribute('crossOrigin','anonymous');


