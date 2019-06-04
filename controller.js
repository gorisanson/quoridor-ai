class Controller {
    constructor(isHumanPlayerFirst = true) {
        this.game = new Game(isHumanPlayerFirst);
        this.view = new View(this, this.game);
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
                this.view.printNoteMessage("There must be at least one path to goal line for each pawn.");
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
                this.view.printNoteMessage("There must be at least one path to goal line for each pawn.");
            } else {
                throw err;
            }
        }
    }
}