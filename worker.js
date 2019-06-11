importScripts('game.js');
importScripts('ai.js');

const ai = new AI();

onmessage = function(event) {
    const game = event.data;
    const move = ai.chooseNextMove(game);
    postMessage(move);
};