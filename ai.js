"use strict";

// Todo: change positionTuples to PawnPosition
// Todo: rename moveArr to moveTuple

PawnPosition.clone = function(pawnPosition) {
    return new PawnPosition(pawnPosition.row, pawnPosition.col);
};

Pawn.clone = function(pawn) {
    const _clone = new Pawn(pawn.index, pawn.isHumanPlayer, true);
    _clone.index = pawn.index;
    _clone.isHumanPlayer = pawn.isHumanPlayer;
    _clone.position = PawnPosition.clone(pawn.position);
    _clone.goalRow = pawn.goalRow;
    _clone.numberOfLeftWalls = pawn.numberOfLeftWalls;
    return _clone;
};

Board.clone = function(board) {
    const _clone = new Board(true, true);
    _clone.pawns = [Pawn.clone(board.pawns[0]), Pawn.clone(board.pawns[1])];
    _clone.walls = {horizontal: create2DArrayClonedFrom(board.walls.horizontal), vertical: create2DArrayClonedFrom(board.walls.vertical)};
    return _clone;
};

// ToDo: optimize constructor so that when cloned
// it does not initialize componenet class that would be soon trashed.
Game.clone = function(game) {
    const _clone = new Game(true, true);
    _clone.board = Board.clone(game.board);
    if (game.winner === null) {
        _clone.winner = null;
    } else {
        _clone.winner = _clone.board.pawns[game.winner.index];
    }
    _clone._turn = game._turn;
    _clone.validNextWalls = {
        horizontal: create2DArrayClonedFrom(game.validNextWalls.horizontal),
        vertical: create2DArrayClonedFrom(game.validNextWalls.vertical)
    };
    _clone._probableNextWalls = {
        horizontal: create2DArrayClonedFrom(game._probableNextWalls.horizontal),
        vertical: create2DArrayClonedFrom(game._probableNextWalls.vertical)
    };
    _clone._probableValidNextWalls = null;
    _clone._probableValidNextWallsUpdated = false;
    _clone.openWays = {
        upDown: create2DArrayClonedFrom(game.openWays.upDown),
        leftRight: create2DArrayClonedFrom(game.openWays.leftRight)
    };
    _clone._validNextPositions = create2DArrayClonedFrom(game._validNextPositions);
    _clone._validNextPositionsUpdated = game._validNextPositionsUpdated;
    return _clone;
};

// left (this instance) PawnPosition - right (argument) PawnPosition 
PawnPosition.prototype.getDisplacementMoveArrFrom = function(position) {
    return [this.row - position.row, this.col - position.col];
}

Game.prototype.getArrOfValidNextPositionTuples = function() {
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

Game.prototype.getArrOfProbableValidNoBlockNextHorizontalWallPositions = function() {
    const nextHorizontals = indicesOfValueIn2DArray(this.probableValidNextWalls.horizontal, true);
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

Game.prototype.getArrOfProbableValidNoBlockNextVerticalWallPositions = function() {
    const nextVerticals = indicesOfValueIn2DArray(this.probableValidNextWalls.vertical, true);
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

Game.prototype.getArrOfValidNoBlackNextWallsInterruptShortestPaths = function(pawn) {
    const validNextWallsInterupt = AI.getValidNextWallsInterruptShortestPaths(pawn, this);
    const nextHorizontals = indicesOfValueIn2DArray(validNextWallsInterupt.horizontal, true);
    const noBlockNextHorizontals = [];
    for (let i = 0; i < nextHorizontals.length; i++) {
        if (this.testIfExistPathsToGoalLinesAfterPutHorizontalWall(nextHorizontals[i][0], nextHorizontals[i][1])) {   
            noBlockNextHorizontals.push(nextHorizontals[i]);
        }
    }
    const nextVerticals = indicesOfValueIn2DArray(validNextWallsInterupt.vertical, true);
    const noBlockNextVerticals = [];
    for (let i = 0; i < nextVerticals.length; i++) {
        if (this.testIfExistPathsToGoalLinesAfterPutVerticalWall(nextVerticals[i][0], nextVerticals[i][1])) {
            noBlockNextVerticals.push(nextVerticals[i]);
        }
    }
    return {arrOfHorizontal: noBlockNextHorizontals, arrOfVertical: noBlockNextVerticals};
}


/*
* If it is named "M", the code work erroneously
* because maybe "M" is already used name in Web APIs?
* (see https://developer.mozilla.org/en-US/docs/Web/API/M)
* M stands for Move. 
*/
class MNode {
    constructor(move, parent, uctConstant = 2) {
        // move is one of the following.
        // [[row, col], null, null] for moving pawn
        // [null, [row, col], null] for putting horizontal wall
        // [null, null, [row, col]] for putting vertical wall
        this.move = move;
        this.parent = parent;
        this.uctConstant = uctConstant;
        this.numWins = 0;   // number of wins
        this.numSims = 0;   // number of simulations
        this.children = [];
        this.isTerminal = false;
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
        return (this.numWins / this.numSims) + Math.sqrt((this.uctConstant * Math.log(this.parent.numSims)) / this.numSims);
    }

    get winRate() {
        return this.numWins / this.numSims;
    }

    get maxUCTChild() {
        let maxUCTIndices;
        let maxUCT = -Infinity;
        for (let i = 0; i < this.children.length; i++) {
            const uct = this.children[i].uct;
            if (uct > maxUCT) {
                maxUCT = uct;
                maxUCTIndices = [i];  
            } else if (uct === maxUCT) {
                maxUCTIndices.push(i);
            }
        }
        const maxUCTIndex = randomChoice(maxUCTIndices);
        //const maxUCTIndex = maxUCTIndices[0];
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

    get maxSimsChild() {
        let maxSimsIndex;
        let maxSims = -Infinity;
        for (let i = 0; i < this.children.length; i++) {
            if (this.children[i].numSims > maxSims) {
                maxSims = this.children[i].numSims;
                maxSimsIndex = i;  
            }
        }
        return this.children[maxSimsIndex];
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
    constructor(game, uctConstant = 0.02) {
        this.game = game;
        this.uctConstant = uctConstant;
        this.root = new MNode(null, null, this.uctConstant);
        this.totalNumOfSimulations = 0;
    }

    static maxDepth(node) {
        let max = 0;
        for (let i = 0; i < node.children.length; i++) {
            const d = this.maxDepth(node.children[i]) + 1;
            if (d > max) {
                max = d;
            }
        }
        return max;
    }

    search(numOfSimulations) {
        let currentNode = this.root;   
        const limitOfTotalNumOfSimulations = this.totalNumOfSimulations + numOfSimulations;
        while (this.totalNumOfSimulations < limitOfTotalNumOfSimulations) {         
            // Selection
            if (currentNode.isTerminal) {
                //console.log("one more terminal rollout...")
                this.rollout(currentNode);
                currentNode = this.root;
            } else if (currentNode.isLeaf) {
                if (currentNode.isNew) {
                    this.rollout(currentNode);
                    currentNode = this.root;
                } else {
                    // Expansion
                    const simulationGame = this.getSimulationGameAtNode(currentNode);
                    const nextPositions = simulationGame.getArrOfValidNextPositionTuples();
                    let move, childNode;
                    for (let i = 0; i < nextPositions.length; i++) {
                        move = [nextPositions[i], null, null];
                        childNode = new MNode(move, currentNode, this.uctConstant); 
                        currentNode.addChild(childNode);
                    }
                    
                    if (simulationGame.pawnOfTurn.numberOfLeftWalls > 0) {
                        if (simulationGame.pawnOfNotTurn.numberOfLeftWalls > 0) { 
                            const noBlockNextHorizontals = simulationGame.getArrOfProbableValidNoBlockNextHorizontalWallPositions();
                            for (let i = 0; i < noBlockNextHorizontals.length; i++) { 
                                move = [null, noBlockNextHorizontals[i], null];
                                childNode = new MNode(move, currentNode, this.uctConstant); 
                                currentNode.addChild(childNode);
                            }
                            const noBlockNextVerticals = simulationGame.getArrOfProbableValidNoBlockNextVerticalWallPositions();
                            for (let i = 0; i < noBlockNextVerticals.length; i++) {
                                move = [null, null, noBlockNextVerticals[i]];
                                childNode = new MNode(move, currentNode, this.uctConstant); 
                                currentNode.addChild(childNode);
                            }
                        } else {    // if opponent has no left walls
                            const noBlockNextWallsInterupt =
                            simulationGame.getArrOfValidNoBlackNextWallsInterruptShortestPaths(simulationGame.pawnOfNotTurn);
                            const noBlockNextHorizontalsInterupt = noBlockNextWallsInterupt.arrOfHorizontal;
                            for (let i = 0; i < noBlockNextHorizontalsInterupt.length; i++) {
                                move = [null, noBlockNextHorizontalsInterupt[i], null];
                                childNode = new MNode(move, currentNode, this.uctConstant);
                                currentNode.addChild(childNode);
                            }
                            const noBlockNextVerticalsInterupt = noBlockNextWallsInterupt.arrOfVertical;
                            for (let i = 0; i < noBlockNextVerticalsInterupt.length; i++) {
                                move = [null, null, noBlockNextVerticalsInterupt[i]];
                                childNode = new MNode(move, currentNode, this.uctConstant);
                                currentNode.addChild(childNode);
                            }

                        }
                    }
                    
                    this.rollout(currentNode.children[0]);
                    currentNode = this.root;
                }
            } else {
                currentNode = currentNode.maxUCTChild;
            }
        }
    }

    selectBestMove() {
        let node = this.root
        let i = 1;
        while(node.children.length > 0) {
            node = node.maxWinRateChild;
            console.log(i, node.move, node.winRate, node.numWins, node.numSims);
            i++;
        }


        console.log(`estimated maxsim winrate: ${this.root.maxSimsChild.winRate}`);
        
        node = this.root
        i = 1;
        while(node.children.length > 0) {
            node = node.maxSimsChild;
            console.log(i, node.move, node.winRate, node.numWins, node.numSims);
            i++;
        }
        // this console.log prevents gargabe collection of the search tree...
        //console.log(this.root.children); 
        console.log("uctConstant:", this.uctConstant);
        //return this.root.maxWinRateChild.move;
        return this.root.maxSimsChild.move;
    }
    
    getSimulationGameAtNode(node) {
        const simulationGame = Game.clone(this.game);
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

    // also called playout
    rollout(node) {
        this.totalNumOfSimulations++;
        const simulationGame = this.getSimulationGameAtNode(node);
        
        // the pawn of this node is the pawn who moved immediately before,
        // put it another way, the pawn who leads to this node right before,
        // i.e. pawn of not turn.
        const nodePawnIndex = simulationGame.pawnIndexOfNotTurn;
        if (simulationGame.winner !== null) {
            node.isTerminal = true;
        }
        
        // Simulation
        // ToDo: apply heuristic not to uniformly select between pawn moves and walls.
        //let simulationDepth = 0;
        const cacheForPawns = [
            {
                updated: false,
                next: null,
                distanceToGoal: null
            },
            {
                updated: false,
                next: null,
                distanceToGoal: null
            }
        ];
        let pawnMoveFlag = false;
        
        while (simulationGame.winner === null) {
            if (!cacheForPawns[0].updated) {
                const t = AI.get2DArrayNextToGoalFor(simulationGame.pawn0, simulationGame);
                cacheForPawns[0].next = t[0];
                cacheForPawns[0].distanceToGoal = t[1];
                cacheForPawns[0].updated = true;
            }
            if (!cacheForPawns[1].updated) {
                const t = AI.get2DArrayNextToGoalFor(simulationGame.pawn1, simulationGame);
                cacheForPawns[1].next = t[0];
                cacheForPawns[1].distanceToGoal = t[1];
                cacheForPawns[1].updated = true;
            }
            const pawnOfTurn = simulationGame.pawnOfTurn; 
            const pawnIndexOfTurn = simulationGame.pawnIndexOfTurn;
            const pawnIndexOfNotTurn = simulationGame.pawnIndexOfNotTurn;    
            //simulationDepth++;
            const distanceToGoalForPawnOfTurn = cacheForPawns[pawnIndexOfTurn].distanceToGoal;
            const distanceToGoalForOfPawnOfNotTurn = cacheForPawns[pawnIndexOfNotTurn].distanceToGoal;
            const distanceDiff = distanceToGoalForOfPawnOfNotTurn - distanceToGoalForPawnOfTurn
            const pawnMoveProbability = 0.8 + 0.2 * (Math.max(0, distanceDiff) / 8);

            if (pawnMoveFlag
                || pawnOfTurn.numberOfLeftWalls === 0
                || Math.random() < pawnMoveProbability) {
                pawnMoveFlag = false;
                let nextPosition;
                //nextPosition = AI.chooseNextPawnPositionRandomly(simulationGame);
                
                if (AI.arePawnsAdjacent(simulationGame)) {
                    cacheForPawns[pawnIndexOfTurn].updated = false;
                    nextPosition = AI.chooseShortestPathNextPawnPositionThoroughly(simulationGame);
                } else {
                    const next = cacheForPawns[pawnIndexOfTurn].next;
                    const currentPosition = simulationGame.pawnOfTurn.position;
                    nextPosition = next[currentPosition.row][currentPosition.col];
                    if (nextPosition === null) {
                        console.log("really?? already in goal position");
                        throw "already in goal Position...."
                    }
                }
                
                simulationGame.movePawn(nextPosition.row, nextPosition.col);
            } else {
                let nextMove;
                //if (simulationDepth <= 6) {
                //    nextMove = AI.chooseNextWallWisely(simulationGame);
                //} else {
                //nextMove = AI.chooseNextWallWisely(simulationGame);
                //if (nextMove === null) {
                //nextMove = AI.chooseNextWallRandomly(simulationGame);
                nextMove = AI.chooseProbableNextWall(simulationGame);
                //}
                if (nextMove !== null) {
                    simulationGame.doMove(...nextMove);
                    cacheForPawns[0].updated = false;
                    cacheForPawns[1].updated = false;
                } else {
                    console.log("This is happening??")
                    pawnMoveFlag = true;
                }
            }
        }

        // Backpropagation
        let ancestor = node;
        let ancestorPawnIndex = nodePawnIndex;

        // ToDo: not absolute value but diff from oppenent's left wall maybe more effective?? maybe not...
        // need store wall some if other opponent has some wall left.
        const numberOfLeftWalls = simulationGame.winner.numberOfLeftWalls;
        //const numberOfLeftWallsOfOpponent = simulationGame.board.pawns[(simulationGame.winner.index + 1) % 2].numberOfLeftWalls;
        const bonusScore = Math.min(0.9, numberOfLeftWalls * 0.25);
        //const diff = numberOfLeftWalls - numberOfLeftWallsOfOpponent;
        //let bonusScore = Math.min(0.9, diff * 0.2);
        //bonusScore = Math.max(-0.9, bonusScore);
        //let i = 0;
        while(ancestor !== null) {
            ancestor.numSims++;
            if (simulationGame.winner.index === ancestorPawnIndex) {
                ancestor.numWins += 1;
                ancestor.numWins += bonusScore;  // this is very effective heuristic!!
                //ancestor.numWins += Math.pow(0.9, i);
                //i++;
            }
            ancestor = ancestor.parent;
            ancestorPawnIndex = (ancestorPawnIndex + 1) % 2;
        }
        //console.log(`${this.totalNumOfSimulations}: ${simulationGame.turn}, ${simulationGame.winner.index}`);
    }
}

/*
* Represents an AI Player
*/
class AI {
    constructor(totalNumOfMCTSSimulations, forWorker = false) {
        this.totalNumOfMCTSSimulations = totalNumOfMCTSSimulations // number
        this.forWorker = forWorker; // boolean;
    }

    chooseNextMove(game) {
        let d = new Date();
        const startTime = d.getTime();
        const mcts = new MonteCarloTreeSearch(game, 0.02);
        
        /*
        let mcts; // to find best uct constant
        if (game.pawnIndexOfTurn === 0) {
            mcts = new MonteCarloTreeSearch(game, 0.02);
        } else {
            mcts = new MonteCarloTreeSearch(game, 0.02);
        }
        */

        if (this.forWorker) {
            const nSearch = 50;
            const nBatch = Math.ceil(this.totalNumOfMCTSSimulations / nSearch);
            postMessage(0);
            for (let i = 0; i < nSearch; i++) {
                mcts.search(nBatch);
                postMessage((i+1)/nSearch);
            }
        } else {
            mcts.search(this.totalNumOfMCTSSimulations);
        }

        let bestMove = mcts.selectBestMove();
        // ToDo: need optimization..... and refactoring.
        if (bestMove[0] !== null) {
            let rightMove = false;
            const nextPositions = AI.chooseShortestPathNextPawnPositionThoroughly2(game);
            for (const nextPosition of nextPositions) {
                if (bestMove[0][0] === nextPosition.row && bestMove[0][1] === nextPosition.col) {
                    rightMove = true;
                    break;
                }
            }
            if (!rightMove) {
                console.log("I'm effective! hahahaha original move:", bestMove);
                let nextPosition = randomChoice(nextPositions);
                bestMove = [[nextPosition.row, nextPosition.col], null, null];
            }
        }
        console.log("doMove!!!");
        d = new Date();
        const endTime = d.getTime();
        console.log(`total Time: ${(endTime - startTime)/1000} sec`);
        console.log(`maxDepth: ${MonteCarloTreeSearch.maxDepth(mcts.root)}`);
        console.log(`estimated winrate: ${mcts.root.maxWinRateChild.winRate}`);
        return bestMove;
    }

    static chooseShortestPathNextPawnPositionThoroughly(game) {
        const valids = indicesOfValueIn2DArray(game.validNextPositions, true);
        const distances = [];
        for (let i = 0; i < valids.length; i++) {
            const clonedGame = Game.clone(game);
            clonedGame.movePawn(valids[i][0], valids[i][1]);
            const distance = AI.getShortestDistanceToGoalFor(clonedGame.pawnOfNotTurn, clonedGame);
            distances.push(distance);
        }
        const index = randomChoice(indicesOfMin(distances));
        const nextPosition = new PawnPosition(valids[index][0], valids[index][1]);
        return nextPosition;
    }

    static chooseShortestPathNextPawnPositionThoroughly2(game) {
        const valids = indicesOfValueIn2DArray(game.validNextPositions, true);
        const distances = [];
        for (let i = 0; i < valids.length; i++) {
            const clonedGame = Game.clone(game);
            clonedGame.movePawn(valids[i][0], valids[i][1]);
            const distance = AI.getShortestDistanceToGoalFor(clonedGame.pawnOfNotTurn, clonedGame);
            distances.push(distance);
        }
        const nextPositions = [];
        for (const index of (indicesOfMin(distances))) {
            nextPositions.push(new PawnPosition(valids[index][0], valids[index][1]));
        }
        return nextPositions;
    }



    // get 2D array "next" to closest goal in the game
    static get2DArrayNextToGoalFor(pawn, game) {
        const t = this.getRandomShortestPathToGoal(pawn, game);
        const dist = t[0];
        const prev = t[1];
        const goalPosition = t[2];
        const distanceToGoal = dist[goalPosition.row][goalPosition.col];
        const next = AI.getNextByReversingPrev(prev, goalPosition);
        return [next, distanceToGoal];
    }

    static chooseShortestPathNextPawnPosition(game) {
        let nextPosition = null;
        // "if (AI.arePawnsAdjacent(game))"" part can deal with
        // general case, not only adjacent pawns case.
        // But, for not adjacent case, there is a more efficent way
        // to find next position. It is the "else" part.
        // This impoves performece significantly.
        if (AI.arePawnsAdjacent(game)) {
            nextPosition = this.chooseShortestPathNextPawnPositionThoroughly(game);
        } else { 
            const next = AI.get2DArrayNextToGoalFor(game.pawnOfTurn, game);
            const currentPosition = game.pawnOfTurn.position
            nextPosition = next[currentPosition.row][currentPosition.col]; 

            /*
            let prevPosition;
            let position = new PawnPosition(goalRow, goalCol);
            while(prevPosition = prev[position.row][position.col]) {
                nextPosition = position;
                position = prevPosition;
            }*/
            // if already in goal position.
            if (nextPosition === null) {
                console.log("really?? already in goal position");
                throw "already in goal Position...."
            }
        }
        return nextPosition;
    }

    static chooseNextPawnPositionRandomly(game) {
        const nextPositions = game.getArrOfValidNextPositionTuples();
        const nextPosition = randomChoice(nextPositions);
        return new PawnPosition(nextPosition[0], nextPosition[1]);
    }
    
    static chooseNextWallRandomly(game) {
        const nextMoves = [];
        const nextHorizontals = indicesOfValueIn2DArray(game.validNextWalls.horizontal, true);
        for (let i = 0; i < nextHorizontals.length; i++) { 
            nextMoves.push([null, nextHorizontals[i], null]);
        }
        const nextVerticals = indicesOfValueIn2DArray(game.validNextWalls.vertical, true);
        for (let i = 0; i < nextVerticals.length; i++) {
            nextMoves.push([null, null, nextVerticals[i]]);
        }
        let nextMoveIndex = randomIndex(nextMoves);
        while(!game.isPossibleNextMove(...nextMoves[nextMoveIndex])) {
            nextMoves.splice(nextMoveIndex, 1);
            if (nextMoves.length === 0) {
                console.log("Is it really possible???")
                return null;  // is it possible?? I'm not sure..
            }
            //console.log("rechoose wall");
            nextMoveIndex = randomIndex(nextMoves);
        }
        return nextMoves[nextMoveIndex];
    }

    static chooseProbableNextWall(game) {
        const nextMoves = [];
        const nextHorizontals = indicesOfValueIn2DArray(game.probableValidNextWalls.horizontal, true);
        for (let i = 0; i < nextHorizontals.length; i++) { 
            nextMoves.push([null, nextHorizontals[i], null]);
        }
        const nextVerticals = indicesOfValueIn2DArray(game.probableValidNextWalls.vertical, true);
        for (let i = 0; i < nextVerticals.length; i++) {
            nextMoves.push([null, null, nextVerticals[i]]);
        }
        let nextMoveIndex = randomIndex(nextMoves);
        while(!game.isPossibleNextMove(...nextMoves[nextMoveIndex])) {
            nextMoves.splice(nextMoveIndex, 1);
            if (nextMoves.length === 0) {
                console.log("Is it really possible???")
                return null;  // is it possible?? I'm not sure..
            }
            //console.log("rechoose wall");
            nextMoveIndex = randomIndex(nextMoves);
        }
        return nextMoves[nextMoveIndex];
    }

    static chooseNextWallWisely(game) {
        const validInterruptWalls = AI.getValidNextWallsInterruptShortestPaths(game.pawnOfNotTurn, game);
        const nextMoves = [];
        const nextHorizontals = indicesOfValueIn2DArray(validInterruptWalls.horizontal, true);
        for (let i = 0; i < nextHorizontals.length; i++) {
            nextMoves.push([null, nextHorizontals[i], null]);
        }
        const nextVerticals = indicesOfValueIn2DArray(validInterruptWalls.vertical, true);
        for (let i = 0; i < nextVerticals.length; i++) {
            nextMoves.push([null, null, nextVerticals[i]]);
        }
        // optimization in effect??
        if (nextMoves.length === 0) {
            return null;
        }
    
        const currentDistanceForMe = AI.getShortestDistanceToGoalFor(game.pawnOfTurn, game);
        const currentDistanceForOpponent = AI.getShortestDistanceToGoalFor(game.pawnOfNotTurn, game);
        const futureDiffDiffs = [];
        for (let i = 0; i < nextMoves.length; i++) {
            const nextMove = nextMoves[i];
            if (nextMove[1] !== null) {
                const row = nextMove[1][0];
                const col = nextMove[1][1];
                game.openWays.upDown[row][col] = false;
                game.openWays.upDown[row][col + 1] = false;
                // getShortestDistanceFror only depends on game.openWays so...
                const diffForMe = currentDistanceForMe -  AI.getShortestDistanceToGoalFor(game.pawnOfTurn, game);
                const diffForOpponent = currentDistanceForOpponent - AI.getShortestDistanceToGoalFor(game.pawnOfNotTurn, game);
                futureDiffDiffs.push(diffForOpponent - diffForMe);
                game.openWays.upDown[row][col] = true;
                game.openWays.upDown[row][col + 1] = true;
            } else { // nextMove[2] !== null
                const row = nextMove[2][0];
                const col = nextMove[2][1];
                game.openWays.leftRight[row][col] = false;
                game.openWays.leftRight[row+1][col] = false;
                const diffForMe = currentDistanceForMe -  AI.getShortestDistanceToGoalFor(game.pawnOfTurn, game);
                const diffForOpponent = currentDistanceForOpponent - AI.getShortestDistanceToGoalFor(game.pawnOfNotTurn, game);
                futureDiffDiffs.push(diffForOpponent - diffForMe);
                game.openWays.leftRight[row][col] = true;
                game.openWays.leftRight[row+1][col] = true;
            }
        }
        const indices = indicesOfSemiMax(futureDiffDiffs);
        if (indices.length === 0) {
            // console.log("no walls to put", game.turn);
            return null;
        }
        if (futureDiffDiffs[indices[0]] < 5) {
            return null;
        } 
        const index = randomChoice(indices);
        return nextMoves[index];
    }

    // choose next pawn position of a shortest path
    // It's code is complicated for performance.
    // the selected position of this code is almost same as chooseShortestPathNextPawnPosition
    static chooseShortestPathNextPawnPosition2(game) {
        const t = AI.getAllShortestPathsToEveryPosition(game.pawnOfTurn, game);
        const dist = t[0];
        const prev = t[1];
        const goalRow = game.pawnOfTurn.goalRow;

        const indices = indicesOfMin(dist[goalRow]);
        let goalCol;
        if (indices.length > 1) {
            goalCol = randomChoice(indices);
        } else {
            goalCol = indices[0];
        }
        
        const goalPosition = new PawnPosition(goalRow, goalCol);
        const next = AI.getMultiNextByReversingMultiPrev(prev, goalPosition);
        const paths = AI.getPathsToGoalFromNext(next, game.pawnOfTurn.position);
        //console.log(`goal position: (${goalPosition.row}, ${goalPosition.col})`);
        //console.log(`number of shortest paths: ${paths.length}`);
        //printPaths(paths);
        let nextPosition = null;
        if (AI.arePawnsAdjacent(game)) {
            if (paths[0].length === 2) { // only 1 move left to arrive at goal
                for (let j = 0; j < 9; j++) {
                    if (game.validNextPositions[goalRow][j]) {
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
                    if (game.validNextPositions[row][col] === true) {
                        nextPosition = possibleJumpingPosition;
                    }
                }
            }

            if (nextPosition === null) {
                const valids = game.getArrOfValidNextPositionTuples();
                const distances = [];
                let clonedGame;
                for (let i = 0; i < valids.length; i++) {
                    clonedGame = Game.clone(game);
                    clonedGame.movePawn(valids[i][0], valids[i][1]);
                    const distance = AI.getShortestDistanceToGoalFor(clonedGame.pawnOfNotTurn, clonedGame);
                    distances.push(distance);
                }
                const index = randomChoice(indicesOfMin(distances));
                nextPosition = new PawnPosition(valids[index][0], valids[index][1]);
            }
        } else {
            const nextPath = randomChoice(paths);
            nextPosition = nextPath[1];
        }
        
        return nextPosition;
    }

    /*
    testFunc() {
        
        const paths2 = findAllPathsToGoalRow(game.pawnOfTurn, game);
        console.log(`number of all paths: ${paths2.length}`);
        for (let i = 0; i < 10; i++) {
            console.log("start");
            console.log(`length: ${paths2[i].length}`);
            for (let j = 0; j < paths2[i].length; j++) {
                console.log(`(${paths2[i][j].row}, ${paths2[i][j].col})`);
            }
            console.log("end")
        }
        
    }
    */

    static arePawnsAdjacent(game) {
        return ((game.pawnOfNotTurn.position.row === game.pawnOfTurn.position.row
                && Math.abs(game.pawnOfNotTurn.position.col - game.pawnOfTurn.position.col) === 1)
                || (game.pawnOfNotTurn.position.col === game.pawnOfTurn.position.col
                    && Math.abs(game.pawnOfNotTurn.position.row - game.pawnOfTurn.position.row) === 1))
    }

    static getRandomShortestPathToGoal(pawn, game) {
        const visited = create2DArrayInitializedTo(9, 9, false);
        const dist = create2DArrayInitializedTo(9, 9, Infinity);
        const prev = create2DArrayInitializedTo(9, 9, null);

        const moveArrs = shuffle([MOVE_UP, MOVE_RIGHT, MOVE_DOWN, MOVE_LEFT]);

        const queue = [];
        visited[pawn.position.row][pawn.position.col] = true;
        dist[pawn.position.row][pawn.position.col] = 0;
        queue.push(pawn.position)
        while (queue.length > 0) {
            let position = queue.shift();
            if (position.row === pawn.goalRow) {
                const goalPosition = position;
                return [dist, prev, goalPosition];
            }
            for (let i = 0; i < moveArrs.length; i++) {
                if (game.isOpenWay(position.row, position.col, moveArrs[i])) {
                    const nextPosition = position.newAddMove(moveArrs[i]);
                    if (!visited[nextPosition.row][nextPosition.col]) {
                        const alt = dist[position.row][position.col] + 1;
                        dist[nextPosition.row][nextPosition.col] = alt;
                        prev[nextPosition.row][nextPosition.col] = position;
                        visited[nextPosition.row][nextPosition.col] = true;
                        queue.push(nextPosition);
                    }
                }
            }
        }
        return [dist, prev, null];
    }

    static getShortestDistanceToGoalFor(pawn, game) {
        const t = AI.getRandomShortestPathToGoal(pawn, game);
        const dist = t[0];
        const goalPosition = t[2];
        if (goalPosition === null) {
            return Infinity;
        }
        return dist[goalPosition.row][goalPosition.col];
    }

    static getShortestDistanceToEveryPosition(pawn, game) {
        const visited = create2DArrayInitializedTo(9, 9, false);
        const dist = create2DArrayInitializedTo(9, 9, Infinity);
    
        const moveArrs = [MOVE_UP, MOVE_RIGHT, MOVE_DOWN, MOVE_LEFT];
        const queue = [];
        visited[pawn.position.row][pawn.position.col] = true;
        dist[pawn.position.row][pawn.position.col] = 0;
        queue.push(pawn.position)
        while (queue.length > 0) {
            let position = queue.shift();
            for (let i = 0; i < moveArrs.length; i++) {
                if (game.isOpenWay(position.row, position.col, moveArrs[i])) {
                    const nextPosition = position.newAddMove(moveArrs[i]);
                    if (!visited[nextPosition.row][nextPosition.col]) {
                        const alt = dist[position.row][position.col] + 1;
                        dist[nextPosition.row][nextPosition.col] = alt;
                        visited[nextPosition.row][nextPosition.col] = true;
                        queue.push(nextPosition);
                    }
                }
            }
        }
        return dist;
    }

    // use breadth first search
    static getAllShortestPathsToEveryPosition(pawn, game) {
        const searched = create2DArrayInitializedTo(9, 9, false);
        const visited = create2DArrayInitializedTo(9, 9, false);
        const dist = create2DArrayInitializedTo(9, 9, Infinity);
        const multiPrev = create2DArrayInitializedTo(9, 9, null);

        const moveArrs = [MOVE_UP, MOVE_RIGHT, MOVE_DOWN, MOVE_LEFT];
        const queue = [];
        visited[pawn.position.row][pawn.position.col] = true;
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
                            multiPrev[nextPosition.row][nextPosition.col] = [position];
                        } else if (alt === dist[nextPosition.row][nextPosition.col]) {
                            multiPrev[nextPosition.row][nextPosition.col].push(position);
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
        return [dist, multiPrev];
    }

    // note that prev is generated with start position designated.
    // "next" which is partial reverse of "prev" needs a goal position.
    static getNextByReversingPrev(prev, goalPosition) {
        const next = create2DArrayInitializedTo(9, 9, null);
        let prevPosition;
        let position = goalPosition;
        while(prevPosition = prev[position.row][position.col]) {
            next[prevPosition.row][prevPosition.col] = position;
            position = prevPosition;
        }
        return next;
    }

    // note that prev is generated with start position designated.
    // "next" which is partial reverse of "prev" needs a goal position.
    static getMultiNextByReversingMultiPrev(multiPrev, goalPosition) {
        const multiNext = create2DArrayInitializedTo(9, 9, null);
        const visited = create2DArrayInitializedTo(9, 9, false);
        const queue = [];
        queue.push(goalPosition);
        while (queue.length > 0) {
            let position = queue.shift();
            let prevs = multiPrev[position.row][position.col];
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
                if (multiNext[prevPosition.row][prevPosition.col] === null) {
                    multiNext[prevPosition.row][prevPosition.col] = [position];
                } else {
                    multiNext[prevPosition.row][prevPosition.col].push(position);
                }
                if (!visited[prevPosition.row][prevPosition.col]) {
                    visited[prevPosition.row][prevPosition.col] = true;
                    queue.push(prevPosition);
                }
            }
        }
        return multiNext;
    }

    static getValidNextWallsInterruptShortestPaths(pawn, game) {
        const validInterruptHorizontalWalls = create2DArrayInitializedTo(8, 8, false);
        const validInterruptVerticalWalls = create2DArrayInitializedTo(8, 8, false);
        const visited = create2DArrayInitializedTo(9, 9, false);

        const t = AI.getAllShortestPathsToEveryPosition(pawn, game);
        const dist = t[0];
        const prev = t[1];
        const goalRow = pawn.goalRow;
        const goalCols = indicesOfMin(dist[goalRow]);

        const queue = [];
        for (let i = 0; i < goalCols.length; i++) {
            const goalPosition = new PawnPosition(goalRow, goalCols[i]);
            queue.push(goalPosition);
        }

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
                const moveArr = position.getDisplacementMoveArrFrom(prevPosition);
                // mark valid walls which can interupt the pawn move
                if (moveArr[0] === -1 && moveArr[1] === 0) { // up
                    if (prevPosition.col < 8) {
                        validInterruptHorizontalWalls[prevPosition.row-1][prevPosition.col] = 
                        game.validNextWalls.horizontal[prevPosition.row-1][prevPosition.col];
                    }
                    if (prevPosition.col > 0) {
                        validInterruptHorizontalWalls[prevPosition.row-1][prevPosition.col-1] = 
                        game.validNextWalls.horizontal[prevPosition.row-1][prevPosition.col-1];
                    }    
                } else if (moveArr[0] === 1 && moveArr[1] === 0) { // down
                    if (prevPosition.col < 8) {
                        validInterruptHorizontalWalls[prevPosition.row][prevPosition.col] = 
                        game.validNextWalls.horizontal[prevPosition.row][prevPosition.col];
                    }
                    if (prevPosition.col > 0) {
                        validInterruptHorizontalWalls[prevPosition.row][prevPosition.col-1] = 
                        game.validNextWalls.horizontal[prevPosition.row][prevPosition.col-1];
                    }  
                } else if (moveArr[0] === 0 && moveArr[1] === -1) { // left
                    if (prevPosition.row < 8) {
                        validInterruptVerticalWalls[prevPosition.row][prevPosition.col-1] = 
                        game.validNextWalls.vertical[prevPosition.row][prevPosition.col-1];
                    }
                    if (prevPosition.row > 0) {
                        validInterruptVerticalWalls[prevPosition.row-1][prevPosition.col-1] = 
                        game.validNextWalls.vertical[prevPosition.row-1][prevPosition.col-1];
                    }  
                } else if (moveArr[0] === 0 && moveArr[1] === 1) { // right
                    if (prevPosition.row < 8) {
                        validInterruptVerticalWalls[prevPosition.row][prevPosition.col] = 
                        game.validNextWalls.vertical[prevPosition.row][prevPosition.col];
                    }
                    if (prevPosition.row > 0) {
                        validInterruptVerticalWalls[prevPosition.row-1][prevPosition.col] = 
                        game.validNextWalls.vertical[prevPosition.row-1][prevPosition.col];
                    }  
                }
                                
                //console.log(`prevPosition.row: ${prevPosition.row}, .col: ${prevPosition.col}`)
                if (!visited[prevPosition.row][prevPosition.col]) {
                    visited[prevPosition.row][prevPosition.col] = true;
                    queue.push(prevPosition);
                }
            }
        }
        const wall2DArrays = {horizontal: validInterruptHorizontalWalls, vertical: validInterruptVerticalWalls}
        
        // ToDo: need refactoring and optimization here, and This is not included the method name.. so..
        // divide this from the method later...
        Game.setWallsBesidePawn(wall2DArrays, pawn);
        wall2DArrays.horizontal = logicalAndBetween2DArray(wall2DArrays.horizontal, game.validNextWalls.horizontal);
        wall2DArrays.vertical = logicalAndBetween2DArray(wall2DArrays.vertical, game.validNextWalls.vertical);
        
        return wall2DArrays;
    }

    static getPathsToGoalFromNext(next, startPosition) {
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

function indicesOfMax(arr) {
    let max = -Infinity;
    let indices = [];
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] > max) {
            indices = [i];
            max = arr[i];
        } else if (arr[i] === max) {
            indices.push(i);
        }
    }
    return indices;
}

// get indices of max but do not include infinity or NaN
function indicesOfSemiMax(arr) {
    let max = -Infinity;
    let indices = [];
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] !== Infinity && arr[i] !== NaN && arr[i] > max) {
            indices = [i];
            max = arr[i];
        } else if (arr[i] === max) {
            indices.push(i);
        }
    }
    return indices;
}

function randomIndex(arr) {
    return Math.floor(Math.random() * arr.length);
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

function printPaths(paths) {
    for (let i = 0; i < paths.length; i++) {
        const path = paths[i];
        console.log(`path${i}: \n`)
        for (let j = 0; j < path.length; j++) {
            console.log(`row: ${path[j].row}, col: ${path[j].col}`);
        }
    }
}

/**
 * The Modern version of the Fisher–Yates shuffle algorithm:
 * Shuffles array in place.
 * (See https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array)
 */
function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const x = arr[i];
        arr[i] = arr[j];
        arr[j] = x;
    }
    return arr;
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



