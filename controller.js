"use strict";

const DEBUG = true;

class Controller {
    constructor(aiDevelopMode = false) {
        this.aiDevelopMode = aiDevelopMode;
        this.game = null;
        this.view = new View(this, this.aiDevelopMode);
        this.worker = new Worker('worker.js');
        const onMessageFunc = function(event) {
            const move = event.data;
            this.doMove(...move);
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
        if (this.aiDevelopMode) {
            console.log('ai.DevelopMode:', this.aiDevelopMode);
            this.game.board.pawns[0].isHumanPlayer = true;
            this.game.board.pawns[1].isHumanPlayer = true;
            this.gameHistory = [];
            this.gameHistory.push(Game.clone(this.game));
        }
        this.view.game = game;
        this.view.render();
        this.funcForDEBUG();
        if (!this.aiDevelopMode && !isHumanPlayerFirst) {
            this.worker.postMessage(this.game);
        }
    }

    doMove(movePawnTo, putHorizontalWallAt, putVerticalWallAt) {
        if (this.game.doMove(movePawnTo, putHorizontalWallAt, putVerticalWallAt)) {
            if (this.aiDevelopMode) {
                this.gameHistory.push(Game.clone(this.game));
            }
            this.view.render();
            this.funcForDEBUG();
            if (!this.game.pawnOfTurn.isHumanPlayer) {
                this.worker.postMessage(this.game);
            }
        } else {
            // suppose that pawnMove can not be return false, if make the View perfect.
            // so if doMove return false, it's form putWalls.
            this.view.printNoteMessage("There must be at least one path to the goal for each pawn.");
        }
    }

    undo() {
        this.gameHistory.pop();  // this pops current game state
        const game = this.gameHistory.pop();  // this pops last game state
        
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