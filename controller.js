class Controller {
    constructor() {
        this.game = null;
        this.view = new View(this);
    }

    startNewGame(isHumanPlayerFirst) {
        let game = new Game(isHumanPlayerFirst);
        this.game = game;
        this.view.game = game;
        this.view.render();
    }

    movePawn(row, col) {
        this.game.movePawn(row, col);
        this.view.render();
    }

    putHorizontalWall(row, col) {
        try {
            this.game.putHorizontalWall(row, col);
            this.view.render();
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
        }
        catch(err) {
            if (err === "NO_PATH_ERROR") {
                this.view.printNoteMessage("There must be at least one path to the goal for each pawn.");
            } else {
                throw err;
            }
        }
    }
}