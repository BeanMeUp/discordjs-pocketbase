import { GuildMemberRoleManager } from "discord.js";
import { MyBotEvents } from "../types";
import { IBotLog, IBotOwner } from "../documents/types";

export default {
    name: "interactionCreate",

    async run(interaction) {
        if (!interaction.isCommand()) return;

        const command = interaction.client.commands.get(
            interaction.commandName
        );

        if (!command) {
            const log: IBotLog = {
                discordUserId: interaction.user.id,
                discordUsername: interaction.user.username,
                guildId: interaction.guildId as string,
                commandName: interaction.commandName,
                message: "Command Not Found",
            };

            if (interaction.replied) return;
            try {
                interaction.reply({
                    content:
                        "There was an error trying to find the command\nPlease try again later...",
                    ephemeral: true,
                });
            } catch (error) {}

            return;
        }

        const authPass = async () => {
            const allOwners: string[] = [];

            if (process.env.BOT_OWNERS) {
                const botOwners = process.env.BOT_OWNERS.split(",");
                botOwners.forEach((owner) => {
                    allOwners.push(owner);
                });
            }

            if (allOwners.includes(interaction.user.id)) return 1;
            if (command.onlyOwners) return 0;

            const member =
                interaction.member ??
                (await interaction.guild?.members.fetch(interaction.user.id));

            let rolesCheck = false;

            if (
                command.roles_req &&
                member?.roles instanceof GuildMemberRoleManager
            ) {
                rolesCheck = !!command.allRoles_req || false;
            } else rolesCheck = true;

            if (command.everthing_req) {
                if (rolesCheck) return 1;
            } else {
                if (rolesCheck) return 1;
            }

            return 0;
        };

        if (!(await authPass())) {
            const log: IBotLog = {
                discordUserId: interaction.user.id,
                discordUsername: interaction.user.username,
                guildId: interaction.guildId as string,
                commandName: interaction.commandName,
                message: "Unauthorized",
            };

            interaction.client.utils.embedReply(interaction, {
                color: "Red",
                author: { name: "⛔ Forbidden" },
                description:
                    "```\n \n" +
                    `> ${interaction.user.username}\n` +
                    "You do not have permissions to use this command.\n \n```",
            });
            return;
        }

        const identifier = `${interaction.commandName}-${interaction.user.id}`;

        const allOwners: string[] = [];

        if (process.env.BOT_OWNERS) {
            const botOwners = process.env.BOT_OWNERS.split(",");
            botOwners.forEach((owner) => {
                allOwners.push(owner);
            });
        }

        if (
            !allOwners.includes(interaction.user.id) &&
            !interaction.client.utils.rateLimitCheck(
                identifier,
                command.rateLimit,
                1
            )
        ) {
            const log: IBotLog = {
                discordUserId: interaction.user.id,
                discordUsername: interaction.user.username,
                guildId: interaction.guildId as string,
                commandName: interaction.commandName,
                message: "Exceeded Limit",
            };

            interaction.client.utils.embedReply(interaction, {
                color: "Yellow",
                author: { name: "🖐️ Wait" },
                description:
                    "```\n \n" +
                    `> ${interaction.user.username}\n` +
                    "You exceeded the limit of executions, try again later.\n \n```",
            });
            return;
        }

        const log: IBotLog = {
            discordUserId: interaction.user.id,
            discordUsername: interaction.user.username,
            guildId: interaction.guildId as string,
            commandName: interaction.commandName,
            message: "Command Start",
        };

        try {
            await command.run(interaction);
        } catch (error) {
            const log: IBotLog = {
                discordUserId: interaction.user.id,
                discordUsername: interaction.user.username,
                guildId: interaction.guildId as string,
                commandName: interaction.commandName,
                message: "Command Error",
            };

            console.error(error);

            try {
                if (interaction.replied || interaction.deferred) {
                    await interaction.editReply({
                        content: "There was an error executing the command.",
                    });
                } else {
                    await interaction.reply({
                        content: "There was an error executing the command.",
                        ephemeral: true,
                    });
                }
            } catch (innerError) {
                console.error(innerError);
            }
        }
    },
} as MyBotEvents<"interactionCreate">;
