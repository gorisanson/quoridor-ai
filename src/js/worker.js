"use strict";

importScripts('game.js');
importScripts('ai.js');

onmessage = function(event) {
    const game = Game.clone(event.data.game);
    if (game.winner === null) {
        const ai = new AI(event.data.numOfMCTSSimulations, event.data.uctConst, event.data.aiDevelopMode, true);
        //const move = ai.chooseNextMove(game, event.data.variedConst);
        const move=  ai.chooseNextMoveNegamax(game);
        postMessage(move);
    }
};

