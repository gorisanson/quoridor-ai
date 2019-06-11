PawnPosition.prototype.clone = function() {
    return new PawnPosition(this.row, this.col);
};

Pawn.prototype.clone = function() {
    const _clone = new Pawn(this.index, this.isHumanPlayer);
    _clone.position = this.position.clone();
    _clone.numberOfLeftWalls = this.numberOfLeftWalls;
    return _clone;
};

Board.prototype.clone = function() {
    const _clone = new Board(true);
    _clone.pawns = [this.pawns[0].clone(), this.pawns[1].clone()];
    _clone.walls = {horizontal: create2DArrayClonedFrom(this.walls.horizontal), vertical: create2DArrayClonedFrom(this.walls.vertical)};
    return _clone;
};

// ToDo: optimize constructor so that when cloned
// it does not initialize componenet class that would be soon trashed.
Game.prototype.clone = function() {
    const _clone = new Game(true);
    _clone.board = this.board.clone();
    _clone.winner = null;
    _clone._turn = this._turn;
    _clone.validNextWalls = {horizontal: create2DArrayClonedFrom(this.validNextWalls.horizontal), vertical: create2DArrayClonedFrom(this.validNextWalls.vertical)};
    _clone.openWays = {upDown: create2DArrayClonedFrom(this.openWays.upDown), leftRight: create2DArrayClonedFrom(this.openWays.leftRight)};
    _clone._validNextPositions = create2DArrayClonedFrom(this._validNextPositions);
    _clone._validNextPositionsUpdated = this._validNextPositionsUpdated;
    return _clone;
};

Game.prototype.getArrOfValidNextPositions = function() {
    return indicesOfValueIn2DArray(this.validNextPositions, true);
}

// get valid next horizontal walls that do not block all paths of either pawn.
Game.prototype.getArrOfValidNoBlockNextHorizontalWallPositions = function() {
    const nextHorizontals = indicesOfValueIn2DArray(this.validNextWalls.horizontal, true);
    const noBlockNextHorizontals = [];
    for (let i = 0; i < nextHorizontals.length; i++) {
        if (this.testIfExistPathsToGoalLinesAfterPutHorizontalWall(nextHorizontals[i][0], nextHorizontals[i][1])) {   
            noBlockNextHorizontals.push(nextHorizontals[i]);
        } //else {
            //console.log(`nextHorizontals[${i}], ${nextHorizontals[i][0]}, ${nextHorizontals[i][1]}`)
        //}
    }
    return noBlockNextHorizontals;
};

// get valid next vertical walls that do not block all paths of either pawn.
Game.prototype.getArrOfValidNoBlockNextVerticalWallPositions = function() {
    const nextVerticals = indicesOfValueIn2DArray(this.validNextWalls.vertical, true);
    const noBlockNextVerticals = [];
    for (let i = 0; i < nextVerticals.length; i++) {
        if (this.testIfExistPathsToGoalLinesAfterPutVerticalWall(nextVerticals[i][0], nextVerticals[i][1])) {
            noBlockNextVerticals.push(nextVerticals[i]);
        } //else {
            //console.log(`nextVerticals[${i}], ${nextVerticals[i][0]}, ${nextVerticals[i][1]}`)
        //}
    }
    return noBlockNextVerticals;
};


/*
* If it is named "M", the code work erroneously
* because maybe "M" is already used name in Web APIs?
* (see https://developer.mozilla.org/en-US/docs/Web/API/M)
* M stands for Move. 
*/
class MNode {
    constructor(move, parent) {
        // move is one of the following.
        // [[row, col], null, null] for moving pawn
        // [null, [row, col], null] for putting horizontal wall
        // [null, null, [row, col]] for putting vertical wall
        this.move = move;
        this.parent = parent;
        this.numWins = 0;   // number of wins
        this.numSims = 0;   // number of simulations
        this.children = [];
    }

    get isLeaf() {
        return this.children.length === 0;
    }

    get isNew() {
        return this.numSims === 0;
    }

    // References: 
    // Levente Kocsis, Csaba Szepesva ́ri (2006 ) "Bandit based Monte-Carlo Planning"
    // Peter Auer, Cesa-Bianchi, Fischer (2002) "Finite-time Analysis of the Multiarmed Bandit Problem"
    // Do google search for "monte carlo tree search uct"
    get uct() {
        if (this.parent === null || this.parent.numSims === 0) {
            throw "UCT_ERROR"
        }
        if (this.numSims === 0) {
            return Infinity;
        }
        const c = 2;
        return (this.numWins / this.numSims) + Math.sqrt((c * Math.log(this.parent.numSims)) / this.numSims);
    }

    get winRate() {
        return this.numWins / this.numSims;
    }

    get maxUCTChild() {
        let maxUCTIndex;
        let maxUCT = -Infinity;
        for (let i = 0; i < this.children.length; i++) {
            if (this.children[i].uct > maxUCT) {
                maxUCT = this.children[i].uct;
                maxUCTIndex = i;  
            }
        }
        return this.children[maxUCTIndex];
    }

    get maxWinRateChild() {
        let maxWinRateIndex;
        let maxWinRate = -Infinity;
        for (let i = 0; i < this.children.length; i++) {
            if (this.children[i].winRate > maxWinRate) {
                maxWinRate = this.children[i].winRate;
                maxWinRateIndex = i;  
            }
        }
        return this.children[maxWinRateIndex];
    }

    addChild(childNode) {
        this.children.push(childNode);
    }

    printChildren() {
        for (let i = 0; i < this.children.length; i++) {
            console.log(`children[${i}].move: ${this.children[i].move}`);
        }
    }

}

/*
* Reference:
* 
* Monte Carlo tree search, Wikipedia
* (https://en.wikipedia.org/wiki/Monte_Carlo_tree_search)
* Ziad SALLOUM, Monte Carlo Tree Search in Reinforcement Learning
* (https://towardsdatascience.com/monte-carlo-tree-search-in-reinforcement-learning-b97d3e743d0f)
*/
class MonteCarloTreeSearch {
    constructor(game) {
        this.root = new MNode(null, null);
        this.game = game;
        this.totalNumOfSimulations = 1000;
        this.numOfSimulations = 0;
    }

    searchAndSelectBestMove() {
        let currentNode = this.root;
        
        let d = new Date();
        const startTime = d.getTime();
        while (this.numOfSimulations < this.totalNumOfSimulations) {            
            // Selection
            if (currentNode.isLeaf) {
                if (currentNode.isNew) {
                    this.rollout(currentNode);
                } else {
                    // Expansion
                    const simulationGame = this.getSimulationGameAtNode(currentNode);
                    const nextPositions = simulationGame.getArrOfValidNextPositions();
                    
                    const noBlockNextHorizontals = simulationGame.getArrOfValidNoBlockNextHorizontalWallPositions();
                    const noBlockNextVerticals = simulationGame.getArrOfValidNoBlockNextVerticalWallPositions();
                    let move, childNode;
                    for (let i = 0; i < nextPositions.length; i++) {
                        move = [nextPositions[i], null, null];
                        childNode = new MNode(move, currentNode); 
                        currentNode.addChild(childNode);
                    }
                    for (let i = 0; i < noBlockNextHorizontals.length; i++) { 
                        move = [null, noBlockNextHorizontals[i], null];
                        childNode = new MNode(move, currentNode); 
                        currentNode.addChild(childNode);
                    }
                    for (let i = 0; i < noBlockNextVerticals.length; i++) {
                        move = [null, null, noBlockNextVerticals[i]];
                        childNode = new MNode(move, currentNode); 
                        currentNode.addChild(childNode);
                    }
                    this.rollout(currentNode.children[0]);
                }
            } else {
                currentNode = currentNode.maxUCTChild;
            }
        }
        d = new Date();
        const endTime = d.getTime();
        console.log(`total Time: ${(endTime - startTime)/1000} sec`)
        return this.root.maxWinRateChild.move;
    }
    
    getSimulationGameAtNode(node) {
        const simulationGame = this.game.clone();
        const stack = [];

        let ancestor = node;
        while(ancestor.parent !== null) {
            stack.push(ancestor.move); // moves stacked to a child of root. root's move is not stacked.
            ancestor = ancestor.parent;
        }
        
        while (stack.length > 0) {
            const move = stack.pop();
            simulationGame.doMove(...move);
        }
        return simulationGame;
    }

    // also called "playout"
    rollout(node) {
        console.log(this.numOfSimulations);
        this.numOfSimulations++;
        const simulationGame = this.getSimulationGameAtNode(node);
        const nodePawnIndex = simulationGame.pawnIndexOfTurn;

        // Simulation
        // ToDo: apply heuristic not to uniformly select between pawn moves and walls.
        while (simulationGame.winner === null) {
            const nextPositions = simulationGame.getArrOfValidNextPositions();
            // ToDo: In rollout just use trycatch at the line simulationGame.doMove() could improve performence. 
            //const nextHorizontals = indicesOfValueIn2DArray(simulationGame.validNextWalls.horizontal, true);
            //const nextVerticals = indicesOfValueIn2DArray(simulationGame.validNextWalls.vertical, true);
            const nextHorizontals = simulationGame.getArrOfValidNoBlockNextHorizontalWallPositions();
            const nextVerticals = simulationGame.getArrOfValidNoBlockNextVerticalWallPositions();
            const nextMoves = [];
            for (let i = 0; i < nextPositions.length; i++) {
                nextMoves.push([nextPositions[i], null, null]);
            }
            for (let i = 0; i < nextHorizontals.length; i++) { 
                nextMoves.push([null, nextHorizontals[i], null]);
            }
            for (let i = 0; i < nextVerticals.length; i++) {
                nextMoves.push([null, null, nextVerticals[i]]);
            }
            let nextMove = randomChoice(nextMoves); 
            
            let didMove = false;
            while (!didMove) {
                try {
                    simulationGame.doMove(...nextMove);
                    didMove = true;
                } catch (error) {
                    if (error === "NO_PATH_ERROR") {
                        nextMove = randomChoice(nextMoves);
                    } else {
                        throw error;
                    }   
                }
            }
        }

        // Backpropagation
        let ancestor = node;
        let ancestorPawnIndex = nodePawnIndex;
        while(ancestor !== null) {
            ancestor.numSims++;
            if (simulationGame.winner.index === ancestorPawnIndex) {
                ancestor.numWins++;
            }
            ancestor = ancestor.parent;
            ancestorPawnIndex = (ancestorPawnIndex + 1) % 2;
        }
    }
}

/*
* Represents an AI Player
*/
class AI {
    constructor(game, isFirstPlayer) {
        this.game = game;
        this.isFirstPlayer = isFirstPlayer;
    }

    chooseNextMove() {
        const mcts = new MonteCarloTreeSearch(this.game);
        const bestMove = mcts.searchAndSelectBestMove();
        console.log("doMove!!!")
        this.game.doMove(...bestMove);
    }

    chooseNextMove1() {
        const valids = indicesOfValueIn2DArray(this.game.validNextPositions, true);
        const distances = []
        let clonedGame;
        for (let i = 0; i < valids.length; i++) {
            clonedGame = this.game.clone();
            clonedGame.movePawn(valids[i][0], valids[i][1]);
            const distance = getShortestDistanceFor(clonedGame.pawnOfNotTurn, clonedGame);
            distances.push(distance);
        }
        const index = randomChoice(indicesOfMin(distances));
        this.game.movePawn(valids[index][0], valids[index][1]);
    }

    chooseNextMove2() {
        const t = getShortestPathsFor(this.game.pawnOfTurn, this.game);
        const dist = t[0];
        const prev = t[1];
        const goalRow = this.game.pawnOfTurn.goalRow;

        const indices = indicesOfMin(dist[goalRow]);
        let goalCol;
        if (indices.length > 1) {
            goalCol = randomChoice(indices);
        } else {
            goalCol = indices[0];
        }
        
        const goalPosition = new PawnPosition(goalRow, goalCol);
        const next = getNextByReversingPrev(prev, goalPosition);
        const paths = getPathsToGoalFromNext(next, this.game.pawnOfTurn.position);
        console.log(`goal position: (${goalPosition.row}, ${goalPosition.col})`);
        console.log(`number of shortest paths: ${paths.length}`);

        const paths2 = findAllPathsToGoalRow(this.game.pawnOfTurn, this.game);
        console.log(`number of all paths: ${paths2.length}`);
        for (let i = 0; i < 10; i++) {
            console.log("start");
            console.log(`length: ${paths2[i].length}`);
            for (let j = 0; j < paths2[i].length; j++) {
                console.log(`(${paths2[i][j].row}, ${paths2[i][j].col})`);
            }
            console.log("end")
        }

        //printPaths(paths);
        const nextPath = randomChoice(paths);
        let nextPosition = nextPath[1];
        if (this.arePawnsAdjacent()) {
            if (paths[0].length === 2) { // only 1 move left to arrive at goal
                for (let j = 0; j < 9; j++) {
                    if (this.game.validNextPositions[goalRow][j]) {
                        nextPosition = new PawnPosition(goalRow, j);
                        break;
                    }
                }
            } else {
                for (let i = 0; i < paths.length; i++) {
                    const path = paths[i]
                    const possibleJumpingPosition = path[2];
                    const row = possibleJumpingPosition.row;
                    const col = possibleJumpingPosition.col; 
                    if (this.game.validNextPositions[row][col] === true) {
                        nextPosition = possibleJumpingPosition;
                    }
                }
            }
        }

        try {
            this.game.movePawn(nextPosition.row, nextPosition.col);
        }
        catch(error) {
            if (error === "INVALID_PAWN_MOVE_ERROR") {
                console.log(error);
                const next = randomChoice(indicesOfValueIn2DArray(this.game.validNextPositions, true))
                this.game.movePawn(next[0], next[1]);
            } else {
                throw error;
            }
        }
    }

    arePawnsAdjacent() {
        return ((this.game.pawnOfNotTurn.position.row === this.game.pawnOfTurn.position.row
                && Math.abs(this.game.pawnOfNotTurn.position.col - this.game.pawnOfTurn.position.col) === 1)
                || (this.game.pawnOfNotTurn.position.col === this.game.pawnOfTurn.position.col
                    && Math.abs(this.game.pawnOfNotTurn.position.row - this.game.pawnOfTurn.position.row) === 1))
    }

        
}
 

function indicesOfMin(arr) {
    let min = Infinity;
    let indices = [];
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] < min) {
            indices = [i];
            min = arr[i];
        } else if (arr[i] === min) {
            indices.push(i);
        }
    }
    return indices;
}

// ToDo: would if statement that select arr.length === 1 impoves performence???
function randomChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function indicesOfValueIn2DArray(arr2D, value) {
    let t = [];
    for (let i = 0; i < arr2D.length; i++) {
        for (let j = 0; j < arr2D[0].length; j++) {
            if (arr2D[i][j] === value) {
                t.push([i, j]);
            }
        }
    }
    return t;
}

function getShortestDistanceFor(pawn, game) {
    const dist = getShortestPathsFor(pawn, game)[0];
    const distancesToGoalRow = dist[pawn.goalRow];
    return Math.min(...distancesToGoalRow);
}

// use breadth first search
function getShortestPathsFor(pawn, game) {
    const searched = create2DArrayInitializedTo(9, 9, false);
    const visited = create2DArrayInitializedTo(9, 9, false);
    const dist = create2DArrayInitializedTo(9, 9, Infinity);
    const prev = create2DArrayInitializedTo(9, 9, null);

    const moveArrs = [MOVE_UP, MOVE_RIGHT, MOVE_DOWN, MOVE_LEFT];
    const queue = [];
    dist[pawn.position.row][pawn.position.col] = 0;
    queue.push(pawn.position)
    while (queue.length > 0) {
        let position = queue.shift();
        for (let i = 0; i < moveArrs.length; i++) {
            if (game.isOpenWay(position.row, position.col, moveArrs[i])) {
                const nextPosition = position.newAddMove(moveArrs[i]);
                if (!searched[nextPosition.row][nextPosition.col]) {
                    const alt = dist[position.row][position.col] + 1;
                    // when this inequality holds, dist[nextPosition.row][nextPosition.col] === infinity
                    // because alt won't be decreased in this BFS.
                    if (alt < dist[nextPosition.row][nextPosition.col]) {
                        dist[nextPosition.row][nextPosition.col] = alt;
                        prev[nextPosition.row][nextPosition.col] = [position];
                    } else if (alt === dist[nextPosition.row][nextPosition.col]) {
                        prev[nextPosition.row][nextPosition.col].push(position);
                    }
                    if (!visited[nextPosition.row][nextPosition.col]) {
                        visited[nextPosition.row][nextPosition.col] = true;
                        queue.push(nextPosition);
                    }
                }
            }
        }
        searched[position.row][position.col] = true;
    }
    return [dist, prev];
}


// note that prev is generated with start position designated.
// "next" which is partial reverse of "prev" needs a goal position.
function getNextByReversingPrev(prev, goalPosition) {
    const next = create2DArrayInitializedTo(9, 9, null);
    const visited = create2DArrayInitializedTo(9, 9, false);
    const queue = [];
    queue.push(goalPosition);
    while (queue.length > 0) {
        let position = queue.shift();
        let prevs = prev[position.row][position.col];
        if (prevs === null) {
            // for debug
            if (queue.length !== 0) {
                throw "some error occured...."
            }
            continue; // this can be "break;"
            // because if condition holds ture only if current position is start position.
        }
        //console.log(`prevs.length: ${prevs.length}`)
        for (let i = 0; i < prevs.length; i++) {
            let prevPosition = prevs[i];
            //console.log(`prevPosition.row: ${prevPosition.row}, .col: ${prevPosition.col}`)
            if (next[prevPosition.row][prevPosition.col] === null) {
                next[prevPosition.row][prevPosition.col] = [position];
            } else {
                next[prevPosition.row][prevPosition.col].push(position);
            }
            if (!visited[prevPosition.row][prevPosition.col]) {
                visited[prevPosition.row][prevPosition.col] = true;
                queue.push(prevPosition);
            }
        }
    }
    return next;
}


function getPathsToGoalFromNext(next, startPosition) {
    const paths = [];
    // similar to dfs
    const addPathToGoalToPaths = function(currentPosition, path) {
        path.push(currentPosition);
        const nexts = next[currentPosition.row][currentPosition.col];
        // if currentPosition is the goal position
        if (nexts === null) {
            paths.push(path);
            return;
        }
        //console.log(`next.length: ${nexts.length}`)
        for (let i = 0; i < nexts.length; i++) {
            addPathToGoalToPaths(nexts[i], [...path]); // pass cloned array because javascript use call by sharing
        }
    };
    addPathToGoalToPaths(startPosition, []);
    return paths;
}

function printPaths(paths) {
    for (let i = 0; i < paths.length; i++) {
        const path = paths[i];
        console.log(`path${i}: \n`)
        for (let j = 0; j < path.length; j++) {
            console.log(`row: ${path[j].row}, col: ${path[j].col}`);
        }
    }
}

function findAllPathsToGoalRow(pawn, game) {
    // ToDo: changing elements order of moveArrs could improve performance??
    const moveArrs = [MOVE_UP, MOVE_RIGHT, MOVE_DOWN, MOVE_LEFT];
    const paths = [];
    const pathStack = [];
    const dfs = function(currentPosition, goalRow, game) {
        pathStack.push(currentPosition);
        //ToDo: this if statement is for prevent memory difficiency....
        // Too many paths exists........
        // How can I find only homotopic paths efficiently?
        if (paths.length > 10000) {
            pathStack.pop();
            return;
        }
        if (currentPosition.row === goalRow) {
            paths.push([...pathStack]);
            pathStack.pop();
            return;
        }
        for (let i = 0; i < moveArrs.length; i++) {
            const moveArr = moveArrs[i];
            const nextPosition = currentPosition.newAddMove(moveArr);
            if (game.isOpenWay(currentPosition.row, currentPosition.col, moveArr)
                && !pathIncludePosition(pathStack, nextPosition)) {
                dfs(nextPosition, goalRow, game);
            }
        }
        pathStack.pop();
    }
    dfs(pawn.position, pawn.goalRow, game);
    return paths;
}

function pathIncludePosition(path, position) {
    for (let i = 0; i < path.length; i++) {
        if (position.equals(path[i])) {
            return true;
        }
    }
    return false;
}