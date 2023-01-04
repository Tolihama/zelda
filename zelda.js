console.log('Loading game...\n');

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
term.green("Hello Hero! What's your name?\n");
const username = prompt();
blankLines(1);
console.log(`Welcome ${username}!`);
blankLines(1);
term.green(fs.readFileSync('./data/Start.txt')); // Show introduction
blankLines(2);

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
                    console.log(`There is a ${items[i].name.toUpperCase()} on the floor.`);
                    break;
                }
            }
        });
    }
    
    // Print monster description if there is one in the room
    if(room.monster != null) {
        for(let i = 0; i < monsters.length; i++) {
            if(monsters[i].id === room.monster) {
                console.log(`${monsters[i].name} is waiting to kill you beside a locked door.`);
                break;
            }
        }
    }

    // Print bag and cash recap
    const itemsInBagValueList = [];
    term.cyan('\nYour bag contains the following items:');
    if(itemsInBagList.length > 0) {
        itemsInBagList.forEach( itemID => {
            for(let i = 0; i < items.length; i++) {
                if(items[i].id == itemID) {
                    itemsInBagValueList.push(items[i].value);
                    term.cyan(`\n- ${items[i].name} (value: ${items[i].value.toLocaleString('it-IT')} $)`);
                    break;
                }
            }
        });
    } else {
        console.log("\nCurrently, your bag is empty.");
    }
    const totalCash = itemsInBagValueList.length > 0 ? itemsInBagValueList.reduce( (prev, next) => prev + next) : 0;
    term.yellow(`\nCurrent cash: ${totalCash.toLocaleString('it-IT')} $\n`);

    // Print remainder for available commands
    console.log('\nAvailable Commands: MOVE, PICK, DROP, ATTACK, LOOK, EXIT, HELP\nNote: inputs are case insensitive.\n');
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
        case 'pick':
            pick(textInputArr[1]);
            break;
        case 'drop':
            break;
        case 'look':
            break; // It's actually a no action: run another iteration of the main loop, showing the info about current room
        case 'exit':
            isGameOver = true;
            break;
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


/* FUNZIONE ROTTA: LA FUNZIONE PICK NON CONSIDERA IL PARAMETRO, INOLTRE C'è UN PROBLEMA PER I NOMI DI ITEM CON GLI SPAZI */
function pick(item) {
    const itemsInRoom = rooms[currentRoom - 1].items;
    if(itemsInRoom.length > 0) {
        itemsInRoom.forEach( itemID => {
            for(let i = 0; i < items.length; i++) {
                if(items[i].id == itemID) {
                    itemsInBagList.push(items[i].id);
                    itemsInRoom.splice(i, 1);
                    term.cyan(`\n- You picked a ${items[i].name}.`);
                    break;
                }
            }
        });
    } else {
        term.red(`\NThere is no ${item} in this room!`);
    }
}

function drop() {

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