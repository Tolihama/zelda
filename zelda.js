// MODULES
const fs = require('fs'); // filesystem module
const term = require( 'terminal-kit' ).terminal;

// ASSETS

// GLOBAL VARS
let currentRoom = 1;

// STARTS GAME
fs.readFile('./assets/Start.txt', 'utf-8', printTxt);

// FUNCTIONS
function printTxt(err, data) {
    if(err) throw err;
    term.red(data);
}