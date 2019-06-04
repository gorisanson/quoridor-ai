i = 0;

class View {
    constructor(controller, game) {
        this.controller = controller;
        this.game = game;
        let tinyPawnList = document.getElementsByClassName("pawn tiny");
        let wallNumList = document.getElementsByClassName("wall_num");
        if (this.game.board.pawns[0].position.row === 0) {
            tinyPawnList[0].classList.remove("pawn1");
            wallNumList[0].classList.remove("pawn1");
            tinyPawnList[0].classList.add("pawn0");
            wallNumList[0].classList.add("pawn0");

            tinyPawnList[1].classList.remove("pawn0");
            wallNumList[1].classList.remove("pawn0");
            tinyPawnList[1].classList.add("pawn1");
            wallNumList[1].classList.add("pawn1");
            this.htmlWallNum = {pawn0: wallNumList[0], pawn1: wallNumList[1]};
        } else {
            tinyPawnList[0].classList.remove("pawn0");
            wallNumList[0].classList.remove("pawn0");
            tinyPawnList[0].classList.add("pawn1");
            wallNumList[0].classList.add("pawn1");

            tinyPawnList[1].classList.remove("pawn1");
            wallNumList[1].classList.remove("pawn1");
            tinyPawnList[1].classList.add("pawn0");
            wallNumList[1].classList.add("pawn0");
            this.htmlWallNum = {pawn0: wallNumList[1], pawn1: wallNumList[0]};
        }
        this.htmlBoardTable = document.getElementById("board_table");
        this.htmlPawn0 = document.getElementById("pawn0");
        this.htmlPawn1 = document.getElementById("pawn1");
    }

    printMessage(message) {
        alert(message);
    }

    render() {
        for (let i = 0; i < this.htmlBoardTable.rows.length; i++) {
            for (let j = 0; j < this.htmlBoardTable.rows[0].cells.length; j++) {
                let element = this.htmlBoardTable.rows[i].cells[j];
                element.classList.remove("wall_shadow");
                element.removeAttribute("onmouseenter");
                element.removeAttribute("onmouseleave");
                element.onclick = null;
            }
        }

        this._renderInformationBoard();
        this._renderPawnPositions();
        this._renderWalls();
        if (this.game.winner !== null) {
            if (this.game.winner.isHumanPlayer) {
                this.printMessage("You win!")
            } else {
                this.printMessage("AI wins!")
            }
        } else {
            this._renderValidNextPawnPositions();
            this._renderValidNextWalls();
        }
    }

    _renderInformationBoard() {
        this.htmlWallNum.pawn0.innerHTML = this.game.board.pawns[0].numberOfLeftWalls;
        this.htmlWallNum.pawn1.innerHTML = this.game.board.pawns[1].numberOfLeftWalls;
    }

    _renderPawnPositions() {
        this.htmlBoardTable.rows[this.game.board.pawns[0].position.row * 2].cells[this.game.board.pawns[0].position.col * 2].appendChild(this.htmlPawn0);
        this.htmlBoardTable.rows[this.game.board.pawns[1].position.row * 2].cells[this.game.board.pawns[1].position.col * 2].appendChild(this.htmlPawn1);
    }

    _renderValidNextPawnPositions() {
        let onclickNextPawnPosition = function(e) {
            const x = e.currentTarget;
            View.pawnShadow(x, this.game.pawnIndexOfTurn, false);
            const row = x.parentElement.rowIndex / 2;
            const col = x.cellIndex / 2;
            this.controller.movePawn(row, col);
        }
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (this.game.validNextPositions[i][j] === true) {
                    let element = this.htmlBoardTable.rows[i * 2].cells[j * 2];
                    element.setAttribute("onmouseenter", "View.pawnShadow(this," + this.game.pawnIndexOfTurn + ",true)");
                    element.setAttribute("onmouseleave", "View.pawnShadow(this," + this.game.pawnIndexOfTurn + ",false)");
                    element.onclick = onclickNextPawnPosition.bind(this);
                }
            }
        }
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
        let onclickNextHorizontalWall = function(e) {
            const x = e.currentTarget;
            View.horizontalWallShadow(x, false);
            const row = (x.parentElement.rowIndex - 1) / 2;
            const col = (x.cellIndex === 0) ? 0 : ((x.cellIndex - 2) / 2);
            this.controller.putHorizontalWall(row, col);
        }
        let onclickNextVerticalWall = function(e) {
            const x = e.currentTarget;
            View.verticalWallShadow(x, false);
            const row = (x.parentElement.rowIndex === 0) ? 0 : ((x.parentElement.rowIndex - 2) / 2);
            const col = (x.cellIndex - 1) / 2;
            this.controller.putVerticalWall(row, col);
        }
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if (this.game.validNextWalls.horizontal[i][j] === true) {
                    let element = this.htmlBoardTable.rows[i * 2 + 1].cells[j * 2 + 2];
                    element.setAttribute("onmouseenter", "View.horizontalWallShadow(this, true)");
                    element.setAttribute("onmouseleave", "View.horizontalWallShadow(this, false)");                    
                    element.onclick = onclickNextHorizontalWall.bind(this);
                    if (j === 0) {
                        element = this.htmlBoardTable.rows[i * 2 + 1].cells[0];
                        element.setAttribute("onmouseenter", "View.horizontalWallShadow(this, true)");
                        element.setAttribute("onmouseleave", "View.horizontalWallShadow(this, false)");
                        element.onclick = onclickNextHorizontalWall.bind(this);
                    }
                }
                
                if (this.game.validNextWalls.vertical[i][j] === true) {
                    let element = this.htmlBoardTable.rows[i * 2 + 2].cells[j * 2 + 1];
                    element.setAttribute("onmouseenter", "View.verticalWallShadow(this, true)");
                    element.setAttribute("onmouseleave", "View.verticalWallShadow(this, false)");
                    element.onclick = onclickNextVerticalWall.bind(this);
                    if (i === 0) {
                        element = this.htmlBoardTable.rows[0].cells[j * 2 + 1];
                        element.setAttribute("onmouseenter", "View.verticalWallShadow(this, true)");
                        element.setAttribute("onmouseleave", "View.verticalWallShadow(this, false)");
                        element.onclick = onclickNextVerticalWall.bind(this);
                    }
                }
            }
        }
    }

    static pawnShadow(x, pawnIndex, turnOn) {
        if (turnOn === true) {
            const pawnId = "pawn" + pawnIndex;
            const pawn = document.getElementById(pawnId);
            const _pawnShadow = pawn.cloneNode(true);
            _pawnShadow.style.opacity = 0.3;
            x.appendChild(_pawnShadow);
        } else {
            x.removeChild(x.childNodes[0]);
        }
    }
    
    static horizontalWallShadow(x, turnOn) {
        let foo;
        if (turnOn === true) {
            const _horizontalWallShadow = document.createElement("div");
            _horizontalWallShadow.classList.add("horizontal_wall");
            _horizontalWallShadow.classList.add("shadow");
            if (x.cellIndex === 0) {
                _horizontalWallShadow.classList.add("leftmost");
            }
            x.appendChild(_horizontalWallShadow);
        } else {
            while (x.firstChild) {
                x.removeChild(x.firstChild);
            }  
        }
    }
    
    static verticalWallShadow(x, turnOn) {
        let foo;
        if (turnOn === true) {
            const _verticalWallShadow = document.createElement("div");
            _verticalWallShadow.classList.add("vertical_wall");
            _verticalWallShadow.classList.add("shadow");
            if (x.parentElement.rowIndex === 0) {
                _verticalWallShadow.classList.add("topmost");
            }
            x.appendChild(_verticalWallShadow);
        } else {
            while (x.firstChild) {
                x.removeChild(x.firstChild);
            }
        }
   
    }
}
















