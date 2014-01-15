/* ------------------------------------------------------------------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------------------------------------------------------- */

/**
 * Returns a random integer between min and max
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


function listToMatrix(list, elementsPerSubArray) {
    var matrix = [], i, k;

    for (i = 0, k = -1; i < list.length; i++) {
        if (i % elementsPerSubArray === 0) {
            k++;
            matrix[k] = [];
        }

        matrix[k].push(list[i]);
    }

    return matrix;
}


// Setup the map array for use
function create2DArray(d1, d2) {
	var x = new Array(d1),
	i = 0,
	j = 0;

	for (i = 0; i < d1; i += 1) {
		x[i] = new Array(d2);
	}

	for (i=0; i < d1; i += 1) {
		for (j = 0; j < d2; j += 1) {
			x[i][j] = 0;
		}
	}

	return x;
}