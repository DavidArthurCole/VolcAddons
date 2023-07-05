import settings from "../../settings";
import { AMOGUS, GRAY, LOGO, WHITE } from "../../utils/constants";
import { getClosest } from "../../utils/functions";
import { delay } from "../../utils/thread";
import { data, registerWhen } from "../../utils/variables";
import { getWorld } from "../../utils/worlds";

// Burow detection Stuff
let heldItem = undefined;

let particles = [];
let distance = 0;
let dig = false;
let cast = false;
let cd = false;

let theoryBurrow = [];
let burrows = [];

// Vector Formula
function getCoord(start, end) {
    return Math.round(start + (end - start) * distance);
}

// Particle Tracking
let closest = undefined;
registerWhen(register("spawnParticle", (particle, type, event) => {
    const particlePos = particle.getPos();
    const xyz = [particlePos.getX(), particlePos.getY(), particlePos.getZ()];
    const [x, y, z] = [xyz[0], xyz[1], xyz[2]];
    switch (type.toString()) {
        case ("FIREWORKS_SPARK"): // Loads spade ability particles
            // Uses player location as last particle if first cast
            if (!particles.length)
                particles.push([Player.getX(), Player.getY(), Player.getZ()]);
            
            // Avoids stray fireworks sparks i.e. frozen scythe / crystals
            const lastParticle = particles[particles.length - 1];
            if (Math.hypot(lastParticle[0] - x, lastParticle[1] - y, lastParticle[2] - z) < 5)
                particles.push([x, y, z]);
            break;
        case ("FOOTSTEP"): // Loads burrow waypoints by footstep
            if (settings.dianaBurrow && !dig && World.getBlockAt(x, y, x).type.getName()) {
                xyz.unshift("Treasure");

                closest = getClosest(xyz, burrows);
                if (closest[1] > 3) {
                    burrows.push(xyz);
                    // Burrow Alerts
                    if (settings.dianaChat)
                        ChatLib.chat(`${LOGO} ${WHITE}Burrow Detected at ${GRAY}x: ${x}, y: ${y}, z: ${z}!`);
                    if (settings.dianaAmogus)
                        AMOGUS.play();
                }
            }
            break;
        // Determine burrow type
        case ("CRIT_MAGIC"):
            xyz.unshift("Start");
            closest = getClosest(xyz, burrows);
            if (closest[1] < 3)
                closest[0][0] = "Start";
            break;
        case ("CRIT"):
            xyz.unshift("Mob");
            closest = getClosest(xyz, burrows);
            if (closest[1] < 3)
                closest[0][0] = "Mob";
            break;
    }
}), () => getWorld() == "Hub" && (settings.dianaWaypoint || settings.dianaBurrow));

// Tracks Distance Using Sound
registerWhen(register("soundPlay", (pos, name, vol, pitch, category, event) => {
    if (!cast || !name.equals("note.harp")) return;

    // Uhh so it was a little hard to figure out an equation so this may be a little brute force hardcoded :skull:
    if (pitch > 1.05)
        correct = -1
    else if (pitch > 0.92)
        correct = 1.5 - pitch;
    else if (pitch > 0.77)
        correct = 2 / Math.pow(pitch, 2);
    else
        correct = -Math.abs(0.4 / (0.7 - pitch));

    if (pitch > 0)
        distance = 4 / Math.pow(pitch, 6) + 0.2 / Math.pow(pitch, 5) - correct;
}), () => getWorld() == "Hub" && settings.dianaWaypoint);

// Track spade ability to clear current particle list
registerWhen(register("clicked", (x, y, button, state) => {
    if (Player.getHeldItem() == null || !button || !state || cd) return;

    heldItem = Player.getHeldItem().getNBT().getCompoundTag("tag").getCompoundTag("ExtraAttributes").getString("id");
    if (heldItem.equals("ANCESTRAL_SPADE")) {
        particles = [];
        cast = true;
        cd = true;
        delay(() => { cast = false }, 2000);
        delay(() => { cd = false }, 3000);
    }
}), () => getWorld() == "Hub" && settings.dianaWaypoint);

// Calculate theoretical burrow and closest warp
const WARPS = {
    "hub": [-2.5, 70, -69.5],
    "castle": [-250, 130, 45],
    "da": [91.5, 75, 173.5],
    "museum": [-75.5, 76, 80.5],
    "crypt": [-161.5, 61, -99.5]
}
let warps = [];
let start = 0;
let end = 0;
let theory = [];

export function setWarps() {
    warps = [];
    warps.push(["player", 0, 0, 0]);

    data.warplist.forEach(warp => {
        if (warp in WARPS)
            warps.push([warp, WARPS[warp][0], WARPS[warp][1], WARPS[warp][2]])
    });
}
setWarps();

registerWhen(register("tick", () => {
    if (particles.length == 0 || !cast) return;

    start = particles.length > 12 ? particles[3] : particles[particles.length - 1];
    end = particles[particles.length - 1];
    warps[0] = ["player", Player.getX(), Player.getY(), Player.getZ()];
    theory = ["warp player", getCoord(start[0], end[0]), getCoord(start[1], end[1]), getCoord(start[2], end[2])];
    
    // Set theory burrow
    theory[0] = "warp " + getClosest(theory, warps)[0][0];
    theoryBurrow = [theory];
}), () => getWorld() == "Hub" && settings.dianaWaypoint);

// Warp to closest location
const dianaKey = new KeyBind("Diana Warp", data.dianaKey, "VolcAddons");
dianaKey.registerKeyPress(() => {
    if (settings.dianaWarp && theory[0] != undefined && theory[0] != "warp player")
        ChatLib.command(theory[0])
})

// Makes keybind persistant
register("gameUnload", () => {
    data.dianaKey = dianaKey.getKeyCode();
});

// Deletes waypoint once dug out
registerWhen(register("chat", () => {
    // Sets a timeout on particle loading
    dig = true;
    delay(() => dig = false, 200);

    // Delete closest burrow from list
    const closest = getClosest(["Player", Player.getX(), Player.getY(), Player.getZ()], burrows)
    if (closest != undefined);
        burrows.splice(burrows.indexOf(closest[0]), 1);
}).setCriteria("${before}urrow${after}"), () => getWorld() == "Hub" && settings.dianaWaypoint);

// => Draw Waypoint
export function getTheory() {
    return theoryBurrow;
}

export function getBurrow() {
    return burrows;
}

// Deletes burrow waypoints if bad thing happens
register("worldUnload", () => {
    theoryBurrow = [];
    burrows = [];
});

registerWhen(register("chat", () => {
    burrows = [];
}).setCriteria(" ☠ You ${died}."), () => getWorld() == "Hub" && settings.dianaWaypoint);