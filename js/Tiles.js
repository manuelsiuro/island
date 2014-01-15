/* ------------------------------------------------------------------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------------------------------------------------------- */
var Tile = function(type){
	
	this.index = 0;
	this.visited = false;
	this.x = 0;
	this.y = 0;
	this.colorFill = {r : 0, g : 0, b : 0};
	this.type = type;
	this.wood = getRandomInt(0, 30);
	this.rock = getRandomInt(0, 30);
	this.cuivre = getRandomInt(0, 20);
	this.fer = getRandomInt(0, 10);
	this.or = getRandomInt(0, 5);
	this.population = getRandomInt(10, 80);

}