// IMPORTS
const fs = require('fs'); // filesystem module
const path = require('path');
const term = require( 'terminal-kit' ).terminal;
const rooms = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../data/Rooms.txt')).toString().trim());

// STORY EVENTS
const storyEvents = [
    // Event 1: Medusa is killed
    {
        id: 1,
        result() {
            rooms[4].description += "\nYou can see Medusa's corpse lying on the floor. She isn't a danger for you now.";
            rooms[4].monster = null;
            rooms[4].south = 8;
            term.green("You killed Medusa!\n");
            term.green("The locked door behind Medusa is now open!\n");
        }
    },
    // Event 2: Dracula is killed
    {
        id: 2,
        result() {
            rooms[5].description += "\nYou can see Dracula's corpse lying on the floor. He isn't a danger for you now.";
            rooms[5].monster = null;
            rooms[5].south = 9;
            term.green("You killed Dracula!\n");
            term.green("The locked door behind Dracula is now open!\nYou can hear a sweet voice singing in the distance...\n");
        }
    },
    // Event 3: Princess is found
    {
        id: 3,
        result() {
            rooms[8].description += "\nThat's where you have found the Princess.";
            term.green("You find the Princess, safe and sound. Go, save her and escape from this maze!\n");
        }
    }
];

// MODULE EXPORT
module.exports.rooms = rooms;
module.exports.storyEvents = storyEvents;