//variables and constants
const algorithmSelector = document.getElementsByClassName("algorithm-selector-bubble")[0];
const container = document.getElementsByClassName("container")[0];
var algorithmType;
var animationRunning = false;
var grid = [];
var startIndex = null;
var endIndex = null;

window.onload = function() {
	//initialize algortihm type
	changeAlgorithmType("bfs");
	newMaze();
}

//change algorithm type
function changeAlgorithmType(s) {
	if(animationRunning) {
		alert("Path finding algorithm is running!");
		return;
	}

	algorithmType = s;

	//update selector
	const active = document.getElementById(s);
	const coords = active.getBoundingClientRect();
	const directions = {
		height: coords.height,
		width: coords.width,
		top: coords.top,
		left: coords.left
	};

	algorithmSelector.style.setProperty("left", `${directions.left}px`);
	algorithmSelector.style.setProperty("width", `${directions.width}px`);
	algorithmSelector.style.setProperty("height", `${directions.height}px`);
	algorithmSelector.style.setProperty("top", `${directions.top}px`);
}

//index based set
function getSetValueByIndex(setObj, index) {
    return [...setObj][index]
}

//select point for starting/ending
function selectPoint(r, c) {
	if(animationRunning) {
		alert("Path finding algorithm is running!");
		return;
	}

	if(grid[r][c] == 1) {
		return;
	}

	if(startIndex == null) {
		//select start
		document.getElementById(`${r * 40 + c}`).innerHTML = "⚑";
		startIndex = {r: r, c: c};
	}
	else if(endIndex == null) {
		//select end
		document.getElementById(`${r * 40 + c}`).innerHTML = "⚐";
		endIndex = {r: r, c: c};
	}
}

//generate new maze
function newMaze() {
	if(animationRunning) {
		alert("Path finding algorithm is running!");
		return;
	}

	reset();

	//init grid
	for(let i = 0; i < 24; i++) {
		let temp = [];
		for(let j = 0; j < 40; j++) {
			temp.push(1);
		}
		grid.push(temp);
	}

	//generate html elements
	for(let i = 0; i < 24; i++) {
		let temp = "";
		for(let j = 0; j < 40; j++) {
			if(!(i == 23 || j == 39))
				temp += `<div id="${i * 40 + j}" class="grid-cell" onclick="selectPoint(${i}, ${j})"></div>`;
		}
		container.innerHTML += temp;
	}

	//generate maze grid with prim's algorithm
	let randomC = Math.floor(Math.random() * 18);
	randomC = 2 * randomC + 1;
	let randomR = Math.floor(Math.random() * 11);
	randomR = 2 * randomR + 1;

	grid[randomR][randomC] = 0;

	//add neighbors to set
	let gridSet = new Set();
	if(randomR - 2 > 0)
		gridSet.add({r: randomR - 2, c: randomC, d: "bottom"});
	if(randomR + 2 < 23)
		gridSet.add({r: randomR + 2, c: randomC, d: "top"});
	if(randomC - 2 > 0)
		gridSet.add({r: randomR, c: randomC - 2, d: "right"});
	if(randomC + 2 < 39)
		gridSet.add({r: randomR, c: randomC + 2, d: "left"});

	//while there are neighbors
	while(gridSet.size > 0) {
		//select random from walls
		let randomNeighborIndexes = getSetValueByIndex(gridSet, Math.floor(Math.random() * gridSet.size));

		//change to passage 
		let r = randomNeighborIndexes.r;
		let c = randomNeighborIndexes.c;
		let connection = randomNeighborIndexes.d;

		//update connection
		if(connection == "top")
			grid[r - 1][c] = 0;
		else if(connection == "bottom")
			grid[r + 1][c] = 0;
		else if(connection == "left")
			grid[r][c - 1] = 0;
		else if(connection == "right")
			grid[r][c + 1] = 0;

		grid[r][c] = 0;

		//put its unvisited neighbors into the list
		if(r - 2 > 0 && grid[r - 2][c] == 1) {
			gridSet.add({r: r - 2, c: c, d: "bottom"});
			grid[r - 2][c] = 2;
		}
		if(r + 2 < 23 && grid[r + 2][c] == 1) {
			gridSet.add({r: r + 2, c: c, d: "top"});
			grid[r + 2][c] = 2;
		}
		if(c - 2 > 0 && grid[r][c - 2] == 1) {
			gridSet.add({r: r, c: c - 2, d: "right"});
			grid[r][c - 2] = 2;
		}
		if(c + 2 < 39 && grid[r][c + 2] == 1) {
			gridSet.add({r: r, c: c + 2, d: "left"});
			grid[r][c + 2] = 2;
		}		

		//remove from walls list
		gridSet.delete(randomNeighborIndexes);
	}


	//update html elements based on grid
	for(let i = 0; i < 24; i++) {
		for(let j = 0; j < 40; j++) {
			if(grid[i][j] == 0) {
				document.getElementById(`${i * 40 + j}`).style.setProperty("background", "white");
			}
		}
	}
}

//reset the previous grid
function reset() {
	container.innerHTML = "";
	grid = [];
	startIndex = null;
	endIndex = null;
}

//runs the algorithm
function runGo() {
	if(animationRunning) {
		alert("Path finding algorithm is running!");
		return;
	}

	if(startIndex == null && endIndex == null) {
		alert("Select Start and End first!");
		return;
	}
	animationRunning = true;
	eval(algorithmType + "()");	
}

//change color in maze
async function changeColor(r, c, s, d) {
	return new Promise(resolve => {
		document.getElementById(`${r * 40 + c}`).style.setProperty("background", s);
		window.requestAnimationFrame(function() {
			setTimeout(() => {
				resolve();
			}, d);
		});
	});
}

//bfs path finding algorithm
async function bfs() {
	p = [];
	p.push(startIndex);
	let q = [{vertex: startIndex, path: p}];
	let result = null;
	let found = false;

	while(q.length > 0 && !found) {
		let temp = q.shift();
		grid[temp.vertex.r][temp.vertex.c] = 2;
		//change color
		await changeColor(temp.vertex.r, temp.vertex.c, "orange", 100);

		//get neighbors
		let neighbors = [];
		if(grid[temp.vertex.r - 1][temp.vertex.c] == 0)
			neighbors.push({r: temp.vertex.r - 1, c: temp.vertex.c});
		if(grid[temp.vertex.r + 1][temp.vertex.c] == 0)
			neighbors.push({r: temp.vertex.r + 1, c: temp.vertex.c});
		if(grid[temp.vertex.r][temp.vertex.c - 1] == 0)
			neighbors.push({r: temp.vertex.r, c: temp.vertex.c - 1});
		if(grid[temp.vertex.r][temp.vertex.c + 1] == 0)
			neighbors.push({r: temp.vertex.r, c: temp.vertex.c + 1});

		//for each neighbor
		for(n of neighbors) {
			if(n.r == endIndex.r && n.c == endIndex.c) {
				//change color
				await changeColor(n.r, n.c, "orange", 100);

				found = true;
				result = temp.path;
				result.push(endIndex);
			}
			else {
				let newPath = [];
				//copy path to new path
				for(let i = 0; i < temp.path.length; i++) {
					newPath.push(temp.path[i]);
				}
				newPath.push(n);
				q.push({vertex: n, path: newPath});
			}
		}
	}
	for(let i = 0; i < result.length; i++) {
		await changeColor(result[i].r, result[i].c, "green", 50);
	}
	animationRunning = false;
}

//dfs path finding algorithm
async function dfs() {
	p = [];
	p.push(startIndex);
	let stack = [{vertex: startIndex, path: p}];
	let result = null;
	let found = false;

	while(stack.length > 0 && !found) {
		let temp = stack.pop();
		if(grid[temp.vertex.r][temp.vertex.c] == 0) {
			if(temp.vertex.r == endIndex.r && temp.vertex.c == endIndex.c) {
				//change color
				await changeColor(n.r, n.c, "orange", 100);
				found = true;
				result = temp.path;				
				continue;
			}
			grid[temp.vertex.r][temp.vertex.c] = 2;
			//change color
			await changeColor(temp.vertex.r, temp.vertex.c, "orange", 100);

			//get neighbors
			let neighbors = [];
			if(grid[temp.vertex.r - 1][temp.vertex.c] == 0)
				neighbors.push({r: temp.vertex.r - 1, c: temp.vertex.c});
			if(grid[temp.vertex.r + 1][temp.vertex.c] == 0)
				neighbors.push({r: temp.vertex.r + 1, c: temp.vertex.c});
			if(grid[temp.vertex.r][temp.vertex.c - 1] == 0)
				neighbors.push({r: temp.vertex.r, c: temp.vertex.c - 1});
			if(grid[temp.vertex.r][temp.vertex.c + 1] == 0)
				neighbors.push({r: temp.vertex.r, c: temp.vertex.c + 1});

			//for each neighbor
			for(n of neighbors) {
				let newPath = [];
				//copy path to new path
				for(let i = 0; i < temp.path.length; i++) {
					newPath.push(temp.path[i]);
				}
				newPath.push(n);
				stack.push({vertex: n, path: newPath});
			}
		}
	}
	for(let i = 0; i < result.length; i++) {
		await changeColor(result[i].r, result[i].c, "green", 50);
	}
	animationRunning = false;
}

//dijkstras algorithm
async function dijkstra() {
	//initialize distance ande parent arrays
	let dist = [];
	let prev = [];
	for(let i = 0; i < 24; i++) {
		let tempDist = [];
		let tempPrev = [];
		for(let j = 0; j < 40; j++) {
			tempDist.push(Infinity);
			tempPrev.push(null);
		}
		dist.push(tempDist);
		prev.push(tempPrev);
	}

	//start distance is 0
	dist[startIndex.r][startIndex.c] = 0;

	//while end not found
	let found = false;
	while(!found) {
		//finding vertex with min distance
		let minR = null;
		let minC = null;
		let min = Infinity;
		for(let i = 0; i < 24; i++) {
			for(let j = 0; j < 40; j++) {
				if(dist[i][j] < min && grid[i][j] == 0) {
					min = dist[i][j];
					minR = i;
					minC = j;
				}
			}
		}

		grid[minR][minC] = 2;
		//change color
		await changeColor(minR, minC, "orange", 100);

		//if end found
		if(endIndex.r == minR && endIndex.c == minC) {
			found = true;
			continue;
		}

		//get all neighbors
		let neighbors = [];
		if(grid[minR - 1][minC] == 0)
			neighbors.push({r: minR - 1, c: minC});
		if(grid[minR + 1][minC] == 0)
			neighbors.push({r: minR + 1, c: minC});
		if(grid[minR][minC - 1] == 0)
			neighbors.push({r: minR, c: minC - 1});
		if(grid[minR][minC + 1] == 0)
			neighbors.push({r: minR, c: minC + 1});

		//for each neighbor
		for(n of neighbors) {
			let alt = dist[minR][minC] + 1;
			if(alt < dist[n.r][n.c]) {
				dist[n.r][n.c] = alt;
				prev[n.r][n.c] = {r: minR, c: minC};
			}
		}
	}
	//drawing path with green
	result = [];
	let resultR = endIndex.r;
	let resultC = endIndex.c;
	while(resultR != startIndex.r || resultC != startIndex.c) {
		result.push({r: resultR, c: resultC});
		let tr = prev[resultR][resultC].r;
		let tc = prev[resultR][resultC].c;
		resultR = tr;
		resultC = tc;
	}
	await changeColor(startIndex.r, startIndex.c, "green", 50);
	for(let i = result.length - 1; i >= 0; i--) {
		await changeColor(result[i].r, result[i].c, "green", 50);
	}
	animationRunning = false;
}

//heuristic function
function h(p) {
	return Math.abs(endIndex.r - p.r) + Math.abs(endIndex.c - p.c);
}

//astart algorithm
async function aStar() {
	//initialize distance ande parent and f arrays
	let dist = [];
	let f = [];
	let prev = [];
	for(let i = 0; i < 24; i++) {
		let tempDist = [];
		let tempF = [];
		let tempPrev = [];
		for(let j = 0; j < 40; j++) {
			tempDist.push(Infinity);
			tempF.push(Infinity);
			tempPrev.push(null);
		}
		dist.push(tempDist);
		f.push(tempF);
		prev.push(tempPrev);
	}

	//start distance is 0
	dist[startIndex.r][startIndex.c] = 0;
	f[startIndex.r][startIndex.c] = 0;

	//while end not found
	let found = false;
	while(!found) {
		//finding vertex with min f
		let minR = null;
		let minC = null;
		let min = Infinity;
		for(let i = 0; i < 24; i++) {
			for(let j = 0; j < 40; j++) {
				if(f[i][j] < min && grid[i][j] == 0) {
					min = f[i][j];
					minR = i;
					minC = j;
				}
			}
		}

		grid[minR][minC] = 2;
		//change color
		await changeColor(minR, minC, "orange", 100);

		//if end found
		if(endIndex.r == minR && endIndex.c == minC) {
			found = true;
			continue;
		}

		//get all neighbors
		let neighbors = [];
		if(grid[minR - 1][minC] == 0)
			neighbors.push({r: minR - 1, c: minC});
		if(grid[minR + 1][minC] == 0)
			neighbors.push({r: minR + 1, c: minC});
		if(grid[minR][minC - 1] == 0)
			neighbors.push({r: minR, c: minC - 1});
		if(grid[minR][minC + 1] == 0)
			neighbors.push({r: minR, c: minC + 1});

		//for each neighbor
		for(n of neighbors) {
			let alt = dist[minR][minC] + 1;
			if(alt < dist[n.r][n.c]) {
				dist[n.r][n.c] = alt;
				f[n.r][n.c] = dist[n.r][n.c] + h(n);
				prev[n.r][n.c] = {r: minR, c: minC};
			}
		}
	}
	//drawing path with green
	result = [];
	let resultR = endIndex.r;
	let resultC = endIndex.c;
	while(resultR != startIndex.r || resultC != startIndex.c) {
		result.push({r: resultR, c: resultC});
		let tr = prev[resultR][resultC].r;
		let tc = prev[resultR][resultC].c;
		resultR = tr;
		resultC = tc;
	}
	await changeColor(startIndex.r, startIndex.c, "green", 50);
	for(let i = result.length - 1; i >= 0; i--) {
		await changeColor(result[i].r, result[i].c, "green", 50);
	}
	animationRunning = false;
}