import settings from "../../utils/Settings";
import { BOLD, DARK_GRAY, GOLD, GREEN, LOGO, RED, YELLOW } from "../../utils/constants";
import { getSlotCoords } from "../../utils/functions/find";
import { registerWhen } from "../../utils/RegisterTils";
import { data } from "../../utils/data";
import { printList } from "../../utils/list";


// Bind key
const bindKey = new KeyBind("Slot Binding", data.bindKey, "./VolcAddons.xdd");
register("gameUnload", () => { data.bindKey = bindKey.getKeyCode() }).setPriority(Priority.HIGHEST);
let binding = undefined;

const HOTBAR = ["36", "37", "38", "39", "40", "41", "42", "43", "44"];
HOTBAR.forEach(slot => {
    if (!data.slotBinds.hasOwnProperty(slot) && !Array.isArray(data.slotBinds[slot]))
        data.slotBinds[slot] = [];
});

// Bind slots
registerWhen(register("guiKey", (c, keyCode, gui) => {
    if (keyCode !== bindKey.getKeyCode()) return;
    const bind = gui?.getSlotUnderMouse()?.field_75222_d;
    if (bind === undefined || bind <= 4) return;

    if (data.slotBinds.hasOwnProperty(bind) && bind < 36) {
        const binded = data.slotBinds[bind];
        data.slotBinds[binded].splice(data.slotBinds[binded].indexOf(bind), 1);
        delete data.slotBinds[bind];
    } else if (binding === undefined) binding = bind;
    else if (binding === bind) binding = undefined;
    else if (binding >= 36 && bind < 36) {
        data.slotBinds[bind] = binding;
        data.slotBinds[binding].push(bind);
        binding = undefined;
    } else if (binding < 36 && bind >= 36) {
        data.slotBinds[binding] = bind;
        data.slotBinds[bind].push(binding);
        binding = undefined;
    }
}), () => settings.slotBinding);
registerWhen(register("guiClosed", () => {
    binding = undefined;
}), () => settings.slotBinding);

// Swap binded items
registerWhen(register("guiMouseClick", (_, __, button, gui, event) => {
    if (button !== 0 || !Keyboard.isKeyDown(Keyboard.KEY_LSHIFT)) return;

    const hover = gui?.getSlotUnderMouse()?.field_75222_d ?? 36;
    const bind = data.slotBinds[hover];
    if (hover >= 36 || bind === undefined) return;

    // playerController.windowClick()
    Client.getMinecraft().field_71442_b.func_78753_a(Player.getContainer().getWindowId(), hover, bind - 36, 2, Player.getPlayer());

    cancel(event);
}), () => settings.slotBinding);

// Render bindings
registerWhen(register("guiRender", (x, y, gui) => {
    if (gui.class.getName() !== "net.minecraft.client.gui.inventory.GuiInventory") return;
    const containerType = Player.getContainer().getClassName();

    // render binding
    if (binding !== undefined) {
        const [x, y] = getSlotCoords(binding, containerType);
    
        Renderer.translate(0, 0, 200);
        Renderer.drawRect(Renderer.AQUA, x, y, 16, 16);
    }

    // render all binds
    Object.keys(data.slotBinds).forEach(bind => {
        if (Array.isArray(data.slotBinds[bind]) && data.slotBinds[bind].length === 0) return;
        const [x, y] = getSlotCoords(bind, containerType);

        Renderer.translate(0, 0, 200);
        Renderer.drawRect(Renderer.GRAY, x, y, 16, 16);
    });

    // render hovered binds
    const hover = gui?.getSlotUnderMouse()?.field_75222_d;
    const bind = data.slotBinds[hover];
    if (Array.isArray(bind)) {
        bind.forEach(slot => {
            const [x, y] = getSlotCoords(hover, containerType);
            const [dx, dy] = getSlotCoords(slot, containerType);

            Renderer.translate(0, 0, 300);
            Renderer.drawLine(Renderer.AQUA, x + 8, y + 8, dx + 8, dy + 8, 1);
        });
    } else if (bind !== undefined) {
        const [x, y] = getSlotCoords(hover, containerType);
        const [dx, dy] = getSlotCoords(bind, containerType);

        Renderer.translate(0, 0, 300);
        Renderer.drawLine(Renderer.AQUA, x + 8, y + 8, dx + 8, dy + 8, 1);
    }
}), () => settings.slotBinding);

/**
 * Slot binding related commands...
 */
export function slotCommands(args) {
    const command = args[1];
    const name = args[2];

    switch(command) {
        case "save":
            data.bindPresets[name] = data.slotBinds;
            ChatLib.chat(`${LOGO + GREEN}Successfully saved slot bindings using key: "${name}".`);
            break;
        case "delete":
            if (data.bindPresets.hasOwnProperty(name)) {
                delete data.bindPresets[name];
                ChatLib.chat(`${LOGO + GREEN}Succesfully deleted slot bindings using key: "${name}"`);
            } else ChatLib.chat(`${LOGO + RED}Invalid bind key: "${name}"`);
            break;
        case "load":
            if (data.bindPresets.hasOwnProperty(name)) {
                data.slotBinds = data.bindPresets[name];
                ChatLib.chat(`${LOGO + GREEN}Succesfully loaded slot bindings using key: "${name}".`);
            } else ChatLib.chat(`${LOGO + RED}Error: There are no presets using "${name}" key.`);
            break;
        case "list":
        case "view":
            const bindingKeys = Object.keys(data.bindPresets);
            printList(bindingKeys, "Bindings", parseInt(args[2] ?? 1));
            break;
        case "clear":
        case "reset":
            data.slotBinds = {"36": [], "37": [], "38": [], "39": [], "40": [], "41": [], "42": [], "43": [], "44": []};
            ChatLib.chat(`${LOGO + GREEN}Successfully reset slot bindings!`);
            break;
        case "help":
        default:
            if (command !== "help") ChatLib.chat(`${LOGO + RED}Error: Invalid argument "${command}"!\n`);
            ChatLib.chat(
`${LOGO + GOLD + BOLD}Container Buttons Commands:
 ${DARK_GRAY}- ${GOLD}Base: ${YELLOW}/va bind <command>

 ${DARK_GRAY}- ${GOLD}save ${YELLOW}<key>: Save binding data to presets using key.
 ${DARK_GRAY}- ${GOLD}delete ${YELLOW}<key>: Delete binding preset using key.
 ${DARK_GRAY}- ${GOLD}load ${YELLOW}<key>: Load binding preset using key.
 ${DARK_GRAY}- ${GOLD}list: ${YELLOW}View all available binding presets.
 ${DARK_GRAY}- ${GOLD}clear: ${YELLOW}Removes all bindings.
 ${DARK_GRAY}- ${GOLD}help: ${YELLOW}Displays this help message.`);
            break;
    }
}
