i = 0;

class View {
    constructor(controller) {
        this.controller = controller;
        this._game = null;

        this.button = {confirm: document.getElementById("confirm_button"), cancel: document.getElementById("cancel_button")};
        this.button.confirm.disabled = true;
        this.button.cancel.disabled = true;
        let buttonContainer = document.getElementsByClassName("button_container")[0];
        let buttonContainerStyle = window.getComputedStyle(buttonContainer);
        this.isHoverPossible = (buttonContainerStyle.display === "none");
        if (!this.isHoverPossible) {
            let onclickConfirmButton = function(e) {
                this.button.confirm.disabled = true;
                this.button.cancel.disabled = true;
                const clickedPawns = document.getElementsByClassName("pawn clicked");
                if (clickedPawns.length > 0) {
                    const clickedPawn = clickedPawns[0];
                    const row = clickedPawn.parentElement.parentElement.rowIndex / 2;
                    const col = clickedPawn.parentElement.cellIndex / 2;
                    View.cancelPawnClick();
                    this.controller.movePawn(row, col);
                } else {
                    const horizontalWallShadows = document.getElementsByClassName("horizontal_wall shadow");
                    const verticalWallShadows = document.getElementsByClassName("vertical_wall shadow");
                    if (horizontalWallShadows.length > 0) {
                        const horizontalWallShadow = horizontalWallShadows[0];
                        const row = (horizontalWallShadow.parentElement.parentElement.rowIndex - 1) / 2;
                        const col = horizontalWallShadow.parentElement.cellIndex / 2;
                        View.cancelWallShadows();
                        this.controller.putHorizontalWall(row, col);
                    } else if (verticalWallShadows.length > 0) {
                        const verticalWallShadow = verticalWallShadows[0];
                        const row = verticalWallShadow.parentElement.parentElement.rowIndex / 2;
                        const col = (verticalWallShadow.parentElement.cellIndex - 1) / 2;
                        View.cancelWallShadows();
                        this.controller.putVerticalWall(row, col);
                    }
                }
            }
            let onclickCancelButton = function(e) {
                View.cancelPawnClick();
                View.cancelWallShadows();
                this.button.confirm.disabled = true;
                this.button.cancel.disabled = true;
            }
            this.button.confirm.onclick = onclickConfirmButton.bind(this);
            this.button.cancel.onclick = onclickCancelButton.bind(this);
        }

        this.htmlBoardTable = document.getElementById("board_table");
        this.htmlPawns = [document.getElementById("pawn0"), document.getElementById("pawn1")];
        this.htmlPawns[0].classList.add("hidden")
        this.htmlPawns[1].classList.add("hidden");
        this.htmlMessageBox = document.getElementById("message_box");
        this.htmlChoosePawnMessageBox = document.getElementById("choose_pawn_message_box");
        
        
        // for choosing pawn
        let pawn0Button = document.getElementsByClassName("pawn pawn0 button")[0];
        let pawn1Button = document.getElementsByClassName("pawn pawn1 button")[0];
        let onclickPawnButton = function(e) {
            const x = e.target;
            if (x.classList.contains("pawn0")) {
                this.startNewGame(true);
            } else if (x.classList.contains("pawn1")) {
                this.startNewGame(false);
            }
        }
        pawn0Button.onclick = onclickPawnButton.bind(this);
        pawn1Button.onclick = onclickPawnButton.bind(this);
    }

    set game(game) {
        this._game = game;
        this.htmlPawns[0].classList.remove("hidden");
        this.htmlPawns[1].classList.remove("hidden");

        // initialize number of left walls box
        let symbolPawnList = document.getElementsByClassName("pawn symbol");
        let wallNumList = document.getElementsByClassName("wall_num");
        if (this.game.board.pawns[0].position.row === 0) {
            symbolPawnList[0].classList.remove("pawn1");
            wallNumList[0].classList.remove("pawn1");
            symbolPawnList[0].classList.add("pawn0");
            wallNumList[0].classList.add("pawn0");

            symbolPawnList[1].classList.remove("pawn0");
            wallNumList[1].classList.remove("pawn0");
            symbolPawnList[1].classList.add("pawn1");
            wallNumList[1].classList.add("pawn1");
            this.htmlWallNum = {pawn0: wallNumList[0], pawn1: wallNumList[1]};
        } else {
            symbolPawnList[0].classList.remove("pawn0");
            wallNumList[0].classList.remove("pawn0");
            symbolPawnList[0].classList.add("pawn1");
            wallNumList[0].classList.add("pawn1");

            symbolPawnList[1].classList.remove("pawn1");
            wallNumList[1].classList.remove("pawn1");
            symbolPawnList[1].classList.add("pawn0");
            wallNumList[1].classList.add("pawn0");
            this.htmlWallNum = {pawn0: wallNumList[1], pawn1: wallNumList[0]};
        }
    }
    get game() {
        return this._game;
    }
   
    startNewGame(isHumanPlayerFirst) {
        this.htmlChoosePawnMessageBox.classList.add("hidden");
        this.controller.startNewGame(isHumanPlayerFirst);
    }

    printMessage(message) {
        this.htmlMessageBox.innerHTML = message;
    }

    printNoteMessage(message) {
        let previousBox;
        if (previousBox = document.getElementById("note_message_box")) {
            previousBox.remove();
        }
        const box = document.createElement("div");
        box.classList.add("fade_box")
        box.classList.add("inout");
        box.id = "note_message_box";
        box.innerHTML = message;
        const boardTableContainer = document.getElementById("board_table_container");
        boardTableContainer.appendChild(box);
    }

    printGameResultMessage(message) {
        let previousBox;
        if (previousBox = document.getElementById("game_result_message_box")) {
            previousBox.remove();
        }
        const box = document.createElement("div");
        box.classList.add("fade_box")
        box.classList.add("inout");
        box.id = "game_result_message_box";
        box.innerHTML = message;
        const boardTableContainer = document.getElementById("board_table_container");
        boardTableContainer.appendChild(box);
    }

    render() {
        for (let i = 0; i < this.htmlBoardTable.rows.length; i++) {
            for (let j = 0; j < this.htmlBoardTable.rows[0].cells.length; j++) {
                let element = this.htmlBoardTable.rows[i].cells[j];
                element.removeAttribute("onmouseenter");
                element.removeAttribute("onmouseleave");
                element.onclick = null;
            }
        }
        // remove pawn shadows which are for previous board
        let previousPawnShadows = document.getElementsByClassName("pawn shadow");
        while(previousPawnShadows.length !== 0) {
            previousPawnShadows[0].remove();
        }

        this._renderNumberOfLeftWalls();
        this._renderPawnPositions();
        this._renderWalls();
        if (this.game.winner !== null) {
            if (this.game.winner.isHumanPlayer) {
                this.printGameResultMessage("You win!")
                this.printMessage("You win!")
            } else {
                this.printGameResultMessage("AI wins!")
                this.printMessage("AI wins!")
            }
        } else {
            this._renderValidNextPawnPositions();
            this._renderValidNextWalls();
            if (this.game.pawnOfTurn.isHumanPlayer) {
                this.printMessage("Your turn")
            } else {
                this.printMessage("AI's turn")
            }
        }
    }

    _renderNumberOfLeftWalls() {
        this.htmlWallNum.pawn0.innerHTML = this.game.board.pawns[0].numberOfLeftWalls;
        this.htmlWallNum.pawn1.innerHTML = this.game.board.pawns[1].numberOfLeftWalls;
    }

    _renderPawnPositions() {
        this.htmlBoardTable.rows[this.game.board.pawns[0].position.row * 2].cells[this.game.board.pawns[0].position.col * 2].appendChild(this.htmlPawns[0]);
        this.htmlBoardTable.rows[this.game.board.pawns[1].position.row * 2].cells[this.game.board.pawns[1].position.col * 2].appendChild(this.htmlPawns[1]);
    }

    _renderValidNextPawnPositions() {
        let onclickNextPawnPosition;
        if (this.isHoverPossible) {
            onclickNextPawnPosition = function(e) {
                const x = e.target;
                const row = x.parentElement.parentElement.rowIndex / 2;
                const col = x.parentElement.cellIndex / 2;
                this.controller.movePawn(row, col);
            }
        } else {
            onclickNextPawnPosition = function(e) {
                View.cancelPawnClick();
                View.cancelWallShadows();
                const x = e.target;
                let pawnShadows = document.getElementsByClassName("pawn shadow");
                for (let i = 0; i < pawnShadows.length; i++) {
                    if (pawnShadows[i] !== x) {
                        pawnShadows[i].classList.add("hidden");
                    }
                }
                x.classList.add("clicked");
                this.button.confirm.disabled = false;
                this.button.cancel.disabled = false;
            }
        }
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (this.game.validNextPositions[i][j] === true) {
                    let element = this.htmlBoardTable.rows[i * 2].cells[j * 2];
                    let pawnShadow = document.createElement("div");
                    pawnShadow.classList.add("pawn");
                    pawnShadow.classList.add("pawn" + this.game.pawnIndexOfTurn);
                    pawnShadow.classList.add("shadow");
                    element.appendChild(pawnShadow);
                    pawnShadow.onclick = onclickNextPawnPosition.bind(this);
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
                    if (!this.htmlBoardTable.rows[i*2+1].cells[j*2].hasChildNodes()) {
                        this.htmlBoardTable.rows[i*2+1].cells[j*2].appendChild(horizontalWall);
                    }
                }
                if(this.game.board.walls.vertical[i][j] === true) {
                    let verticalWall = document.createElement("div");
                    verticalWall.classList.add("vertical_wall");
                    if (!this.htmlBoardTable.rows[i*2].cells[j*2+1].hasChildNodes()) {
                        this.htmlBoardTable.rows[i*2].cells[j*2+1].appendChild(verticalWall);
                    }
                }
            }
        }        
    }

    _renderValidNextWalls() {
        let onclickNextHorizontalWall, onclickNextVerticalWall;
        if (this.isHoverPossible) {
            onclickNextHorizontalWall = function(e) {
                const x = e.currentTarget;
                View.horizontalWallShadow(x, false);
                const row = (x.parentElement.rowIndex - 1) / 2;
                const col = x.cellIndex / 2;
                this.controller.putHorizontalWall(row, col);
            }
            onclickNextVerticalWall = function(e) {
                const x = e.currentTarget;
                View.verticalWallShadow(x, false);
                const row = x.parentElement.rowIndex / 2;
                const col = (x.cellIndex - 1) / 2;
                this.controller.putVerticalWall(row, col);
            }
        } else {
            onclickNextHorizontalWall = function(e) {
                View.cancelPawnClick();
                View.cancelWallShadows();
                const x = e.currentTarget;
                View.horizontalWallShadow(x, true);
                this.button.confirm.disabled = false;
                this.button.cancel.disabled = false;
            }
            onclickNextVerticalWall = function(e) {
                View.cancelPawnClick();
                View.cancelWallShadows();
                const x = e.currentTarget;
                View.verticalWallShadow(x, true);
                this.button.confirm.disabled = false;
                this.button.cancel.disabled = false;
            }
        }
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if (this.game.validNextWalls.horizontal[i][j] === true) {
                    let element = this.htmlBoardTable.rows[i * 2 + 1].cells[j * 2];
                    if (this.isHoverPossible) {
                        element.setAttribute("onmouseenter", "View.horizontalWallShadow(this, true)");
                        element.setAttribute("onmouseleave", "View.horizontalWallShadow(this, false)");
                    }                    
                    element.onclick = onclickNextHorizontalWall.bind(this);
                }
                if (this.game.validNextWalls.vertical[i][j] === true) {
                    let element = this.htmlBoardTable.rows[i * 2].cells[j * 2 + 1];
                    if (this.isHoverPossible) {
                        element.setAttribute("onmouseenter", "View.verticalWallShadow(this, true)");
                        element.setAttribute("onmouseleave", "View.verticalWallShadow(this, false)");
                    }
                    element.onclick = onclickNextVerticalWall.bind(this);
                }
            }
        }
    }

    static horizontalWallShadow(x, turnOn) {
        let foo;
        if (turnOn === true) {
            const _horizontalWallShadow = document.createElement("div");
            _horizontalWallShadow.classList.add("horizontal_wall");
            _horizontalWallShadow.classList.add("shadow");
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
            x.appendChild(_verticalWallShadow);
        } else {
            while (x.firstChild) {
                x.removeChild(x.firstChild);
            }
        }
   
    }

    static cancelWallShadows() {
        let previousWallShadows = document.getElementsByClassName("horizontal_wall shadow");
        while(previousWallShadows.length !== 0) {
            previousWallShadows[0].remove();
        }
        previousWallShadows = document.getElementsByClassName("vertical_wall shadow");
        while(previousWallShadows.length !== 0) {
            previousWallShadows[0].remove();
        }
    }
    
    static cancelPawnClick() {
        let pawnShadows = document.getElementsByClassName("pawn shadow");
        for (let i = 0; i < pawnShadows.length; i++) {
            pawnShadows[i].classList.remove("clicked");
            pawnShadows[i].classList.remove("hidden");
        }
    }
}
















