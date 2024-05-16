import { DARK_GRAY, GRAY, LOGO } from "./constants";
import { NonPooledThread, delay } from "./thread";


const Socket = Java.type("java.net.Socket");
const InputStreamReader = Java.type("java.io.InputStreamReader");
const BufferedReader = Java.type("java.io.BufferedReader");
const PrintWriter = Java.type("java.io.PrintWriter");

class WebSocket {
    #socket = null;
    #output;
    #input;
    #inputStream = [];

    // Condition variables
    #connected = false;
    #running = true;

    /**
     * Creates a new WebSocket connection.
     * 
     * Sugar, spice, and everything nice.
     * These were the ingredients chosen to create the perfect little girl
     * But Professor Utonium accidentally added an extra ingredient to the concoction--
     * https://github.com/Soopyboo32/soopyApis/tree/master
     */
    constructor() {
        this.connect();
        
        // Send data to the server
        try  {
            new NonPooledThread(() => {
                while (this.#running) {
                    if (this.#connected && this.#socket !== null) {
                        if (this.#inputStream.length > 0) {
                            this.#inputStream.forEach(line => {
                                this.#input.println(line);
                            });
                            this.#inputStream = [];
                        } else {
                            Thread.sleep(1_000);
                        }
                    } else {
                        Thread.sleep(10_000);
                    }
                }
            }).execute();
        } catch (e) {
            console.error("[VolcAddons] Error sending data to socket server: " + e);
            this.disconnect();
        }

        // Set registers
        register("gameUnload", () => {
            this.#running = false;
            this.disconnect();
        });

        register("command", () => {
            this.send({ "command": "test" });
        }).setName("socketTest");
    }
    
    /**
     * Connects to the socket server.
     * 
     * @param {Number} attempts - The number of attempts to connect to the server.
     */
    connect(attempts = 0) {
        if (this.#connected || this.#socket !== null) {
            console.error("[VolcAddons] Already connected to socket server.");
            return;
        }

        if (attempts > 9) {
            console.error("[VolcAddons] Failed to connect to socket server after 10 attempts.");
            return;
        }

        // Attempt to connect to the socket server
        console.log("[VolcAddons] Connecting to socket server...");
        try {
            this.#socket = new Socket("volca.dev", 3389);
        } catch (e) {
            console.error("[VolcAddons] Error connecting to socket server: " + e);
            delay(() => {
                this.connect(attempts + 1);
            }, 10_000);
            return;
        }
        this.#connected = true;
        console.log("[VolcAddons] Connected to socket server.");
        
        // Initialize input and output streams
        this.#output = this.#socket.getOutputStream();
        this.#input = new PrintWriter(this.#output, true);

        // Start the listener thread
        try {
            new NonPooledThread(() => {
                let input = this.#socket.getInputStream();
                let reader = new BufferedReader(new InputStreamReader(input));

                while (this.#connected && this.#socket !== null && this.#running) {
                    try {
                        let data = reader.readLine();
                        if (data !== null) {
                            this.receive(data);
                        } else {
                            Thread.sleep(1_000);
                        }
                    } catch (e) {
                        console.error("[VolcAddons] Error reading data from socket server: " + e);
                        this.disconnect();
                        break;
                    }
                }
            }).execute();
        } catch (e) {
            console.error("[VolcAddons] Error starting listener thread: " + e);
            this.disconnect();
        }
    }

    /**
     * Disconnects from the socket server.
     */
    disconnect() {
        new NonPooledThread(() => {
            this.#connected = false;

            if (this.#socket) {
                try {
                    this.#input.println('{ "command": "disconnect" }');
                    Thread.sleep(5_000);

                    this.#input.close();
                    this.#output.close();
                    this.#socket.close();
                    this.#socket = null;
                    console.log("[VolcAddons] Disconnected from socket server.");
                } catch (e) {
                    console.error("[VolcAddons] Error disconnecting from socket server: " + e);
                }
            }
        }).execute();
    }

    /**
     * Sends data to the server.
     * 
     * @param {Object} data - The data to send to the server.
     */
    send(data) {
        if (!this.#socket) return;
        data.player = Player.getName();

        try {
            this.#inputStream.push(JSON.stringify(data));
        } catch (e) {
            console.error("[VolcAddons] Error sending data to socket server: " + e);
        }
    }

    /**
     * Receives data from the server.
     * 
     * @param {String} json - The data received from the server.
     */
    receive(json) {
        if (!json.startsWith("{") || !json.endsWith("}")){
            return;
        }

        callback(JSON.parse(json));
    }
}
export default new WebSocket();


/**
 * Run callback and prevent circular dependency.
 */
import { processEvent } from "../features/mining/EventTracker";

/**
 * Processes the event received from the server.
 * 
 * @param {Object} data - The data received from the server.
 */
function callback(data) {
    const command = data.command;

    switch (command) {
        case "ch":
        case "dm":
            processEvent(data);
            break;
        default:
            ChatLib.chat(`${LOGO + DARK_GRAY}Received unknown command: ${GRAY + command}`);
    }
}
