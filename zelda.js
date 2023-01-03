// NODE MODULES
const fs = require('fs'); // filesystem module

// DEPENDENCIES
const term = require( 'terminal-kit' ).terminal;
const prompt = require('prompt-sync')({
    sigint: true,
});

// ASSETS
const rooms = JSON.parse(fs.readFileSync('./assets/Rooms.txt').toString().trim());
const items = JSON.parse(fs.readFileSync('./assets/Items.txt').toString().trim());

// GLOBAL VARS
let currentRoom = 1;

// STARTS GAME
const username = prompt("What's your name? >");
console.log(`Welcome ${username}!`);
fs.readFile('./assets/Start.txt', 'utf-8', printTxt);


// FUNCTIONS
function printTxt(err, data) {
    if(err) throw err;
    term.red(data);
}

function extractJSONfromTxt(err, data) {
    if(err) throw err;
    return JSON.parse(data);
}