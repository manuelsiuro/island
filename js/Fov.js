/* ------------------------------------------------------------------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------------------------------------------------------- */
function getSlope( x1, y1, x2, y2 ) {
	return (x1 - x2) / (y1 - y2);
}

function getInvSlope( x1, y1, x2, y2 ) {
	return (y1 - y2) / (x1 - x2);
}

function cellSanity(x, y) {
	if ( x < 0 ) return false;
	if ( x >= viewportRowsCols ) return false;
	if ( y < 0 ) return false;
	if ( y >= viewportRowsCols ) return false;	
	return true;
}

function getDist(x1, y1, x2, y2) {
	return Math.round(Math.sqrt( Math.pow((x1-x2),2) + Math.pow((y1-y2),2) ));
}

function checkNWquad( world, px, py, maxDist, startSlope, endSlope, distance ) {
	//console.dir(world);
	if ( distance > maxDist ) return false;
	var y = py - distance;
	var x = Math.round(px - startSlope * distance);
	var lastBlocked = false;
	//console.log( "Starting NW scan.. startSlope: "+startSlope+", endSlope: "+endSlope+", distance: "+distance+", x:"+x+", y:"+y );	
	while ( getSlope(x, y, px, py) >= endSlope ) {
		if ( cellSanity(x,y) && getDist(x, y, px, py ) <= maxDist ) {
			if ( world[x][y] == 1 ) {
				if ( cellSanity(x-1,y) && world[x-1][y] == 0 ) {
					//console.log("Creating sub NW scan with startSlope of "+startSlope+" and endSlope of "+getSlope(x-0.5,y+0.5,px,py));
					checkNWquad( world, px, py, maxDist, startSlope, getSlope(x-0.5, y+0.5,px,py), distance+1);
				}
				lastBlocked = true;
			} else {
				if ( cellSanity(x-1,y) && world[x-1][y] == 1 ) {
					startSlope = getSlope(x-0.5,y-0.5,px,py);
				}
				world[x][y] = 2;
				
				lastBlocked = false;
			}
		}
		x++;
	}				
	if ( lastBlocked == false ) checkNWquad( world, px, py, maxDist, startSlope, endSlope, distance+1 );
}

function checkNEquad( world, px, py, maxDist, startSlope, endSlope, distance ) {
	if ( distance > maxDist ) return false;
	var y = py - distance;
	var x = Math.round(px + startSlope * distance);
	var lastBlocked = false;
	//console.log( "Starting NE scan.. startSlope: "+startSlope+", endSlope: "+endSlope+", distance: "+distance+", x:"+x+", y:"+y );				
	while ( getSlope(x, y, px, py) <= endSlope ) {
		if ( cellSanity(x,y) && getDist(x, y, px, py ) <= maxDist ) {
			if ( world[x][y] == 1 ) {
				if ( cellSanity(x+1,y) && world[x+1][y] == 0 ) {
					checkNEquad( world, px, py, maxDist, startSlope, getSlope(x+0.5, y+0.5,px,py), distance+1);
				}
				lastBlocked = true;
			} else {
				if ( cellSanity(x+1,y) && world[x+1][y] == 1 ) {
					startSlope = -getSlope(x+0.5,y-0.5,px,py);
				}
				world[x][y] = 2;
				
				lastBlocked = false;
			}
		}
		x--;
	}				
	if ( lastBlocked == false ) checkNEquad( world, px, py, maxDist, startSlope, endSlope, distance+1 );
}			

function checkENquad( world, px, py, maxDist, startSlope, endSlope, distance ) {
	if ( distance > maxDist ) return false;
	var x = px + distance;
	var y = Math.round(py - startSlope * distance);
	var lastBlocked = false;
	//console.log( "Starting EN scan.. startSlope: "+startSlope+", endSlope: "+endSlope+", distance: "+distance+", x:"+x+", y:"+y );				
	while ( getInvSlope(x, y, px, py) <= endSlope ) {
		if ( cellSanity(x,y) && getDist(x, y, px, py ) <= maxDist ) {
			if ( world[x][y] == 1 ) {
				if ( cellSanity(x,y-1) && world[x][y-1] == 0 ) {
					checkENquad( world, px, py, maxDist, startSlope, getInvSlope(x-0.5, y-0.5,px,py), distance+1);
				}
				lastBlocked = true;
			} else {
				if ( cellSanity(x,y-1) && world[x][y-1] == 1 ) {
					startSlope = -getInvSlope(x+0.5,y-0.5,px,py);
				}
				world[x][y] = 2;
				
				lastBlocked = false;
			}
		}
		y++;
	}				
	if ( lastBlocked == false ) checkENquad( world, px, py, maxDist, startSlope, endSlope, distance+1 );
}			

function checkESquad( world, px, py, maxDist, startSlope, endSlope, distance ) {
	if ( distance > maxDist ) return false;
	var x = px + distance;
	var y = Math.round(py + startSlope * distance);
	var lastBlocked = false;
	//console.log( "Starting ES scan.. startSlope: "+startSlope+", endSlope: "+endSlope+", distance: "+distance+", x:"+x+", y:"+y );				
	while ( getInvSlope(x, y, px, py) >= endSlope ) {
		if ( cellSanity(x,y) && getDist(x, y, px, py ) <= maxDist ) {
			if ( world[x][y] == 1 ) {
				if ( cellSanity(x,y+1) && world[x][y+1] == 0 ) {
					checkESquad( world, px, py, maxDist, startSlope, getInvSlope(x-0.5, y+0.5,px,py), distance+1);
				}
				lastBlocked = true;
			} else {
				if ( cellSanity(x,y+1) && world[x][y+1] == 1 ) {
					startSlope = getInvSlope(x+0.5,y+0.5,px,py);
				}
				world[x][y] = 2;
				
				lastBlocked = false;
			}
		}
		y--;
	}				
	if ( lastBlocked == false ) checkESquad( world, px, py, maxDist, startSlope, endSlope, distance+1 );
}			

function checkSEquad( world, px, py, maxDist, startSlope, endSlope, distance ) {
	if ( distance > maxDist ) return false;
	var y = py + distance;
	var x = Math.round(px + startSlope * distance);
	var lastBlocked = false;
	//console.log( "Starting SE scan.. startSlope: "+startSlope+", endSlope: "+endSlope+", distance: "+distance+", x:"+x+", y:"+y );				
	while ( getSlope(x, y, px, py) >= endSlope ) {
		if ( cellSanity(x,y) && getDist(x, y, px, py ) <= maxDist ) {
			if ( world[x][y] == 1 ) {
				if ( cellSanity(x+1,y) && world[x+1][y] == 0 ) {
					checkSEquad( world, px, py, maxDist, startSlope, getSlope(x+0.5, y-0.5,px,py), distance+1);
				}
				lastBlocked = true;
			} else {
				if ( cellSanity(x+1,y) && world[x+1][y] == 1 ) {
					startSlope = getSlope(x+0.5,y+0.5,px,py);
				}
				world[x][y] = 2;
				
				lastBlocked = false;
			}
		}
		x--;
	}			
	if ( lastBlocked == false ) checkSEquad( world, px, py, maxDist, startSlope, endSlope, distance+1 );
}

function checkSWquad( world, px, py, maxDist, startSlope, endSlope, distance ) {
	if ( distance > maxDist ) return false;
	var y = py + distance;
	var x = Math.round(px - startSlope * distance);
	var lastBlocked = false;
	//console.log( "Starting SE scan.. startSlope: "+startSlope+", endSlope: "+endSlope+", distance: "+distance+", x:"+x+", y:"+y );				
	while ( getSlope(x, y, px, py) <= endSlope ) {
		if ( cellSanity(x,y) && getDist(x, y, px, py ) <= maxDist ) {
			if ( world[x][y] == 1 ) {
				if ( cellSanity(x-1,y) && world[x-1][y] == 0 ) {
					checkSWquad( world, px, py, maxDist, startSlope, getSlope(x-0.5, y-0.5,px,py), distance+1);
				}
				lastBlocked = true;
			} else {
				if ( cellSanity(x-1,y) && world[x-1][y] == 1 ) {
					startSlope = -getSlope(x-0.5,y+0.5,px,py);
				}
				world[x][y] = 2;
				
				lastBlocked = false;
			}
		}
		x++;
	}			
	if ( lastBlocked == false ) checkSWquad( world, px, py, maxDist, startSlope, endSlope, distance+1 );
}	

function checkWSquad( world, px, py, maxDist, startSlope, endSlope, distance ) {
	if ( distance > maxDist ) return false;
	var x = px - distance;
	var y = Math.round(py + startSlope * distance);
	var lastBlocked = false;
	var startY = y;
	//console.log( "Starting WS scan.. startSlope: "+startSlope+", endSlope: "+endSlope+", distance: "+distance+", x:"+x+", y:"+y );				
	while ( getInvSlope(x, y, px, py) <= endSlope ) {
		//console.log( "x: "+x+", y: "+y );
		if ( cellSanity(x,y) && getDist(x, y, px, py ) <= maxDist ) {
			if ( world[x][y] == 1 ) {
				if ( cellSanity(x,y+1) && world[x][y+1] == 0 ) {
					checkWSquad( world, px, py, maxDist, startSlope, getInvSlope(x+0.5, y+0.5,px,py), distance+1);
				}
				lastBlocked = true;
			} else {
				if ( cellSanity(x,y+1) && world[x][y+1] == 1 ) {
					if ( y != startY ) {
						startSlope = -getInvSlope(x-0.5,y+0.5,px,py);
						//console.log("This cell not blocked, but last was.. new startslope: "+startSlope );
					}
				}
				world[x][y] = 2;
				
				lastBlocked = false;
			}
		}
		y--;
	}			
	if ( lastBlocked == false ) checkWSquad( world, px, py, maxDist, startSlope, endSlope, distance+1 );
}	


function checkWNquad( world, px, py, maxDist, startSlope, endSlope, distance ) {
	if ( distance > maxDist ) return false;
	var x = px - distance;
	var y = Math.round(py - startSlope * distance);
	var lastBlocked = false;
	//console.log( "Starting SE scan.. startSlope: "+startSlope+", endSlope: "+endSlope+", distance: "+distance+", x:"+x+", y:"+y );				
	while ( getInvSlope(x, y, px, py) >= endSlope ) {
		if ( cellSanity(x,y) && getDist(x, y, px, py ) <= maxDist ) {
			if ( world[x][y] == 1 ) {
				if ( cellSanity(x,y-1) && world[x][y-1] == 0 ) {
					checkWNquad( world, px, py, maxDist, startSlope, getInvSlope(x+0.5, y-0.5,px,py), distance+1);
				}
				lastBlocked = true;
			} else {
				if ( cellSanity(x,y-1) && world[x][y-1] == 1 ) {
					startSlope = getInvSlope(x-0.5,y-0.5,px,py);
				}
				world[x][y] = 2;
				
				lastBlocked = false;
			}
		}
		y++;
	}			
	if ( lastBlocked == false ) checkWNquad( world, px, py, maxDist, startSlope, endSlope, distance+1 );
}