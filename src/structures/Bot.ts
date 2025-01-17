import Utils from "./Utils";
import { MySlashCommand } from "../types";
import { Client, ClientOptions, Collection } from "discord.js";

export default class Bot extends Client {
    utils = new Utils(this);
    commands = new Collection<string, MySlashCommand>();

    constructor(options: ClientOptions) {
        super(options);
    }

    async loadCommands() {
        console.log("Loading commands...");
        const FILES = await this.utils.loadFiles("commands");
        this.commands.clear();

        let success = 0;
        for (const commandFile of FILES) {
            try {
                const { default: command } = await import(commandFile);
                this.commands.set(command.data.name, command);
                success++;
            } catch (error) {
                console.log(`Error loading command "${commandFile}"`, error);
            }
        }

        console.log(`(/) ${success}/${FILES.length} loaded commands`);
    }

    async loadEvents() {
        console.log("Loading events...");
        const FILES = await this.utils.loadFiles("events");
        this.removeAllListeners();

        let success = 0;
        for (const eventFile of FILES) {
            try {
                const { default: event } = await import(eventFile);
                if (event.name === "ready" || event.once) {
                    this.once(event.name, event.run);
                } else {
                    this.on(event.name, event.run);
                }
                success++;
            } catch (error) {
                console.log(`Error loading event "${eventFile}"`, error);
            }
        }

        console.log(`(/) ${success}/${FILES.length} loaded events`);
    }

    async init(token: string) {
        await Promise.all([this.loadEvents(), this.loadCommands()]);

        console.log("Login in...");
        await this.login(token);
    }
}
