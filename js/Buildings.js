/* ------------------------------------------------------------------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------------------------------------------------------- */
var Buildings = function(type, team){
	
	this.index = 0;
	this.type = type || 0;
	this.team = team || 0;
	this.name = "";
	this.description = "";
	this.alive = true;
	this.life = 4;
	this.attack = 0;
	this.range_attack = (Math.random()*2<<0)+1;
	this.defense = 0;
	this.armor = 0;
	
	this.x = 0;
	this.y = 0;
	this.map_index = 0;
	
	this.cost = {
		or: 2,
		wood: 2
	};

}