import settings from "../../settings";
import { AQUA, GREEN, LOGO } from "../../utils/constants";
import { delay } from "../../utils/thread";
import { registerWhen } from "../../utils/variables";

// General Waypoints
let chatWaypoints = [];
export function getChatWaypoints() { return chatWaypoints };
let userWaypoints = [];
export function getUserWaypoints() { return userWaypoints };

// Detects coords
registerWhen(register("chat", (player, spacing, x, y, z) => {
    // Gets colors and titles in name
    const bracketIndex = player.indexOf('[') - 2;
    if (bracketIndex >= 0)
        player = player.replaceAll('&', '§').substring(bracketIndex, player.length);
    else
        player = player.replaceAll('&', '§');

    // Remove anything after z coords
    const spaceIndex = z.indexOf(' ');
    let time = 999;
    if (spaceIndex != -1) {
        if (z.includes('|'))
            time /= 3;
        z = z.substring(0, spaceIndex);
    }
    
    chatWaypoints.push([player, x, y, z]);

    // Delete waypoint after 'X' seconds
    delay(() => { if (chatWaypoints.length) chatWaypoints.shift() }, settings.drawWaypoint * time);
}).setCriteria("${player}&f${spacing}x: ${x}, y: ${y}, z: ${z}&r"), () => settings.drawWaypoint);

// Lets user create waypoint
export function createWaypoint(args) {
    if (args[1] == "clear") {
        userWaypoints = [];
        NPCs = [];
        zones = [];
        ChatLib.chat(`${LOGO} ${GREEN}Successfully cleared waypoints!`);
    } else if (!isNaN(args[2]) && !isNaN(args[3]) && !isNaN(args[4])) {
        userWaypoints.push([args[1], args[2], args[3], args[4]]);
        ChatLib.chat(`${GREEN}Successfully added waypoint [${args[1]}] at [x: ${args[2]}, y: ${args[3]}, z: ${args[4]}]!`);
    } else ChatLib.chat(`${LOGO} ${AQUA}Please enter as /va waypoint [name] [x] [y] [z] | /va waypoint clear!`);
}

// Deletes user waypoints on world exit
register("worldUnload", () => {
    userWaypoints = [];
});
