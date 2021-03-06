/* ------------------------------------------------------------------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------------------------------------------------------- */
// http://www.spriters-resource.com/

sprites_img.onload = function(){
	
	sprites[_TILE_WATER] = makeSprite(18,2, false);
	sprites[_TILE_SAND] = makeSprite(19,2, false);
	sprites[_TILE_GRASS] = makeSprite(19,3, false);
	sprites[_TILE_GRASS_MEDIUM] = makeSprite(4,1, false);
	sprites[_TILE_GRASS_HARD] = makeSprite(3,1, false);
	sprites[_TILE_TREE] = makeSprite(1,6, false);
	sprites[_TILE_TREE_3] = makeSprite(2,6, false);
	sprites[_TILE_TREE_2] = makeSprite(3,6, false);
	sprites[_TILE_EMPTY] = makeSprite(7,0, false);
	sprites[_TILE_COLOR_WATER] = makeSprite(0,0, false); // water color
	sprites[_TILE_COLOR_SAND] = makeSprite(2,0, false); // sand color
	sprites[_TILE_COLOR_GRASS] = makeSprite(0,1, false); // grass color
	sprites[_TILE_PLAYER] = makeSprite(0,3, false);
	sprites[_TILE_PLAYER_1] = makeSprite(10,4, false);
	sprites[_TILE_MOVES] = makeSprite(4,0, true); // moves
	sprites[_TILE_SELECTED] = makeSprite(5,0, false); // selected
	sprites[_TILE_AXE] = makeSprite(6,3, false); // hache
	sprites[_TILE_ATTACK] = makeSprite(11,4, false); // attack
	sprites[_TILE_HAMMER] = makeSprite(12,4, false); // marteau
	sprites[_TILE_HOUSE] = makeSprite(13,4, false); // Maison
	sprites[_TILE_FARM] = makeSprite(14,4, false); // Ferme
	sprites[_TILE_SAWMILL] = makeSprite(15,4, false); // Scierie
	sprites[_TILE_STONE_QUARRY] = makeSprite(16,4, false); // Mine
	sprites[_TILE_CONFIRM] = makeSprite(7,1, false); // confirm
	sprites[_TILE_CANCEL] = makeSprite(5,1, false); // cancel
	
	sprites[_TILE_GOLD] = makeSprite(8,1, false); // 
	sprites[_TILE_WOOD] = makeSprite(9,1, false); // 
	sprites[_TILE_WHEAT] = makeSprite(11,1, false); // 
	sprites[_TILE_BRICK] = makeSprite(10,1, false); // 
	
	
	sprites[_TILE_PANEL] = makePanel(10,11,160,80);
	
	terrainGeneration();
	
};

sprites_img.setAttribute('crossOrigin','anonymous');
















