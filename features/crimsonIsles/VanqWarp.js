import settings from "../../settings";
import { getInParty } from "../../utils/party";
import { delay } from "../../utils/thread";
import { registerWhen } from "../../utils/variables";
import { findZone, getWorld } from "../../utils/worlds";

let vanqCoords = [0, 0, 0, "None"];
let vanqSpawned = false;
let notInParty = 0;

registerWhen(register("chat", () => {
    if (vanqSpawned) return;

    vanqSpawned = true;
    notInParty = 0;

    // PLAYER POSITION
    vanqCoords[0] = Math.round(Player.getX());
    vanqCoords[1] = Math.round(Player.getY());
    vanqCoords[2] = Math.round(Player.getZ());
    vanqCoords[3] = findZone();

    // INVITE PARTY
    delay(() => { if (getInParty()) ChatLib.command("p leave") }, 500);

    let timeout = 1000
    settings.vanqParty.split(", ").forEach(ign => {
        delay(() => { ChatLib.command(`p ${ign}`) }, timeout);
        notInParty++;
        timeout += 500;
    });
}).setCriteria("A Vanquisher is spawning nearby!"), () => getWorld() == "Crimson Isle" && settings.vanqParty);

function warpParty() {
    if (!vanqSpawned) return;

    notInParty--;
    if (notInParty <= 0 && getInParty()) {
        vanqSpawned = false;
        notInParty = 0;

        delay(() => { ChatLib.command('p warp') }, 500);
        delay(() => { ChatLib.command(`pc x: ${vanqCoords[0]}, y: ${vanqCoords[1]}, z: ${vanqCoords[2]} | Vanquisher Spawned at [${vanqCoords[3]} ]!`) }, 1000);
        delay(() => { ChatLib.command("p disband") }, 1500);
    }
}

// Checks if all players are in lobby
registerWhen(register("chat", () => {
    delay(warpParty(), 500);
}).setCriteria("${player} joined the party."), () => getWorld() == "Crimson Isle" && settings.vanqParty);

// If player doesnt accept
registerWhen(register("chat", () => {
    delay(warpParty(), 500);
}).setCriteria("The party invite to ${player} has expired"), () => getWorld() == "Crimson Isle" && settings.vanqParty);

// Safety net
registerWhen(register("chat", () => {
    vanqSpawned = false;
    notInParty = 0;
}).setCriteria("You have joined ${player} party!"), () => getWorld() == "Crimson Isle" && settings.vanqParty);

registerWhen(register("chat", () => {
    vanqSpawned = false;
    notInParty = 0;
}).setCriteria("RARE DROP! Nether Star"), () => getWorld() == "Crimson Isle" && settings.vanqParty);

function noInvite() {
    if (!vanqSpawned) return;

    notInParty--;
    if (notInParty <= 0) {
        notInParty = 0;
        vanqSpawned = false;
    }
}

// Make sure players exists / are online
registerWhen(register("chat", () => {
    delay(noInvite(), 500);
}).setCriteria("Couldn't find a player with that name!"), () => getWorld() == "Crimson Isle" && settings.vanqParty);

registerWhen(register("chat", () => {
    delay(noInvite(), 500);
}).setCriteria("You cannot invite that player since they're not online."), () => getWorld() == "Crimson Isle" && settings.vanqParty);