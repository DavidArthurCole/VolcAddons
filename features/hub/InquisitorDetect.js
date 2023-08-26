import settings from "../../settings";
import { BOLD, GOLD, WHITE } from "../../utils/constants";
import { announceMob } from "../../utils/functions";
import { data, registerWhen } from "../../utils/variables";
import { getWorld } from "../../utils/worlds";
import { updateInqCounter } from "../hub/InquisitorCounter";


/**
 * Inquisitor alert variables.
 */
const PLAYER_CLASS = Java.type("net.minecraft.client.entity.EntityOtherPlayerMP").class;
let inquisitor = undefined;

/**
 * Announce inquisitor spawn on chat message appears.
 */
registerWhen(register("chat", () => {
    entities = World.getAllEntitiesOfType(PLAYER_CLASS);
    inquisitor = entities.find((entity) => entity.getName().equals("Minos Inquisitor"));

    updateInqCounter(inquisitor !== undefined);
    if (inquisitor !== undefined && settings.inqAlert)
        announceMob(settings.inqAlert, "Minos Inquisitor", inquisitor.getX(), inquisitor.getY(), inquisitor.getZ());
}).setCriteria("${wow}! You dug out a Minos Champion!"), () => getWorld() === "Hub" && (settings.inqAlert !== 0 || settings.inqCounter !== 0));

/**
 * Tracks world for any inquisitors near player.
 */
let inquisitors = [];
export function getInquisitors() { return inquisitors };
registerWhen(register("tick", () => {
    inquisitors = [];

    entities = World.getAllEntitiesOfType(PLAYER_CLASS);
    inqs = entities.filter((entity) => entity.getName().equals("Minos Inquisitor"));

    if (inqs.length > 0) {
        Client.Companion.showTitle(`${GOLD}${BOLD}INQUISITOR ${WHITE}DETECTED!`, "", 0, 25, 5);
        if (data.moblist.includes("inquisitor"))
            inqs.forEach(inq => { inquisitors.push(inq) });
    }
}), () => getWorld() === "Hub" && settings.detectInq === true);
