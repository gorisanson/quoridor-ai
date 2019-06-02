class Controller {
    constructor() {
        this.game = new Game();
        this.view = new View(this, this.game);
        this.updateView();
    }

    updateView() {
        this.view.render();
    }

    putHorizontalWall(e) {
        let x;
        if (x = e.currentTarget) {
            let row = (x.parentElement.rowIndex - 1) / 2;
            let col; 
            if (x.cellIndex === 0) {
                col = 0;
            } else {
                col = (x.cellIndex - 2) / 2;
            }
            this.game.putHorizontalWall(row, col);
            this.updateView();
        }
    }

    putVerticalWall(e) {
        let x;
        if (x = e.currentTarget) {
            let col = (x.cellIndex - 1) / 2;
            let row;
            if (x.parentElement.rowIndex === 0) {
                row = 0;
            } else {
                row = (x.parentElement.rowIndex - 2) / 2;
            }
            this.game.putVerticalWall(row, col);
            this.updateView();
        }
    }
}