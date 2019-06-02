/*    
*              col
*          0 1 2 3 ... 8
*        0
*        1
*  row   2
*        3
*       ...
*        8
* 
*  Follow above notation.
*/


function create2DArrayInitializedTo(numOfRow, numOfCol, initialValue) {
    let arr2D = [];
    for (let i = 0; i < numOfRow; i++) {
        let row = [];
        for (let j = 0; j < numOfCol; j++) {
            row.push(initialValue);
        }
        arr2D.push(row);
    }
    return arr2D;
}

function set2DArrayEveryElementToValue(arr2D, value) {
    for (let i = 0; i < arr2D.length; i++) {
        arr2D[i].fill(value);
    }
}


/*
* Represents a pawn's position on board
*/
class PawnPosition {
    constructor(row, col) {
        this.row = row;
        this.col = col;
    }

    equals(otherPosition) {
        return this.row === otherPosition.row && this.col === otherPosition.col;
    }

    addMove(moveArr) {
        return new PawnPosition(this.row + moveArr[0], this.col + moveArr[1]);
    }
}


/*
* Represents a pawn
* initial_row: initial row position
* initial_col: initial col position
*/
class Pawn {
    constructor(initialRow, initialCol) {
        this.position = new PawnPosition(initialRow, initialCol);
        this.numberOfLeftWalls = 10;
    }
}


/*
* Represents a Board
*/
class Board {
    constructor() {
        this.pawns = [new Pawn(8, 4), new Pawn(0, 4)];
        // horizontal, vertical: each is a 8 by 8 2D array, true: there is a wall, false: there is not a wall.
        this.walls = {horizontal: create2DArrayInitializedTo(8, 8, false), vertical: create2DArrayInitializedTo(8, 8, false)};
    }
}


/*
* Represents a Quoridor game and the rule
*/
class Game {
    constructor() {
        this.board = new Board();
        this._turn = 0;
        this._validNextWalls = {horizontal: create2DArrayInitializedTo(8, 8, true), vertical: create2DArrayInitializedTo(8, 8, true)};
        this._validNextWallsUpdated = false;

        // whether ways to adjacency blocked (not open) or not blocked (open) by a wall
        this._openWays = {upDown: create2DArrayInitializedTo(8, 9, true), leftRight: create2DArrayInitializedTo(9, 8, true)};
        this._openWaysUpdated = false;

        this._validNextPositions = create2DArrayInitializedTo(9, 9, false);
        this._validNextPositionsUpdated = false;
    }

    get turn() {
        return this._turn;
    }

    set turn(newTurn) {
        this._turn = newTurn;
        this._validNextWallsUpdated = false;
        this._openWaysUpdated = false;
        this._validNextPositionsUpdated = false;
    }

    get pawnIndexOfTurn() {
        return this.turn % 2;
    }

    get pawnIndexOfNotTurn() {
        return (this.turn + 1) % 2;
    }

    get pawnOfTurn() {
        return this.board.pawns[this.pawnIndexOfTurn];
    }

    get pawnOfNotTurn() {
        return this.board.pawns[this.pawnIndexOfNotTurn];
    }

    // horizontal, vertical: each is a 8 by 8 2D bool array; true indicates valid location, false indicates not valid location.
    get validNextWalls() {
        if (this._validNextWallsUpdated === true) {
            return this._validNextWalls;
        }
        this._validNextWallsUpdated = true;

        if (this.pawnOfTurn.numberOfLeftWalls <= 0) {
            set2DArrayEveryElementToValue(this._validNextWalls.horizontal, false);
            set2DArrayEveryElementToValue(this._validNextWalls.vertical, false);
            return this._validNextWalls;
        }
        else {
            set2DArrayEveryElementToValue(this._validNextWalls.horizontal, true);
            set2DArrayEveryElementToValue(this._validNextWalls.vertical, true);
        }

        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if (this.board.walls.horizontal[i][j] === true) {
                    this._validNextWalls.vertical[i][j] = false;
                    this._validNextWalls.horizontal[i][j] = false;
                    if (j > 0) {
                        this._validNextWalls.horizontal[i][j - 1] = false;
                    }
                    if (j < 7) {
                        this._validNextWalls.horizontal[i][j + 1] = false;
                    }   
                }
                if (this.board.walls.vertical[i][j] === true) {
                    this._validNextWalls.horizontal[i][j] = false;
                    this._validNextWalls.vertical[i][j] = false;
                    if (i > 0) {
                        this._validNextWalls.vertical[i-1][j] = false;
                    }
                    if (i < 7) {
                        this._validNextWalls.vertical[i+1][j] = false;
                    }
                }
            }
        }

        return this._validNextWalls;
    }

    get openWays() {
        if (this._openWaysUpdated === true) {
            return this._openWays
        }
        this._openWaysUpdated = true;

        set2DArrayEveryElementToValue(this._openWays.upDown, true);
        set2DArrayEveryElementToValue(this._openWays.leftRight, true);
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if (this.board.walls.horizontal[i][j] === true) {
                    this._openWays.upDown[i][j] = false;
                    this._openWays.upDown[i][j + 1] = false;
                }
                if (this.board.walls.vertical[i][j] === true) {
                    this._openWays.leftRight[i][j] = false;
                    this._openWays.leftRight[i+1][j] = false;
                }
            }
        }

        return this._openWays;
    }

    get validNextPositions() {
        if (this._validNextPositionsUpdated === true) {
            return this._validNextPositions;
        }
        this._validNextPositionsUpdated = true;

        set2DArrayEveryElementToValue(this._validNextPositions, false);

        const moveUp = [-1, 0];
        const moveDown = [1, 0];
        const moveLeft = [0, -1];
        const moveRight = [0, 1];
        
        this._set_validNextPositionsToward(moveUp, moveLeft, moveRight);
        this._set_validNextPositionsToward(moveDown, moveLeft, moveRight);
       
        this._set_validNextPositionsToward(moveLeft, moveUp, moveDown);
        this._set_validNextPositionsToward(moveRight, moveUp, moveDown);
        
        return this._validNextPositions;
    }


    // check and set this._validNextPostions toward mainMove. subMoves are needed for jumping case.
    _set_validNextPositionsToward(mainMove, subMove1, subMove2) {
        if (this.isValidNextMoveNotConsideringOtherPawn(this.pawnOfTurn.position, mainMove)) {
            let mainMovePosition = this.pawnOfTurn.position.addMove(mainMove);
            if (mainMovePosition.equals(this.pawnOfNotTurn.position)) {
                if (this.isValidNextMoveNotConsideringOtherPawn(mainMovePosition, mainMove)) {
                    let mainMainMovePosition = mainMovePosition.addMove(mainMove);
                    this._validNextPositions[mainMainMovePosition.row][mainMainMovePosition.col] = true;
                } else {
                    if (this.isValidNextMoveNotConsideringOtherPawn(mainMovePosition, subMove1)) {
                        let mainSub1MovePosition = mainMovePosition.addMove(subMove1);
                        this._validNextPositions[mainSub1MovePosition.row][mainSub1MovePosition.col] = true;
                    }
                    if (this.isValidNextMoveNotConsideringOtherPawn(mainMovePosition, subMove2)) {
                        let mainSub2MovePosition = mainMovePosition.addMove(subMove2);
                        this._validNextPositions[mainSub2MovePosition.row][mainSub2MovePosition.col] = true;
                    }
                }
            } else {
                this._validNextPositions[mainMovePosition.row][mainMovePosition.col] = true;
            }
        }
    }


    // this method checks if the moveArr of the pawn of this turn is valid against walls on the board and the board size.
    // and this method do not check the validity against the other pawn's position. 
    isValidNextMoveNotConsideringOtherPawn(currentPosition, moveArr) {
        if (moveArr[0] === -1 && moveArr[1] === 0) { // up
            return (currentPosition.row > 0 && this.openWays.upDown[currentPosition.row - 1][currentPosition.col]);
        }
        if (moveArr[0] === 1 && moveArr[1] === 0) { // down
            return (currentPosition.row < 8 && this.openWays.upDown[currentPosition.row][currentPosition.col]);
        }
        else if (moveArr[0] === 0 && moveArr[1] === -1) { // left
            return (currentPosition.col > 0 && this.openWays.leftRight[currentPosition.row][currentPosition.col - 1]);
        }
        else if (moveArr[0] === 0 && moveArr[1] === 1) { // right
            return (currentPosition.col < 8 && this.openWays.leftRight[currentPosition.row][currentPosition.col]);
        }
    }

    putHorizontalWall(row, col) {
        this.board.walls.horizontal[row][col] = true;
        this.pawnOfTurn.numberOfLeftWalls--;
        this.turn++;
    }

    putVerticalWall(row, col) {
        this.board.walls.vertical[row][col] = true;
        this.pawnOfTurn.numberOfLeftWalls--;
        this.turn++;
    }
}

 
 