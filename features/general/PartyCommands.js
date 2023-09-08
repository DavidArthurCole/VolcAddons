import axios from "../../../axios";
import { request } from "../../../requestV2";
import settings from "../../utils/settings";
import toggles from "../../utils/toggles";
import { AQUA, DARK_AQUA, DARK_GREEN, GRAY, GREEN, LOGO, RED, WHITE } from "../../utils/constants";
import { getGuildName, getPlayerName } from "../../utils/functions";
import { getIsLeader } from "../../utils/party";
import { delay } from "../../utils/thread";
import { data, registerWhen } from "../../utils/variables";


/**
 * Variable used to represent /pc cooldown and possible responses.
 */
let onCD = false;
const RESPONSES = JSON.parse(FileLib.read("./VolcAddons/assets", "8ball.json"));
const RPS = ["rock", "paper", "scissors"];
const QUOTES = JSON.parse(FileLib.read("./VolcAddons/assets", "quotes.json"));
const IMGUR_KEYS = [
    "d30c6dc9941b52b",
    "b2e8519cbb7712a",
    "eb1f61e23b9eabd",
    "d1275dca5af8904",
    "ed46361ccd67d6d"
];

/**
 * Makes a POST request to upload an image to Imgur.
 *
 * @param {string} image - Link of the image.
 */
function upload(image) {
    const clientID = IMGUR_KEYS[parseInt(Math.random() * (IMGUR_KEYS.length - 1))];

    return request({
        url: "https://api.imgur.com/3/image",
        method: "POST",
        headers: {
            Authorization: `Client-ID ${clientID}`,
        },
        body: {
            image
        },
        json: true
    });
};

/**
 * Makes a PULL request to get a random waifu image >.<
 */
let waifu = "";
let imgur = "";
function setWaifu(announce) {
    axios.get("https://api.waifu.pics/sfw/waifu").then((link) => {
        waifu = link.data.url;
        if (announce === true)
            new Message(`${LOGO} ${DARK_GREEN}Uploading `,
            new TextComponent(waifu).setHoverValue(waifu),
            ` ${DARK_GREEN}to Imgur!`).chat();
        upload(waifu).then(({ data: { link } }) => {
            imgur = link;
            if (announce === true)
            new Message(`${LOGO} ${GREEN}Uploaded `,
            new TextComponent(imgur).setHoverValue(imgur),
            ` ${GREEN}to Imgur Successfully! `,
            new TextComponent(`${GRAY}[click here to regenerate]`).setClick("run_command", "/va w").setHoverValue("Click Me!")).chat();
        }).catch((err) => {
            const error = err.data.error;
            const message = error?.message
            if (announce === true) ChatLib.chat(`${LOGO} ${RED}Imgur Upload Failed: ${message ?? error}`);
        });
    });
}
export function getWaifu() { return imgur };
setWaifu(false);

/**
 * Various party and leader commands.
 *
 * @param {string} name - IGN of player who sent the message.
 * @param {string[]} args - Message player sent split by " ".
 * @param {string} sendTo - Chat to send response to (/pc, /gc, /r)
 */
export function executeCommand(name, args, sendTo) {
    if (data.blacklist.includes(name.toLowerCase())) return;
    const command = args[0];

    // PARTY COMMANDS
    if (settings.partyCommands !== 0) {
        const randID = sendTo === "pc" ? '' : '@' + (Math.random() + 1).toString(36).substring(5);

        delay(() => { switch (command) {
            case "cringe": // Slander
            case "gay":
            case "racist":
            case "femboy":
            case "trans":
            case "transphobic":
                if (toggles.slanderCommand === false) return;

                const percentage = Math.floor(Math.random() * 100) + 1;
                if (sendTo !== false) ChatLib.command(`${sendTo} ${name} is ${percentage}% ${command}! ${randID}`);
                else ChatLib.chat(`${LOGO} ${DARK_AQUA}You are ${WHITE}${percentage}% ${DARK_AQUA}${command}!`);
                break;
            case "dice": // Dice roll
            case "roll":
                if (toggles.diceCommand === false) return;

                const roll = Math.floor(Math.random() * 6) + 1;
                if (sendTo !== false) ChatLib.command(`${sendTo} ${name} rolled a ${roll}! ${randID}`);
                else ChatLib.chat(`${LOGO} ${DARK_AQUA}You rolled a ${WHITE}${roll}${DARK_AQUA}!`);
                break;
            case "coin": // Coin flip
            case "flip":
            case "coinflip":
            case "cf":
                if (toggles.coinCommand === false) return;

                const flip = Math.floor(Math.random() * 2) ? "heads" : "tails";
                if (sendTo !== false) ChatLib.command(`${sendTo} ${name} flipped ${flip}! ${randID}`);
                else ChatLib.chat(`${LOGO} ${DARK_AQUA}You flipped ${WHITE}${flip}${DARK_AQUA}!`);
                break;
            case "8ball": // 8ball
                if (toggles.ballCommand === false) return;

                if (sendTo !== false) ChatLib.command(`${sendTo} ${RESPONSES[Math.floor(Math.random() * 20) + 1]}. ${randID}`);
                else ChatLib.chat(`${LOGO} ${DARK_AQUA}${RESPONSES[Math.floor(Math.random() * 20) + 1]}.`)
                break;
            case "rps": // Rock Paper Siccors
                if (toggles.rpsCommand === false) return;

                const player = args[1] === undefined ? -1 : RPS.indexOf(args[1].toLowerCase());
                let reply = player === -1 ? `Wtf is a(n) ${args[1]}? Are you from the jungle?` : "zzz...";
                // Plays game out if user inputs a correct symbol
                if (player !== -1) {
                    const choice = Math.floor(Math.random() * 3);
                    if (sendTo !== false) ChatLib.command(`${sendTo} I choose ${RPS[choice]}! ${randID}`);
                    else ChatLib.chat(`${LOGO} ${DARK_AQUA}I choose ${WHITE}${RPS[choice]}${DARK_AQUA}!`);
                    const outcome = (player - choice);

                    // Determine outcome of the game
                    switch (outcome) {
                        case -2:
                        case 1:
                            reply = "bor, this game is so bad.";
                            break;
                        case 2:
                        case -1:
                            const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
                            reply = `I believe you may need some advice: ${WHITE}"${quote}" ${AQUA}~Volcaronitee (i think)`;
                            break;
                    }
                }
                
                // Output reponse depending if use wants party message or user message
                if (sendTo !== false) delay(() => ChatLib.command(`${sendTo} ${reply} ${randID}`), 690);
                else ChatLib.chat(`${LOGO} ${DARK_AQUA}${reply}`);
                break;
            case "waifu":
            case "women":
            case "w":
                if (toggles.womenCommand === false) return;

                if (sendTo !== false) ChatLib.command(`${sendTo} ${imgur} ${randID}-vaw`);
                // Randomize end to avoid duplicate message ^
                setWaifu(true);
                break;
            case "coords":
            case "waypoint":
            case "xyz":
                if (toggles.coordsCommand === false || Player.getName() === name) return;

                if (sendTo !== false) ChatLib.command(`${sendTo} x: ${Math.round(Player.getX())}, y: ${Math.round(Player.getY())}, z: ${Math.round(Player.getZ())} ${randID}`);
                else ChatLib.command(`r x: ${Math.round(Player.getX())}, y: ${Math.round(Player.getY())}, z: ${Math.round(Player.getZ())}`);
                break;
            case "limbo":
            case "lobby":
            case "l":
                if (toggles.limboCommand === false || getIsLeader() || Player.getName() === name) return;

                ChatLib.command("l");
                break;
            case "leave":
                if (toggles.limboCommand === false || getIsLeader() || Player.getName() === name) return;

                ChatLib.command("p leave");
                break;
            case "help":
                if (toggles.helpCommand === false || !sendTo) return;

                ChatLib.command(`${sendTo} Party Commands: ?<slander was here, dice, coin, 8ball, rps, w, lobby, leave, help> ${randID}`);
                if (getIsLeader() && settings.leaderCommands)
                    delay(() => ChatLib.command(`${sendTo} Leader Commands: ?<warp, transfer, promote, demote, allinv, stream #> ${randID}`), 690);
                break;
        } }, 690);
    }
    
    // LEADER COMMANDS
    if (getIsLeader() === true && settings.leaderCommands === true & Player.getName() !== name) {
        switch (command) {
            case "mute":
                if (toggles.warpCommand === false) return;
                ChatLib.command("p mute");
                break;
            case "warp":
                if (toggles.warpCommand === false) return;
                ChatLib.command("p warp");
                break;
            case "transfer":
                if (toggles.transferCommand === false) return;
                ChatLib.command("p transfer " + name);
                break;
            case "promote":
                if (toggles.promoteCommand === false) return;
                ChatLib.command("p promote " + name);
                break;
            case "demote":
                if (toggles.demoteCommand === false) return;
                ChatLib.command("p demote " + name);
                break;
            case "allinvite":
            case "allinv":
                if (toggles.allinvCommand === false) return;
                ChatLib.command("p settings allinvite");
                break;
            case "streamopen":
            case "stream":
                if (toggles.streamCommand === false) return;

                num = isNaN(args[1]) ? 10 : args[1];
                ChatLib.command(`stream open ${args[1]}`);
                break;
        }
    }
    
    // MODERATOR COMMANDS
    if (settings.leaderCommands === true && toggles.inviteCommand === true && (command === "inv" || command === "invite")) {
        if (data.whitelist.includes(name.toLowerCase())) ChatLib.command(`p ${name}`);
        else ChatLib.command(`r You are not in the whitelist! ${randID}`);
    }

    onCD = true;
    delay(() => onCD = false, 1000);
}

/**
 * Detects when player inputs a ?command and set the chat 
 *
 * @param {string} player - "[rank] ign".
 * @param {string} message - Message sent by player following a "?"
 */
registerWhen(register("chat", (player, message) => {
    if (onCD) return;
    executeCommand(getPlayerName(player), message.split(" "), "pc");
}).setCriteria("Party > ${player}: ?${message}"), () => settings.partyCommands === 1 || settings.partyCommands === 2);
registerWhen(register("chat", (player, message) => {
    if (onCD) return;
    executeCommand(getGuildName(player), message.split(" "), "gc");
}).setCriteria("Guild > ${player}: ?${message}"), () => settings.partyCommands === 1 || settings.partyCommands === 3);
registerWhen(register("chat", (player, message) => {
    if (onCD) return;
    executeCommand(getPlayerName(player), message.split(" "), "r");
}).setCriteria("From ${player}: ?${message}"), () => settings.partyCommands === 1 || settings.partyCommands === 4);
