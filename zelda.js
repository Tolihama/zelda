console.log('Loading game...\n');

// DEPENDENCIES
const prompt = require('prompt-sync')({
    sigint: true,
});

// ASSETS
const { fs, path, term, rooms, storyEvents } = require("./js/storyEvents.js");
const items     = JSON.parse(fs.readFileSync('./data/Items.txt').toString().trim());
const monsters  = JSON.parse(fs.readFileSync('./data/Monsters.txt').toString().trim());

// GLOBAL VARS
let currentRoomIndex = 1;
let currentRoomData;
let nTurn = 1;
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
blankLines(1);

// MAIN LOOP
while(!isGameOver) {
    // Reset the valid input flag
    isValidInput = false;

    // Show room description and player stats
    currentRoomData = searchInDataArrayById(currentRoomIndex, rooms);
    showRoomData(currentRoomData);

    // Ask valid command
    while(!isValidInput) {
        console.log("What do you want to do?");
        const userCommand = prompt();
        validateCommand(userCommand.trim().toLocaleLowerCase());
    }

    // Go to next turn
    nTurn++;
}


// FUNCTIONS
function showRoomData(room) {
    // Print current nTurn
    console.log(`\n##########################################\n\nTurn ${nTurn}.`);

    // Print current room number
    term.brightRed(`Currently you are in Room ${room.id}. ${room.description}.\n`);

    // Print available directions
    ['north', 'east', 'south', 'west'].forEach(dir => {
        if(room[dir] != null) term.blue(`There is a room to your ${dir.charAt(0).toUpperCase()}${dir.slice(1)}. `);
    });

    // Print available items in the room
    if(room.items.length > 0) {
        room.items.forEach( itemID => {
            const item = searchInDataArrayById(itemID, items);
            term.bgBrightGreen(`\nThere is a ${item.name.toUpperCase()} on the floor.`);
        });
    }
    
    // Print monster description if there is one in the room
    if(room.monster != null) {
        const monster = searchInDataArrayById(room.monster, monsters);
        term.bgBrightRed(`\n${monster.name} is waiting to kill you beside a locked door.`);
    }

    // Print bag and cash recap
    const itemsInBagValueList = [];
    term.cyan('\nYour bag contains the following items:\n');
    if(itemsInBagList.length > 0) {
        itemsInBagList.forEach( itemID => {
            const item = searchInDataArrayById(itemID, items);
            itemsInBagValueList.push(item.value);
            term.cyan(`- ${item.name} (value: ${item.value.toLocaleString('it-IT')} $)\n`);
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
        case 'attack':
            attack();
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
}

function moveAction(dir) {
    // There is a wall in that direction: invalid command
    if(currentRoomData[dir] === null) {
        invalidCommand();
        return;
    }

    // There is the exit of the maze in that direction: ask confirm
    if(currentRoomData[dir] === 0) {

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
    currentRoomIndex = currentRoomData[dir];
    term.red(`\n>> You moved to ${dir}.`);
}

/**
 * Command PICK function. Takes a string as parameter with the name of the item the user wants to pick.
 * @param {string} item 
 * @returns void
 */
function pick(requestedItem) {
    const itemsInRoom = rooms[currentRoomIndex- 1].items;
    let itemExistInRoom = false;

    if(itemsInRoom.length > 0) {
        // Search the item requested by user in the all items array, so you have the item ID
        const item = searchInDataArrayByName(requestedItem, items)

        // If you find an existing item, you can search its id in the itemsInRoom array, add it in the bag array and remove from the itemsInRoom array
        if(item != null) {

            for(let i = 0; i < itemsInRoom.length; i++) {

                if(itemsInRoom[i] === item.id) {
                    itemExistInRoom = true;
    
                    itemsInBagList.push(item.id);
                    itemsInRoom.splice(i, 1);

                    term.green(`\nYou picked a ${item.name}.`);
                    break;
                }

            }
        }
    }
    
    if(!itemExistInRoom) term.red(`\nThere is no ${requestedItem} in this room!`);
}

/**
 * 
 */
function drop(requestedItem) {
    const itemsInRoom = rooms[currentRoomIndex- 1].items;
    let itemExistInBag = false;

    if(itemsInBagList.length > 0) {
        // Search the item requested by user in the all items array, so you have the item ID
        const item = searchInDataArrayByName(requestedItem, items);

        // If you find an existing item, you can search its id in the itemsInBag array, add it in the itemsinRoom array and remove from the bag
        if(item != null) {

            for(let i = 0; i < itemsInBagList.length; i++) {

                if(itemsInBagList[i] === item.id) {
                    itemExistInBag = true;
    
                    itemsInRoom.push(item.id);
                    itemsInBagList.splice(i, 1);

                    term.green(`\nYou picked a ${item.name}.`);
                    break;
                }

            }
        }
    }
    
    if(!itemExistInBag) term.red(`\nThere is no ${requestedItem} in your bag!`);
}

/**
 * 
 */
function attack() {
    // There is no monster here!
    if(currentRoomData.monster === null) {
        term.red("There is no target to attack here!.\n");
        return;
    }

    // Retrieve monster data
    const monster = searchInDataArrayById(currentRoomData.monster, monsters);

    // Check if player has the right item to kill the monster
    if(itemsInBagList.includes(monster.itemRequiredToKill)) {
        const storyEventID = monster.storyEvent;
        storyEventsList.push(storyEventID);
        const storyEventData = searchInDataArrayById(storyEventID, storyEvents);
        storyEventData.result();
    } else {
        deathEnding();
    }
}


function deathEnding() {
    term.red(fs.readFileSync('./data/EndDead.txt'));
    isGameOver = true;
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
    term.red('Invalid command.\n');
}

/* UTILITIES FUNCTION */
/**
 * Prints blank lines on the console
 * @param {number} lines numbers of blank lines to print (default = 1) 
 */
function blankLines(lines = 1) {
    let blankLines = "";
    for(let i = 1; i <= lines; i++) {
        blankLines += "\n";
    }
    console.log(blankLines);
}

/**
 * Search a specific entity (data) by id in data arrays
 * @param {number} id 
 * @param {array} data 
 * @returns {object}
 */
function searchInDataArrayById(id, data) {
    for(let i = 0; i < data.length; i++) {
        if(data[i].id === id) return data[i];
    }
    return null;
}

/**
 * Search a specific entity (data) by name in data arrays
 * @param {string} name 
 * @param {array} data 
 * @returns {object/null} the object requested if found, otherwise null
 */
function searchInDataArrayByName(name, data) {
    for(let i = 0; i < data.length; i++) {
        if(data[i].name.toLowerCase() === name.toLowerCase()) return data[i];
    }
    return null;
}