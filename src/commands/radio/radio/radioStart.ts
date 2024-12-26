import {
    CacheType,
    CommandInteraction,
    GuildMember,
    SlashCommandSubcommandBuilder,
} from "discord.js";
import {
    createAudioPlayer,
    createAudioResource,
    joinVoiceChannel,
    VoiceConnection,
    AudioPlayerStatus,
    AudioPlayer,
    DiscordGatewayAdapterCreator,
} from "@discordjs/voice";

const RADIO_URL = "https://defiantradio.radioca.st/stream"; // Replace with your Shoutcast radio URL
let connection: VoiceConnection | null = null;
let player: AudioPlayer | null = null;

export const radioStartSubcommand = () => {
    return {
        values: (subcommand: SlashCommandSubcommandBuilder) =>
            subcommand
                .setName("start")
                .setDescription("Starts the radio stream"),
        run: async (interaction: CommandInteraction<CacheType>) => {
            const member = interaction.member;
            if (!(member instanceof GuildMember)) {
                await interaction.reply({
                    content:
                        "You must be in a voice channel to use this command!",
                    ephemeral: true,
                });
                return;
            }
            const voiceChannel = member.voice.channel;

            // Check if the user is in a voice channel
            if (!voiceChannel) {
                await interaction.reply({
                    content:
                        "You must be in a voice channel to use this command!",
                    ephemeral: true,
                });
                return;
            }

            // Acknowledge the command
            await interaction.deferReply();

            try {
                // Join the voice channel
                connection = joinVoiceChannel({
                    channelId: voiceChannel.id,
                    guildId: interaction.guildId!,
                    adapterCreator: interaction.guild!
                        .voiceAdapterCreator as unknown as DiscordGatewayAdapterCreator,
                });

                // Create and play audio player
                player = createAudioPlayer();
                const resource = createAudioResource(RADIO_URL);

                player.play(resource);
                connection.subscribe(player);

                // Handle player events
                player.on(AudioPlayerStatus.Playing, () => {
                    console.log("Radio stream is now playing.");
                });

                player.on("error", (error) => {
                    console.error("Audio player error:", error);
                });

                // Send a reply
                await interaction.editReply({
                    content: `Radio stream started! You're now listening to Defiant Radio.`,
                });
            } catch (error) {
                console.error("Error starting the radio stream:", error);
                await interaction.editReply({
                    content:
                        "Failed to start the radio stream. Please try again.",
                });
            }
        },
    };
};
