import { getGuildName, getPlayerName } from "../../utils/functions";
import { getIsLeader } from "../../utils/party";
import settings from "../../utils/settings";
import { delay } from "../../utils/thread";
import { registerWhen } from "../../utils/variables";


/**
 * Sends a party chat message when someone joins.
 */
registerWhen(register("chat", (player) => {
    if (settings.partyMessageLeader && !getIsLeader()) return;
    const regex = new RegExp("\\$\\{name\\}", 'g');
    delay(() => ChatLib.command(`gc ${settings.partyMessage.replace(regex, getPlayerName(player))}`), 250);
}).setCriteria("${player} joined the party."), () => settings.partyMessage !== "");

/**
 * Sends a guild chat message when someone joins.
 */
registerWhen(register("chat", (player) => {
    const regex = new RegExp("\\$\\{name\\}", 'g');
    delay(() => ChatLib.command(`gc ${settings.guildMessage.replace(regex, getGuildName(player))}`), 250);
}).setCriteria("${player} joined the guild!"), () => settings.guildMessage !== "");
