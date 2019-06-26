"use strict";

class Controller {
    constructor(uctConst, aiDevelopMode = false) {
        this.aiDevelopMode = aiDevelopMode;
        if (this.aiDevelopMode) {
            console.log('Welcome to AI Develop Mode!');
        }
        this.game = null;
        this.gameHistory = null;
        this.gameHistoryTrashCan = null;  // For Redo
        this.view = new View(this, this.aiDevelopMode);
        this.worker = null;
        this.numOfMCTSSimulations = null;
        this.uctConst = uctConst;
    }

    setNewWorker() {
        if (this.worker !== null) {
            this.worker.terminate();
        }
        this.worker = new Worker('js/worker.js');
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

    startNewGame(isHumanPlayerFirst, numOfMCTSSimulations) {
        this.numOfMCTSSimulations = numOfMCTSSimulations;
        this.setNewWorker();
        let game = new Game(isHumanPlayerFirst);
        this.game = game;
        this.gameHistory = [];
        this.gameHistoryTrashCan = [];
        if (this.aiDevelopMode) {
            this.game.board.pawns[0].isHumanPlayer = true;
            this.game.board.pawns[1].isHumanPlayer = true;
        }
        this.gameHistory.push(Game.clone(this.game));
        this.view.game = this.game;
        this.view.render();
        if (this.aiDevelopMode) {
            this.renderDistancesForAIDevelopMode();
        }
        if (!this.aiDevelopMode && !isHumanPlayerFirst) {
            this.aiDo();
        }
    }

    doMove(move) {
        if (this.game.doMove(move, true)) {
            this.gameHistory.push(Game.clone(this.game));
            this.gameHistoryTrashCan = [];
            this.view.render();
            if (this.aiDevelopMode) {
                this.renderDistancesForAIDevelopMode();
            }
            if (!this.game.pawnOfTurn.isHumanPlayer) {
                this.aiDo();
            }
        } else {
            // suppose that pawnMove can not be return false, if make the View perfect.
            // so if doMove return false, it's from placeWalls.
            this.view.printImpossibleWallMessage();
        }
    }

    undo() {
        this.setNewWorker();
        this.view.adjustProgressBar(0);
        
        // this pops and pushes current game state
        this.gameHistoryTrashCan.push(this.gameHistory.pop());  
        
        let game = this.gameHistory.pop(); // this pops one-turn-before game state
        while (!game.pawnOfTurn.isHumanPlayer) {
            this.gameHistoryTrashCan.push(game);
            game = this.gameHistory.pop();  // this pops last game state
        }
        this.game = game;
        this.gameHistory.push(Game.clone(this.game));
        this.view.game = this.game;
        this.view.render();
    }

    redo() {
        this.game = this.gameHistoryTrashCan.pop();
        this.gameHistory.push(Game.clone(this.game));
        this.view.game = this.game;
        this.view.render();
    }

    aiDo() {
        this.worker.postMessage({game: this.game, numOfMCTSSimulations: this.numOfMCTSSimulations, uctConst: this.uctConst, variedConst: false, aiDevelopMode: this.aiDevelopMode});
    }

    renderDistancesForAIDevelopMode() {
        //this.view.render2DArrayToBoard(AI.getShortestDistanceToEveryPosition(this.game.pawnOfTurn, this.game));
        this.view.render2DArrayToBoard(AI.getRandomShortestPathToGoal(this.game.pawnOfTurn, this.game)[0]);
    }    
}


class AICompetition {
    constructor(isHumanPlayerFirstArrangement, numOfMCTSSimulations0, uctConst0, numOfMCTSSimulations1, uctConst1, numOfGamesToCompete = 50) {
        this.isHumanPlayerFirstArrangement = isHumanPlayerFirstArrangement;
        this.numOfGames = 0;
        this.numOfGamesToCompete = numOfGamesToCompete;
        this.ais = [
            {numOfMCTSSimulations: numOfMCTSSimulations0, uctConst: uctConst0, variedConst: false, numWinsLight: 0, numWinsDark: 0},
            {numOfMCTSSimulations: numOfMCTSSimulations1, uctConst: uctConst1, variedConst: true, numWinsLight: 0, numWinsDark: 0}
        ];
        this.game = null;
        this.gameHistory = []; // for view check this length propery...
        this.gameHistoryTrashCan = []; // for view check this length propery...
        this.view = new View(this, this.aiDevelopMode);
        this.worker = null;
        this.setNewWorker();
        this.startNewGame();
        this.view.htmlChooseAILevelMessageBox.classList.add("hidden");
    }

    setNewWorker() {
        if (this.worker !== null) {
            this.worker.terminate();
        }
        this.worker = new Worker('js/worker.js');
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

    startNewGame() {
        let game = new Game(this.isHumanPlayerFirstArrangement);
        this.game = game;
        this.game.board.pawns[0].isHumanPlayer = true;
        this.game.board.pawns[1].isHumanPlayer = true;
        this.view.game = this.game;
        this.view.render();
        console.log("Game start!")
        const ai_light = this.ais[this.numOfGames%2];
        console.log(ai_light.numOfMCTSSimulations, ai_light.uctConst, "is light-colored pawn!");
        this.aiDo();
    }

    doMove(move) {
        if (this.game.doMove(move, true)) {
            this.view.render();
            if (this.game.winner === null) {
                this.aiDo();
            } else { // game ended.
                if (this.game.winner.index === 0) {
                    this.ais[(this.numOfGames % 2)].numWinsLight++;
                } else {
                    this.ais[((this.numOfGames + 1) % 2)].numWinsDark++;
                }
                this.numOfGames++;
                console.log("Game ended! Here the statistics following...")
                console.log("Number of total games:", this.numOfGames);
                console.log(this.ais[0].numOfMCTSSimulations, this.ais[0].uctConst, "numWinsLight:", this.ais[0].numWinsLight, "numWinsDark", this.ais[0].numWinsDark);
                console.log(this.ais[1].numOfMCTSSimulations, this.ais[1].uctConst, "numWinsLight:", this.ais[1].numWinsLight, "numWinsDark", this.ais[1].numWinsDark);
                if (this.numOfGames < this.numOfGamesToCompete) {
                    this.startNewGame();
                } else {
                    console.log("Competition Ended.");
                }
            }
        } else {
            // suppose that pawnMove can not be return false, if make the View perfect.
            // so if doMove return false, it's from placeWalls.
            this.view.printImpossibleWallMessage();
        }
    }

    aiDo() {
        const index = (this.numOfGames + this.game.turn) % 2 
        this.worker.postMessage({game: this.game, numOfMCTSSimulations: this.ais[index].numOfMCTSSimulations, uctConst: this.ais[index].uctConst, variedConst: this.ais[index].variedConst, aiDevelopMode: false});
    }
}


