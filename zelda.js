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
const startText = fs.readFileSync('./assets/Start.txt', { encoding: 'utf8' });

// GLOBAL VARS
let currentRoom = 1;
let isGameOver = false;
let isValidInput = false;

// STARTS GAME
const username = prompt("What's your name? >");
blankLines(1);
console.log(`Welcome ${username}!`);
blankLines(2);
term.green(startText);
blankLines(3);

// MAIN LOOP
while(!isGameOver) {
    isValidInput = false; // Reset the flag
    showRoomData(retrieveRoomData(currentRoom));
    while(!isValidInput) {
        const userComand = prompt('What do you want to do? >');
        validateCommand(userComand.trim());
    }
}


// FUNCTIONS
function printTxt(err, data) {
    if(err) throw err;
    term.red(data);
    console.log('\n\n\n');
}

function extractJSONfromTxt(err, data) {
    if(err) throw err;
    return JSON.parse(data);
}

function retrieveRoomData(roomNumber) {
    for(let i = 0; i < rooms.length; i++) {
        if(rooms[i].id === roomNumber) return rooms[i];
    }
}

function showRoomData(room) {
    // Print current room number
    term.red(`Currently you are in Room ${room.id}. ${room.description}.\n`);

    // Print available directions
    ['north', 'east', 'south', 'west'].forEach(dir => {
        if(room[dir] != null) term.blue(`There is a room to your ${dir.charAt(0).toUpperCase()}${dir.slice(1)}.\n`);
    });

    // Print available items in the room
    if(room.items.length > 0) {
        room.items.forEach( itemID => {
            for(let i = 0; i < items.length; i++) {
                if(items[i].id == itemID) {
                    console.log(`There is a ${items[i].name.toUpperCase()} on the floor.\n`);
                    break;
                }
            }
        });
    }
    
    // Print monster description if there is one in the room
    if(room.monster != null) console.log('there is a monster\n');

    // Print remainder for available commands
    console.log('Available Commands: MOVE, PICK, DROP, EXIT, ATTACK, LOOK\n');
}

function validateCommand(textInput) {
    const textInputArr = textInput.toLowerCase().split(' ');
    switch(textInputArr[0]) {
        case 'exit':
            isGameOver = true;
            break;
        case 'look':
            break; // It's actually a no action: run another iteration of the main loop, showing the info about current room
        default:
            isValidInput = false;
            console.log('Invalid command.');
            return;
    }
    isValidInput = true;
}

function blankLines(lines = 1) {
    let blankLines = "";
    for(let i = 1; i <= lines; i++) {
        blankLines += "\n";
    }
    console.log(blankLines);
}