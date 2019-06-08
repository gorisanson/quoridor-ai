const DEBUG = true;

class Controller {
    constructor() {
        this.game = null;
        this.ai = null;
        this.view = new View(this);
    }

    startNewGame(isHumanPlayerFirst) {
        let game = new Game(isHumanPlayerFirst);
        this.game = game;
        let ai = new AI(this.game);
        this.ai = ai;
        this.view.game = game;
        this.view.render();
        this.funcForDEBUG();
        if (!isHumanPlayerFirst) {
            this.turnForAI();
        }
    }

    turnForAI() {
        if (!this.game.winner) {
            this.ai.chooseNextMove();
            this.view.render();
            this.funcForDEBUG();
        }
    }

    movePawn(row, col) {
        this.game.movePawn(row, col);
        this.view.render();
        this.funcForDEBUG();
        this.turnForAI();
    }

    putHorizontalWall(row, col) {
        try {
            this.game.putHorizontalWall(row, col);
            this.view.render();
            this.funcForDEBUG();
            this.turnForAI();
        }
        catch(err) {
            if (err === "NO_PATH_ERROR") {
                this.view.printNoteMessage("There must be at least one path to the goal for each pawn.");
            } else {
                throw err;
            }
        }
    }

    putVerticalWall(row, col) {
        try {
            this.game.putVerticalWall(row, col);
            this.view.render();
            this.funcForDEBUG();
            this.turnForAI();
        }
        catch(err) {
            if (err === "NO_PATH_ERROR") {
                this.view.printNoteMessage("There must be at least one path to the goal for each pawn.");
            } else {
                throw err;
            }
        }
    }

    funcForDEBUG() {
        if (DEBUG) {
            this.view.render2DArrayToBoard(getShortestPathsFor(this.game.pawnOfTurn, this.game)[0]);
        }
    }

    
}