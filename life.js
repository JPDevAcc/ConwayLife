// Author: James Percival (with tests adapted from group-work with James Mcdonald)
// Simple implementation of Conway's Game Of Life

const cellCols = 48 ;
const cellRows = 48 ;
let cellsOldGen = [] ;
let cellsNewGen = [] ;
const getCellState = getCellStateWrapped ;
createCellDivs() ;

const numFailed = runTests();
if (numFailed > 0) alert("Tests failed:" + numFailed) ;
else alert("All tests passed") ;

// Random setup of initial state and render it
randomInit(cellsNewGen) ;
render(cellsNewGen) ;

// Calculate new generations and render
setInterval(() => {
	nextGen() ;
	render(cellsNewGen) ;
}, 100) ;

function createCellDivs() {
	for (let y = 0; y < cellRows; y++) {
		for (let x = 0; x < cellCols; x++) {
			const cell = document.createElement('div') ;
			cell.className = 'cell' ;
			document.getElementById('cells').appendChild(cell) ;
		}
	}
}

function setRenderedCellState(x, y, state) {
	document.getElementById('cells').children[x + y * cellCols].classList.toggle('live', state) ;
}

function zeroInit(cellsArray) {
	for (let x = 0; x < cellCols; x++) {
		for (let y = 0; y < cellRows; y++) {
			cellsArray[x + y * cellCols] = 0 ;
		}
	}
}

function randomInit(cellsArray) {
	for (let x = 0; x < cellCols; x++) {
		for (let y = 0; y < cellRows; y++) {
			const state = Math.random() >= 0.5 ;
			cellsArray[x + y * cellCols] = state ;
		}
	}
}

function nextGen() {
	// 'New' generation becomes 'old' generation, and new array for the 'new' generation
	cellsOldGen = cellsNewGen ;
	cellsNewGen = [] ;

	// Create the new generation
	for (let x = 0; x < cellCols; x++) {
		for (let y = 0; y < cellRows; y++) {
			const liveNeighbours = countLiveNeighbours(cellsOldGen, x, y) ;
			const oldState = cellsOldGen[x + y * cellCols] ;
			cellsNewGen[x + y * cellCols] = transition(oldState, liveNeighbours) ;
		}
	}
}

function countLiveNeighbours(cellsArray, xo, yo, getCellStateFunc) {
	let liveCount = 0 ;
	for (let x = xo - 1; x <= xo + 1; x++) {
		for (let y = yo - 1; y <= yo + 1; y++) {
			if (x !== xo || y !== yo) {
				liveCount += getCellState(cellsArray, x, y) ;
			}
		}
	}
	return liveCount ;
}

function transition(oldState, liveNeighbours) {
	if (oldState) return (liveNeighbours === 2 || liveNeighbours === 3) ? 1 : 0; // Lonely < 2, Survives 2-3, Overcrowded > 3
	else return (liveNeighbours === 3) ? 1 : 0; // Birth with 3 only
}

function getCellStateDeadOutsideField(cellsArray, x, y) {
	if (x < 0 || y < 0 || x >= cellCols || y >= cellRows) return false ; // Treat cells outside the field as dead
	return cellsArray[x + y * cellCols] ;
}

function getCellStateWrapped(cellsArray, x, y) {
	// Wrap coords
	if (x < 0) x += cellCols ;
	else if (x >= cellCols) x -= cellCols ;
	if (y < 0) y += cellRows ;
	else if (y >= cellRows) y -= cellRows ; 
	return cellsArray[x + y * cellCols] ;
}

function render(cellsArray) {
	for (let x = 0; x < cellCols; x++) {
		for (let y = 0; y < cellRows; y++) {
			const state = cellsArray[x + y * cellCols] ;
			setRenderedCellState(x, y, state) ;
		}
	}
}

// ----------

function runTests() {
	const testCases = [
			{
					cell: 1,
					neighbors: [0, 1, 0]
			},
			{
					cell: 0,
					neighbors: [1, 1, 1]
			},
			{
					cell: 1,
					neighbors: [0, 0, 1]
			},
			{
					cell: 0,
					neighbors: [1, 0, 0]
			},
			{
					cell: 1,
					neighbors: [0, 1, 1]
			},
			{
					cell: 1,
					neighbors: [1, 1, 1, 1]
			}
	]

	let numFailed = 0 ;
  numFailed += expect("live cell should die from loneliness with only one live neighbour", checker(testCases[0]), 0)
	numFailed += expect("dead cell should become alive (birth) with three live neighbours", checker(testCases[1]), 1) ;
	numFailed += expect("live cell should die from loneliness with only one live neighbour", checker(testCases[2]), 0) ;
	numFailed += expect("dead cell should remain dead with only one live neighbour", checker(testCases[3]), 0) ;
	numFailed += expect("live cell should remain alive (survival) with two live neighbours", checker(testCases[4]), 1) ;
	numFailed += expect("live cell should die (overcrowding) with four live neighbours ", checker(testCases[5]), 0) ;

	return numFailed ;
}

function expect(test, val, expected) {
	if (val === expected) console.log(test + ' : OK') ;
	else console.log(test + ' : FAILED') ;

	return (val === expected) ? 0 : 1 ;
}

function checker(testCase) {
	zeroInit(cellsNewGen) ;
	cellsNewGen[0 + 0 * cellCols] = testCase.neighbors[0] ; // (0, 0)
	cellsNewGen[1 + 0 * cellCols] = testCase.neighbors[1] ; // (0, 1)
	cellsNewGen[2 + 0 * cellCols] = testCase.neighbors[2] ; // (0, 2)
	cellsNewGen[0 + 1 * cellCols] = testCase.neighbors[3] || 0 ; // (1, 0)
	cellsNewGen[1 + 1 * cellCols] = testCase.cell ; // (1, 1)
	nextGen() ;
	return cellsNewGen[1 + 1 * cellCols] ;
}