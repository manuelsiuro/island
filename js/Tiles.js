/* ------------------------------------------------------------------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------------------------------------------------------- */
var Tile = function(type){
	
	this.index = 0;
	this.visited = false;
	this.flip = false;
	this.x = 0;
	this.y = 0;
	this.colorFill = {r : 0, g : 0, b : 0};
	this.type = type;
	//this.wood = getRandomInt(0, 30);
	//this.wood = Math.random()*4<<0;
	this.wood = 0;
	this.rock = 0;
	this.cuivre = 0;
	this.fer = 0;
	this.or = 0;
	this.population = 0;

}