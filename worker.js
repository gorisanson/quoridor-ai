"use strict";

importScripts('game.js');
importScripts('ai.js');

const ai = new AI(60000, true);

onmessage = function(event) {
    const game = Game.clone(event.data);
    if (game.winner === null) {
        const move = ai.chooseNextMove(game);
        postMessage(move);
    }
};