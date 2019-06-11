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

    doMove(movePawnTo, putHorizontalWallAt, putVerticalWallAt) {
        try {
            this.game.doMove(movePawnTo, putHorizontalWallAt, putVerticalWallAt);
            this.view.render();
            this.funcForDEBUG();
            this.turnForAI();
        } catch(error) {
            if (error === "NO_PATH_ERROR") {
                this.view.printNoteMessage("There must be at least one path to the goal for each pawn.");
            } else {
                throw error;
            }
        }
    }

    funcForDEBUG() {
        if (DEBUG) {
            this.view.render2DArrayToBoard(getShortestPathsFor(this.game.pawnOfTurn, this.game)[0]);
        }
    }

    
}