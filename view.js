class View {
    constructor(game) {
        this.game = game;
        this.htmlBoardTable = document.getElementById("board_table");
    }

    render() {
        for (let i = 0; i < this.htmlBoardTable.rows.length; i++) {
            for (let j = 0; j < this.htmlBoardTable.rows[0].cells.length; j++) {
                let element = this.htmlBoardTable.rows[i].cells[j];
                element.removeAttribute("onmouseenter");
                element.removeAttribute("onmouseout");
            }
        }
        
        const pawn0 = document.getElementById("pawn0");
        const pawn1 = document.getElementById("pawn1");
        this.htmlBoardTable.rows[this.game.board.pawns[0].position.row * 2].cells[this.game.board.pawns[0].position.col * 2].appendChild(pawn0);
        this.htmlBoardTable.rows[this.game.board.pawns[1].position.row * 2].cells[this.game.board.pawns[1].position.col * 2].appendChild(pawn1);
        
        this._renderValidNextWalls();
        this._renderValidNextPositions();
    }

    _renderValidNextWalls() {
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if (this.game.validNextWalls.horizontal[i][j] === true) {
                    let element = this.htmlBoardTable.rows[i * 2 + 1].cells[j * 2 + 2];
                    element.setAttribute("onmouseenter", "horizontalWallShadow(this, 'in')");
                    element.setAttribute("onmouseleave", "horizontalWallShadow(this, 'out')");
                    if (j === 0) {
                        element = this.htmlBoardTable.rows[i * 2 + 1].cells[j * 2];
                        element.setAttribute("onmouseenter", "horizontalWallShadow(this, 'in')");
                        element.setAttribute("onmouseleave", "horizontalWallShadow(this, 'out')");
                    }
                }
                
                if (this.game.validNextWalls.vertical[i][j] === true) {
                    let element = this.htmlBoardTable.rows[i * 2 + 2].cells[j * 2 + 1];
                    element.setAttribute("onmouseenter", "verticalWallShadow(this, 'in')");
                    element.setAttribute("onmouseleave", "verticalWallShadow(this, 'out')");
                    if (i === 0) {
                        element = this.htmlBoardTable.rows[i * 2].cells[j * 2 + 1];
                        element.setAttribute("onmouseenter", "verticalWallShadow(this, 'in')");
                        element.setAttribute("onmouseleave", "verticalWallShadow(this, 'out')");
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
                    element.setAttribute("onmouseenter", "pawnShadow(this," + this.game.turn + ",'in')");
                    element.setAttribute("onmouseleave", "pawnShadow(this," + this.game.turn + ",'out')");
                }
            }
        }
    }
}

function pawnShadow(x, pawnIndex, mode) {
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

function horizontalWallShadow(x, mode) {
    let color = "";
    if (mode === "in") {
        color = "rgba(222, 184, 135, 0.7)";
    }
    x.style.backgroundColor = color;
    let htmlBoardTable = x.parentElement.parentElement;
    if (x.cellIndex === 0) {
        htmlBoardTable.rows[x.parentElement.rowIndex].cells[x.cellIndex + 1].style.backgroundColor = color;
        htmlBoardTable.rows[x.parentElement.rowIndex].cells[x.cellIndex + 2].style.backgroundColor = color;
    } else {
        htmlBoardTable.rows[x.parentElement.rowIndex].cells[x.cellIndex - 1].style.backgroundColor = color;
        htmlBoardTable.rows[x.parentElement.rowIndex].cells[x.cellIndex - 2].style.backgroundColor = color;
    }
}

function verticalWallShadow(x, mode) {
    let color = "";
    if (mode === "in") {
        color = "rgba(222, 184, 135, 0.7)";
    }
    x.style.backgroundColor = color;
    let htmlBoardTable = x.parentElement.parentElement;
    if (x.parentElement.rowIndex === 0) {
        htmlBoardTable.rows[x.parentElement.rowIndex + 1].cells[x.cellIndex].style.backgroundColor = color;
        htmlBoardTable.rows[x.parentElement.rowIndex + 2].cells[x.cellIndex].style.backgroundColor = color;
    } else {
        htmlBoardTable.rows[x.parentElement.rowIndex - 1].cells[x.cellIndex].style.backgroundColor = color;
        htmlBoardTable.rows[x.parentElement.rowIndex - 2].cells[x.cellIndex].style.backgroundColor = color;
    }
}














