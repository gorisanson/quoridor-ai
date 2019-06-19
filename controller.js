"use strict";

const DEBUG = true;

class Controller {
    constructor(aiDevelopMode = false) {
        this.aiDevelopMode = aiDevelopMode;
        this.game = null;
        this.gameHistory = null;
        this.view = new View(this, this.aiDevelopMode);
        this.worker = null;
        this.setNewWorker();
    }

    setNewWorker() {
        this.worker = new Worker('worker.js');
        const onMessageFunc = function(event) {
            const data = event.data;
            if (typeof(data) === "number") {
                this.view.adjustProgressBar(data * 100);
            } else {
                const move = data;
                this.doMove(move);
            }
        }
        this.worker.onmessage = onMessageFunc.bind(this);
        this.worker.onerror = function(error) {
            console.log('Worker error: ' + error.message + '\n');
            throw error;
        };
    }

    startNewGame(isHumanPlayerFirst) {
        let game = new Game(isHumanPlayerFirst);
        this.game = game;
        this.gameHistory = [];
        if (this.aiDevelopMode) {
            console.log('Welcome to AI Develop Mode!');
            this.game.board.pawns[0].isHumanPlayer = true;
            this.game.board.pawns[1].isHumanPlayer = true;
        }
        this.gameHistory.push(Game.clone(this.game));
        this.view.game = game;
        this.view.render();
        //this.funcForDEBUG();
        if (!this.aiDevelopMode && !isHumanPlayerFirst) {
            this.worker.postMessage(this.game);
        }
    }

    doMove(move) {
        if (this.game.doMove(move, true)) {
            this.gameHistory.push(Game.clone(this.game));
            this.view.render();
            //this.funcForDEBUG();
            if (!this.game.pawnOfTurn.isHumanPlayer) {
                this.worker.postMessage(this.game);
            }
        } else {
            // suppose that pawnMove can not be return false, if make the View perfect.
            // so if doMove return false, it's from putWalls.
            this.view.printNoteMessage("There must be at least one path to the goal for each pawn.");
        }
    }

    undo() {
        this.worker.terminate();
        this.setNewWorker();
        this.view.adjustProgressBar(0);
        
        this.gameHistory.pop();  // this pops current game state
        let game = this.gameHistory.pop();
        while (!game.pawnOfTurn.isHumanPlayer) {
            game = this.gameHistory.pop();  // this pops last game state
        }
        this.game = game;
        this.gameHistory.push(Game.clone(this.game));
        this.view.game = game;
        this.view.render();
    }

    aiDo() {
        this.worker.postMessage(this.game); 
    }

    funcForDEBUG() {
        if (DEBUG) {
            this.view.render2DArrayToBoard(AI.getShortestDistanceToEveryPosition(this.game.pawnOfTurn, this.game));
        }
    }    
}