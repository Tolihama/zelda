console.log('Loading game...');

// NODE MODULES
const fs = require('fs'); // filesystem module

// DEPENDENCIES
const term = require( 'terminal-kit' ).terminal;
const prompt = require('prompt-sync')({
    sigint: true,
});

// ASSETS
const rooms = JSON.parse(fs.readFileSync('./data/Rooms.txt').toString().trim());
const items = JSON.parse(fs.readFileSync('./data/Items.txt').toString().trim());
const monsters = JSON.parse(fs.readFileSync('./data/Monsters.txt').toString().trim());

// GLOBAL VARS
let currentRoom = 1;
let roomData;
let isGameOver = false;
let isValidInput = false;
const storyEventsList = [];
const itemsInBagList = [];

// STARTS GAME
console.log("Hello Hero! What's your name?");
const username = prompt();
blankLines(1);
console.log(`Welcome ${username}!`);
blankLines(2);
term.green(fs.readFileSync('./data/Start.txt')); // Show introduction
blankLines(3);

// MAIN LOOP
while(!isGameOver) {
    isValidInput = false; // Reset the flag
    roomData = retrieveRoomData(currentRoom);
    showRoomData(roomData);
    while(!isValidInput) {
        console.log("What do you want to do?");
        const userCommand = prompt();
        validateCommand(userCommand.trim());
    }
}


// FUNCTIONS
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
    if(room.monster != null) {
        for(let i = 0; i < monsters.length; i++) {
            if(monsters[i].id === room.monster) {
                console.log(`${monsters[i].name} is waiting to kill you beside a locked door.\n`);
                break;
            }
        }
    }

    // Print bag and cash recap
    console.log('Your bag contains the following items:\n');

    // Print remainder for available commands
    console.log('Available Commands: MOVE, PICK, DROP, EXIT, ATTACK, LOOK\n');
}

function validateCommand(textInput) {
    const textInputArr = textInput.toLowerCase().split(' ');
    switch(textInputArr[0]) {
        case 'move':
            if(['north', 'east', 'south', 'west'].includes(textInputArr[1])) {
                moveAction(textInputArr[1]);
            } else {
                invalidCommand();
                return;
            }
            break;
        case 'exit':
            isGameOver = true;
            break;
        case 'look':
            break; // It's actually a no action: run another iteration of the main loop, showing the info about current room
        default:
            invalidCommand();
            return;
    }
    isValidInput = true;
    blankLines(1);
}

function moveAction(dir) {
    // There is a wall in that direction: invalid command
    if(roomData[dir] === null) {
        invalidCommand();
        return;
    }

    // There is the exit of the maze in that direction: trigger the noDeathEnding
    if(roomData[dir] === 0) {
        noDeathEnding();
        return;
    }

    // Last case: there is a room in that direction, so move in
    currentRoom = roomData[dir];
}

function noDeathEnding() {
    if(storyEventsList.includes(3)) {
        term.green(fs.readFileSync('./data/EndWin.txt'));
    } else {
        term.red(fs.readFileSync('./data/EndLose.txt'));
    }
    isGameOver = true;
}

function invalidCommand() {
    isValidInput = false;
    console.log('Invalid command.');
}

function blankLines(lines = 1) {
    let blankLines = "";
    for(let i = 1; i <= lines; i++) {
        blankLines += "\n";
    }
    console.log(blankLines);
}