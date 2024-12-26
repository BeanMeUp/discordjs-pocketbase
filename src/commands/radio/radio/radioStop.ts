import {
    CacheType,
    CommandInteraction,
    SlashCommandSubcommandBuilder,
} from "discord.js";
import {
    getVoiceConnection,
    VoiceConnection,
    AudioPlayer,
} from "@discordjs/voice";

let connection: VoiceConnection | null = null;
let player: AudioPlayer | null = null;

export const radioStopSubcommand = () => {
    return {
        values: (subcommand: SlashCommandSubcommandBuilder) =>
            subcommand.setName("stop").setDescription("Stops the radio"),
        run: async (interaction: CommandInteraction<CacheType>) => {
            // Defer reply to allow processing
            await interaction.deferReply({ ephemeral: true });

            // Fetch the active connection for the guild
            const guildConnection = getVoiceConnection(interaction.guildId!);

            if (guildConnection) {
                try {
                    // Stop the audio and destroy the connection
                    guildConnection.destroy();
                    connection = null;
                    player = null;

                    await interaction.editReply({
                        content:
                            "Radio has been stopped, and the bot has left the voice channel.",
                    });
                } catch (error) {
                    console.error("Error stopping the radio:", error);
                    await interaction.editReply({
                        content:
                            "An error occurred while trying to stop the radio. Please try again.",
                    });
                }
            } else {
                // Handle the case where no connection is found
                await interaction.editReply({
                    content: "The bot is not connected to a voice channel.",
                });
            }
        },
    };
};
