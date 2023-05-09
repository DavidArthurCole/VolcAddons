import settings from "../settings"
import {AQUA, BOLD, DARK_RED, GRAY, GREEN, MUSIC, RED, WHITE} from "../constants"
import { getWorld } from "../variables";

// NO KEY ALERT
register("chat", () => {
    if (!settings.kuudraAlerts) return;

    Client.Companion.showTitle(`${BOLD}NO KUUDRA KEY!`, "", 10, 50, 10);
}).setCriteria("WARNING: You do not have a key for this tier in your inventory, you will not be able to claim rewards.");

// UNREADY ALERT
register("chat", (player) => {
    if (!settings.kuudraAlerts) return;
        
    const name = player.removeFormatting().toUpperCase();
    MUSIC.play();
    Client.Companion.showTitle(`${DARK_RED}${BOLD}${name} ${WHITE}IS NO LONGER READY!`, "", 10, 50, 10);
}).setCriteria("${player} is no longer ready!");

// CHOOSE PERK
register("chat", () => {
    if (!settings.kuudraAlerts) return;

    MUSIC.play();
    Client.Companion.showTitle(`${AQUA}${BOLD}BUY UPGRADE ROUTE!`, "", 10, 100, 10);
}).setCriteria("[NPC] Elle: Okay adventurers, I will go and fish up Kuudra!");

// FUELING ALERT
register("chat", () => {
    if (!settings.kuudraAlerts) return;

    MUSIC.play();
    Client.Companion.showTitle(`${AQUA}${BOLD}PICKUP SUPPLY!`, "", 10, 100, 10);
}).setCriteria("[NPC] Elle: Not again!");

// BUILDING ALERT
register("chat", () => {
    if (!settings.kuudraAlerts) return;

    MUSIC.play();
    Client.Companion.showTitle(`${AQUA}${BOLD}START BUILDING!`, "", 10, 50, 10);
}).setCriteria("[NPC] Elle: It's time to build the Ballista again! Cover me!");

// FRESH TOOLS ALERT
register("chat", () => {
    if (!settings.kuudraAlerts) return;

    MUSIC.play();
    Client.Companion.showTitle(`${GREEN}${BOLD}EAT FRESH!`, "", 10, 50, 10);
}).setCriteria("Your Fresh Tools Perk bonus doubles your building speed for the next 5 seconds!");

// FIGHT ALERTS
register("chat", (player, percentage) => { // Ballista full alert
    if (!settings.kuudraAlerts) return;

    MUSIC.play();
    switch (percentage) {
        case "100":
            Client.Companion.showTitle(`${AQUA}${BOLD}100% ${GRAY}[${GREEN}||||${GRAY}]`, "", 10, 100, 10);
            break;
        case "75":
            Client.Companion.showTitle(`${AQUA}${BOLD}75% ${GRAY}[${GREEN}|||${RED}|${GRAY}]`, "", 10, 50, 10);
            break;
        case "50":
            Client.Companion.showTitle(`${AQUA}${BOLD}50% ${GRAY}[${GREEN}||${RED}||${GRAY}]`, "", 10, 50, 10);
            break;
        case "25":
            Client.Companion.showTitle(`${AQUA}${BOLD}25% ${GRAY}[${GREEN}|${RED}|||${GRAY}]`, "", 10, 50, 10);
            break;
    }
}).setCriteria("${player} recovered a Fuel Cell and charged the Ballista! (${percentage}%)");

register("chat", (player) => { // Stunner eaten alert
    const ign = player.toUpperCase();
    const stunner = settings.kuudraStunner.toUpperCase();

    if (settings.kuudraAlerts && !ign.equals("ELLE") && (stunner.length == 0 || ign.equals(stunner))) {
        MUSIC.play();
        Client.Companion.showTitle(`${GREEN}${BOLD}${ign} WAS EATEN!`, "", 10, 100, 10);
    }
}).setCriteria("${player} has been eaten by Kuudra!");

register("chat", (player) => { // Ballista mounted alert
    const ign = player.toUpperCase();
    const cannonear = settings.kuudraCannonear.toUpperCase();

    if (settings.kuudraAlerts && (settings.kuudraCannonear.length == 0 || ign.equals(cannonear))) {
        MUSIC.play();
        Client.Companion.showTitle(`${AQUA}${BOLD}${ign} ASSUMED THE POSITION!`, "", 10, 100, 10);
    }
}).setCriteria("${player} mounted a Cannon!");

register("chat", (player) => { // Kuudra stunned alert
    if (!settings.kuudraAlerts) return;

    MUSIC.play();
    Client.Companion.showTitle(`${GREEN}${BOLD}KUUDRA STUNNED!`, "", 10, 100, 10);
}).setCriteria("{player} destroyed one of Kuudra's pods!");

// DROPSHIP WARNING
const EntityGhast = Java.type('net.minecraft.entity.monster.EntityGhast');
register("renderEntity", () => {
    if ((getWorld() != "kuudra t5" && getWorld() != "kuudra f4") || !settings.kuudraAlerts) return;

    let ghasts = World.getAllEntitiesOfType(EntityGhast.class);

    ghasts.forEach((ghast) => {
        let distance = Math.sqrt(Math.pow(ghast.getX() + 101, 2) + Math.pow(ghast.getZ() + 105, 2));

        if (distance < 20 && distance > 10)
            Client.Companion.showTitle(`${RED}${BOLD}DROPSHIP INCOMING!`, "", 0, 50, 5);
    })
});