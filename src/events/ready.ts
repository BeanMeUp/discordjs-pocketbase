import { MyReadyEvent } from "../types";

export default {
    name: "ready",

    async run(client) {
        console.log("Bot online como", client.user?.username);

        client.utils.summitCommands();
    },
} as MyReadyEvent;
