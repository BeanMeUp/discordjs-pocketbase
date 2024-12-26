import { MySlashCommand } from "../../types";
import { CacheType, CommandInteraction, SlashCommandBuilder } from "discord.js";
import { radioStartSubcommand } from "./radio/radioStart";
import { radioStopSubcommand } from "./radio/radioStop";

export default {
    data: new SlashCommandBuilder()
        .setName("radio")
        .setDescription("Admin functions for Trader")
        .addSubcommand((subcommand) =>
            radioStartSubcommand().values(subcommand)
        )
        .addSubcommand((subcommand) =>
            radioStopSubcommand().values(subcommand)
        ),
    roles_req: "radio",
    allRoles_req: false,
    async run(interaction) {
        // @ts-ignore
        if (interaction.options.getSubcommand() === "start") {
            await radioStartSubcommand().run(interaction);
        }
        // @ts-ignore

        if (interaction.options.getSubcommand() === "stop") {
            await radioStopSubcommand().run(interaction);
        }
    },
} as MySlashCommand;
