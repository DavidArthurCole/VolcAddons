import settings from "../../settings";
import { registerWhen } from "../../utils/variables";


/**
 * Variables used to determine image rendering.
 */
let SCREEN_WIDTH = Renderer.screen.getWidth();
let SCREEN_HEIGHT = Renderer.screen.getHeight();
let img = undefined;
let imgUrl = undefined;

/**
 * Sets size of screen.
 */
registerWhen(register("worldLoad", () => {
    SCREEN_WIDTH = Renderer.screen.getWidth();
    SCREEN_HEIGHT = Renderer.screen.getHeight();
}), () => settings.imageRatio !== 0);

/**
 * Renders the image on cursor location / lowest xy.
 */
registerWhen(register("renderOverlay", () => {
    if (img === undefined) return;
    const ratio = img.getTextureHeight() / SCREEN_HEIGHT / settings.imageRatio;
    const width = img.getTextureWidth() / ratio;
    const height = img.getTextureHeight() / ratio;
    img.draw(Math.min(Client.Companion.getMouseX(), SCREEN_WIDTH - width), Math.max(0, Client.Companion.getMouseY() - height), width, height);
}).setPriority(Priority.LOWEST), () => settings.imageRatio !== 0);

/**
 * Gets image when hovering over Imgur/Discord link.
 */
registerWhen(register("chatComponentHovered", (text) => {
    const hoverValue = text.getHoverValue().removeFormatting();
    if (hoverValue === imgUrl || !(hoverValue.includes("imgur.com") || hoverValue.includes("cdn.discordapp"))) return;
    imgUrl = hoverValue;
    img = Image.fromUrl(imgUrl);
}), () => settings.imageRatio !== 0);

/**
 * Resets image on gui close.
 */
registerWhen(register("guiClosed", () => {
    img = undefined;
    imgUrl = undefined;
}), () => settings.imageRatio !== 0);