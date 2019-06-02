i = 0;

class View {
    constructor(controller, game) {
        this.controller = controller;
        this.game = game;
        this.htmlBoardTable = document.getElementById("board_table");
        this.htmlPawn0 = document.getElementById("pawn0");
        this.htmlPawn1 = document.getElementById("pawn1");
    }

    render() {
        for (let i = 0; i < this.htmlBoardTable.rows.length; i++) {
            for (let j = 0; j < this.htmlBoardTable.rows[0].cells.length; j++) {
                let element = this.htmlBoardTable.rows[i].cells[j];
                element.classList.remove("wall_shadow");
                element.removeAttribute("onmouseenter");
                element.removeAttribute("onmouseleave");
                element.onclick = () => {};
            }
        }
        
        this._renderPawnPositions();
        this._renderWalls();
        this._renderValidNextWalls();
        this._renderValidNextPositions();
    }

    _renderPawnPositions() {
        this.htmlBoardTable.rows[this.game.board.pawns[0].position.row * 2].cells[this.game.board.pawns[0].position.col * 2].appendChild(this.htmlPawn0);
        this.htmlBoardTable.rows[this.game.board.pawns[1].position.row * 2].cells[this.game.board.pawns[1].position.col * 2].appendChild(this.htmlPawn1);
    }

    _renderWalls() {
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if(this.game.board.walls.horizontal[i][j] === true) {
                    let horizontalWall = document.createElement("div");
                    horizontalWall.classList.add("horizontal_wall");
                    if (!this.htmlBoardTable.rows[i*2+1].cells[j*2+2].hasChildNodes()) {
                        this.htmlBoardTable.rows[i*2+1].cells[j*2+2].appendChild(horizontalWall);
                    }
                }
                if(this.game.board.walls.vertical[i][j] === true) {
                    let verticalWall = document.createElement("div");
                    verticalWall.classList.add("vertical_wall");
                    if (!this.htmlBoardTable.rows[i*2+2].cells[j*2+1].hasChildNodes()) {
                        this.htmlBoardTable.rows[i*2+2].cells[j*2+1].appendChild(verticalWall);
                    }
                }
            }
        }        
    }

    _renderValidNextWalls() {
        let onclickHorizontalFunc = function(e) {
            View.horizontalWallShadow(e.currentTarget, 'out');
            this.controller.putHorizontalWall(e);
        }
        let onclickVerticalFunc = function(e) {
            View.verticalWallShadow(e.currentTarget, 'out');
            this.controller.putVerticalWall(e);
        }
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if (this.game.validNextWalls.horizontal[i][j] === true) {
                    let element = this.htmlBoardTable.rows[i * 2 + 1].cells[j * 2 + 2];
                    element.setAttribute("onmouseenter", "View.horizontalWallShadow(this, 'in')");
                    element.setAttribute("onmouseleave", "View.horizontalWallShadow(this, 'out')");                    
                    element.onclick = onclickHorizontalFunc.bind(this);
                    if (j === 0) {
                        element = this.htmlBoardTable.rows[i * 2 + 1].cells[j * 2];
                        element.setAttribute("onmouseenter", "View.horizontalWallShadow(this, 'in')");
                        element.setAttribute("onmouseleave", "View.horizontalWallShadow(this, 'out')");
                        element.onclick = onclickHorizontalFunc.bind(this);
                    }
                }
                
                if (this.game.validNextWalls.vertical[i][j] === true) {
                    let element = this.htmlBoardTable.rows[i * 2 + 2].cells[j * 2 + 1];
                    element.setAttribute("onmouseenter", "View.verticalWallShadow(this, 'in')");
                    element.setAttribute("onmouseleave", "View.verticalWallShadow(this, 'out')");
                    element.onclick = onclickVerticalFunc.bind(this);
                    if (i === 0) {
                        element = this.htmlBoardTable.rows[i * 2].cells[j * 2 + 1];
                        element.setAttribute("onmouseenter", "View.verticalWallShadow(this, 'in')");
                        element.setAttribute("onmouseleave", "View.verticalWallShadow(this, 'out')");
                        element.onclick = onclickVerticalFunc.bind(this);
                    }
                }
            }
        }
    }

    _renderValidNextPositions() {
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (this.game.validNextPositions[i][j] === true) {
                    let element = this.htmlBoardTable.rows[i * 2].cells[j * 2];
                    element.setAttribute("onmouseenter", "View.pawnShadow(this," + this.game.pawnIndexOfTurn + ",'in')");
                    element.setAttribute("onmouseleave", "View.pawnShadow(this," + this.game.pawnIndexOfTurn + ",'out')");
                }
            }
        }
    }

    static pawnShadow(x, pawnIndex, mode) {
        if (mode === "in") {
            let pawnId = "pawn" + pawnIndex;
            let pawn = document.getElementById(pawnId);
            let pawnSh = pawn.cloneNode(true);
            pawnSh.style.opacity = 0.3;
            x.appendChild(pawnSh);
        } else {
            x.removeChild(x.childNodes[0]);
        }
    }
    
    static horizontalWallShadow(x, mode) {
        let foo;
        if (mode === "in") {
            let _horizontalWallShadow = document.createElement("div");
            _horizontalWallShadow.classList.add("horizontal_wall");
            _horizontalWallShadow.classList.add("shadow");
            if (x.cellIndex === 0) {
                _horizontalWallShadow.classList.add("leftmost");
            }
            x.appendChild(_horizontalWallShadow);
        } else {
            x.removeChild(x.childNodes[0]);  
        }
    }
    
    static verticalWallShadow(x, mode) {
        let foo;
        if (mode === "in") {
            let _verticalWallShadow = document.createElement("div");
            _verticalWallShadow.classList.add("vertical_wall");
            _verticalWallShadow.classList.add("shadow");
            if (x.parentElement.rowIndex === 0) {
                _verticalWallShadow.classList.add("topmost");
            }
            x.appendChild(_verticalWallShadow);
        } else {
            x.removeChild(x.childNodes[0]);
        }
   
    }
}
















