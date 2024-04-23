import settings from "../../utils/settings";
import { GREEN, RED } from "../../utils/constants";
import { data, registerWhen } from "../../utils/variables";


/**
 * Key press to warp player to closest burrow.
 */
const wardKey = new KeyBind("Wardrobe Set", data.wardKey, "./VolcAddons.xdd");
register("gameUnload", () => { data.wardKey = wardKey.getKeyCode() });

let instructions = "";
registerWhen(register("guiRender", () => {
    Renderer.drawString(instructions, (Renderer.screen.getWidth() - Renderer.getStringWidth(instructions)) / 2 , 80, true);
}), () => settings.wardrobeBinding);

let settingBind = false;
registerWhen(register("guiClosed", () => {
    instructions = "";
    settingBind = false;
}), () => settings.wardrobeBinding);

const C0EPacketClickWindow = Java.type("net.minecraft.network.play.client.C0EPacketClickWindow");
registerWhen(register("guiKey", (_, code, gui, event) => {
    if (settingBind) {
        cancel(event);
        const slot = gui?.getSlotUnderMouse()?.field_75222_d - 35;
        const linkedKey = Object.keys(data.wardBinds).find(key => data.wardBinds[key] === slot);

        // Check if hovering over valid slot
        if (isNaN(slot) || slot < 0 || slot > 9) {
            if (code === 1) {
                instructions = `${RED}Cancelled wardrobe binding.`;
                settingBind = false;
                return;
            }

            instructions = `${RED}Please hover over a valid slot.`;
            return;
        }

        // Unbind key
        if (code === 1) {
            if (linkedKey !== undefined) delete data.wardBinds[linkedKey];

            instructions = `${GREEN}Succesfully unbound slot ${slot}.`;
            settingBind = false;
            return;
        }

        // Check if key is the wardrobe bind key
        if (code === wardKey.getKeyCode()) {
            instructions = `${RED}You cannot use the wardrobe set key as a hotkey.`;
            return;
        }

        // Check if key is already used
        if (data.wardBinds.hasOwnProperty(code)) {
            instructions = `${RED}Key #${code - 1} is already binded to slot ${data.wardBinds[code]}`;
            return;
        }

        // Set bind
        data.wardBinds[code] = slot;
        instructions = `${GREEN}Successfully binded slot ${slot} to key #${code - 1}.`;

        // Remove any key already bound
        if (linkedKey !== undefined) {
            instructions += ` Unbound key #${linkedKey} from slot ${data.warpBinds[linkedKey]}.`;
            delete data.wardBinds[linkedKey];
        }

        settingBind = false;
        return;
    }

    if (!Player.getContainer().getName().startsWith("Wardrobe")) return;

    if (data.wardBinds.hasOwnProperty(code)) {
        cancel(event);
        Client.sendPacket(new C0EPacketClickWindow(Player.getContainer().getWindowId(), data.wardBinds[code] + 35, 0, 0, null, 0));
        Client.scheduleTask(3, () => Client.sendPacket(new C0EPacketClickWindow(Player.getContainer().getWindowId(), 49, 0, 0, null, 0)));
    } else if (code === wardKey.getKeyCode()) {
        cancel(event);
        settingBind = true;
        instructions = "Please hover over wardrobe slot and press hotkey to be binded (press escape to unbind).";
    }
}), () => settings.wardrobeBinding);
