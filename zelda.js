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
        validateCommand(userCommand.trim().toLocaleLowerCase());
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
        if(room[dir] != null) term.blue(`There is a room to your ${dir.charAt(0).toUpperCase()}${dir.slice(1)}. `);
    });

    // Print available items in the room
    if(room.items.length > 0) {
        room.items.forEach( itemID => {
            for(let i = 0; i < items.length; i++) {
                if(items[i].id == itemID) {
                    console.log(`\nThere is a ${items[i].name.toUpperCase()} on the floor.`);
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
    term.cyan('\nYour bag contains the following items:\n');
    if(itemsInBagList.length > 0) {
        itemsInBagList.forEach( itemID => {
            for(let i = 0; i < items.length; i++) {
                if(items[i].id == itemID) {
                    itemsInBagValueList.push(items[i].value);
                    term.cyan(`- ${items[i].name} (value: ${items[i].value.toLocaleString('it-IT')} $)\n`);
                    break;
                }
            }
        });
    } else {
        console.log("Currently, your bag is empty.");
    }
    const totalCash = itemsInBagValueList.length > 0 ? itemsInBagValueList.reduce( (prev, next) => prev + next) : 0;
    term.yellow(`Current cash: ${totalCash.toLocaleString('it-IT')} $\n`);

    // Print remainder for available commands
    console.log('\nAvailable Commands: MOVE, PICK, DROP, ATTACK, LOOK, EXIT, HELP\nNote: inputs are case insensitive.\n');
}

/**
 * Takes a string (trimmed and in lowercase) and validates as a valid command in the game
 * @param {string} textInput 
 * @returns void
 */
function validateCommand(textInput) {
    const textInputArr = textInput.split(' ');
    const command = textInputArr[0];
    const commandSelector = textInputArr.splice(1).join(' ');
    switch(command) {
        case 'move':
            if(['north', 'east', 'south', 'west'].includes(commandSelector)) {
                moveAction(commandSelector);
            } else {
                invalidCommand();
                return;
            }
            break;
        case 'pick':
            pick(commandSelector);
            break;
        case 'drop':
            drop(commandSelector);
            break;
        case 'look':
            term.green("\nYou look around.");
            break; // It's actually a no action: run another iteration of the main loop, showing the info about current room
        case 'exit':
            isGameOver = true;
            term.red("\nYou quit the game. Goodbye!");
            break;
        default:
            invalidCommand();
            return;
    }
    isValidInput = true;
    blankLines(1);
    term.blue('###########################');
    blankLines(1);
}

function moveAction(dir) {
    // There is a wall in that direction: invalid command
    if(roomData[dir] === null) {
        invalidCommand();
        return;
    }

    // There is the exit of the maze in that direction: ask confirm
    if(roomData[dir] === 0) {

        blankLines(1);
        const princessNotFoundString = storyEventsList.includes(3) ? "" : " You didn't found the princess yet.";
        term.red(`This is the exit.${princessNotFoundString} Moving in that direction will conclude your adventure. Are you sure to proceed? [YES | NO]\n`);
        const userConfirm = prompt();
        blankLines(1);

        switch(userConfirm.toLocaleLowerCase().trim()) {
            // If action is confirmed, trigger the noDeathEnding
            case 'yes':
                noDeathEnding();
                return;
            // Otherwise, cancel the comand
            case 'no':
                term.red('You changed your mind and decided to not proceed.');
                return;
            // If the answer is invalid, cancel the comand and print a "invalid command" message
            default:
                invalidCommand();
                return;
        }
    }

    // Last case: there is a room in that direction, so move in
    currentRoom = roomData[dir];
    term.red(`You moved to ${dir}.`);
}

/**
 * Command PICK function. Takes a string as parameter with the name of the item the user wants to pick.
 * @param {string} item 
 * @returns void
 */
function pick(item) {
    const itemsInRoom = rooms[currentRoom - 1].items;
    let itemExistInRoom = false;

    if(itemsInRoom.length > 0) {
        // Search the item requested by user in the all items array, so you have the item ID
        let itemID;
        let itemName;
        for(let i = 0; i < items.length; i++) {
            if(items[i].name.toLocaleLowerCase() === item) {
                itemID = items[i].id;
                itemName = items[i].name;
                break;
            }
        }

        // If you find an existing item, you can search its id in the itemsInRoom array, add it in the bag array and remove from the itemsInRoom array
        if(typeof itemID === 'number') {

            for(let i = 0; i < itemsInRoom.length; i++) {

                if(itemsInRoom[i] === itemID) {
                    itemExistInRoom = true;
    
                    itemsInBagList.push(itemID);
                    itemsInRoom.splice(i, 1);

                    term.green(`\nYou picked a ${itemName}.`);
                    break;
                }

            }
        }
    }
    
    if(!itemExistInRoom) term.red(`\nThere is no ${item} in this room!`);
}

/**
 * 
 */
function drop(item) {
    const itemsInRoom = rooms[currentRoom - 1].items;
    let itemExistInBag = false;

    if(itemsInBagList.length > 0) {
        // Search the item requested by user in the all items array, so you have the item ID
        let itemID;
        let itemName;
        for(let i = 0; i < items.length; i++) {
            if(items[i].name.toLocaleLowerCase() === item) {
                itemName = items[i].name;
                itemID = items[i].id;
                break;
            } 
        }

        // If you find an existing item, you can search its id in the itemsInBag array, add it in the itemsinRoom array and remove from the bag
        if(typeof itemID === 'number') {

            for(let i = 0; i < itemsInBagList.length; i++) {

                if(itemsInBagList[i] === itemID) {
                    itemExistInBag = true;
    
                    itemsInRoom.push(itemID);
                    itemsInBagList.splice(i, 1);

                    term.green(`\nYou picked a ${itemName}.`);
                    break;
                }

            }
        }
    }
    
    if(!itemExistInBag) term.red(`\nThere is no ${item} in your bag!`);
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
    term.red('Invalid command.');
}

/* UTILITIES FUNCTION */
/**
 * Prints blank lines on the console
 * @param {string} lines 
 * @returns void
 */
function blankLines(lines = 1) {
    let blankLines = "";
    for(let i = 1; i <= lines; i++) {
        blankLines += "\n";
    }
    console.log(blankLines);
}