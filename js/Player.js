/* ------------------------------------------------------------------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------------------------------------------------------- */
var Player = function(type, team){
	
	this.index = 0;
	this.team = team || 0;
	this.alive = true;
	this.life = 4;
	this.mana = 0;
	this.xp = 0;
	this.gender = 0;
	this.attack = 0;
	this.range_attack = (Math.random()*2<<0)+1;
	this.defense = 0;
	this.armor = 0;
	this.dexterity = 0;
	this.x = 0;
	this.y = 0;
	this.map_index = 0;
	this.type = type || 0;
	this.moves = 20;
	this.currentmoves = 0;
	this.wood = 500;
	this.rock = 0;
	this.cuivre = 0;
	this.fer = 0;
	this.or = 500;

}