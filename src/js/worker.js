"use strict";

/*
* Web worker.
* The code in this file will run in the worker thread (which is a background thread)
* so that the web page UI (which runs in the main thread) is not interfered.
* (If AI calculates the next move on main thread, the web page UI is stuck
* -- no button works and progress bar does not work too -- while the calculation is in progress.)
*/

importScripts('game.js');
importScripts('ai.js');

onmessage = function(event) {
    const game = Game.clone(event.data.game);
    if (game.winner === null) {
        const ai = new AI(event.data.numOfMCTSSimulations, event.data.uctConst, event.data.aiDevelopMode, true);
        const move = ai.chooseNextMove(game);
        postMessage(move);
    }
};

