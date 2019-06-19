"use strict";

importScripts('game.js');
importScripts('ai.js');

onmessage = function(event) {
    const game = Game.clone(event.data.game);
    if (game.winner === null) {
        const ai = new AI(60000, event.data.aiDevelopMode, true);
        const move = ai.chooseNextMove(game);
        postMessage(move);
    }
};