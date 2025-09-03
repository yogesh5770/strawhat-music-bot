const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("history")
    .setDescription("View recently played songs and replay them")
    .addSubcommand(subcommand =>
      subcommand
        .setName("show")
        .setDescription("Show recent music history")
        .addIntegerOption(option =>
          option.setName("limit")
            .setDescription("Number of songs to show (1-20)")
            .setRequired(false)
            .setMinValue(1)
            .setMaxValue(20)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName("replay")
        .setDescription("Replay a song from history")
        .addIntegerOption(option =>
          option.setName("position")
            .setDescription("Position in history (1-20)")
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(20)
        )
    ),

  async execute(interaction, client) {
    const subcommand = interaction.options.getSubcommand();
    const voiceChannel = interaction.member.voice.channel;

    if (subcommand === "replay" && !voiceChannel) {
      return interaction.reply({
        content: "❌ You need to be in a voice channel to replay music!",
        ephemeral: true
      });
    }

    // Get history from DisTube (this is a simplified version)
    // In a real implementation, you'd store this in a database
    const history = getMusicHistory(interaction.guildId) || [];

    if (subcommand === "show") {
      const limit = interaction.options.getInteger("limit") || 10;
      const recentHistory = history.slice(0, limit);

      if (recentHistory.length === 0) {
        const embed = new EmbedBuilder()
          .setColor(0xFFA500)
          .setTitle("📚 Music History")
          .setDescription("No music has been played yet!")
          .addFields(
            { name: "🎵 Start Playing", value: "Use `/play` or `/smartplay` to add music", inline: false },
            { name: "📖 Commands", value: "• `/history show` - View history\n• `/history replay <#>` - Replay song", inline: false }
          )
          .setTimestamp();

        return interaction.reply({ embeds: [embed] });
      }

      const embed = new EmbedBuilder()
        .setColor(0x1DB954)
        .setTitle("📚 Recent Music History")
        .setDescription(`Showing last **${recentHistory.length}** songs played`)
        .setTimestamp();

      // Add history entries
      recentHistory.forEach((song, index) => {
        const position = index + 1;
        const duration = song.duration ? formatDuration(song.duration) : "Unknown";
        const source = song.source || "Unknown";
        
        embed.addFields({
          name: `${position}. ${song.name}`,
          value: `⏱️ ${duration} | 🎵 ${source} | 👤 ${song.requestedBy || "Unknown"}`,
          inline: false
        });
      });

      // Add replay buttons
      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('replay_1')
            .setLabel('🔄 Replay #1')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('replay_2')
            .setLabel('🔄 Replay #2')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('replay_3')
            .setLabel('🔄 Replay #3')
            .setStyle(ButtonStyle.Primary)
        );

      await interaction.reply({ embeds: [embed], components: [row] });

    } else if (subcommand === "replay") {
      const position = interaction.options.getInteger("position");
      const song = history[position - 1];

      if (!song) {
        return interaction.reply({
          content: `❌ No song found at position ${position}! Use \`/history show\` to see available songs.`,
          ephemeral: true
        });
      }

      try {
        await interaction.deferReply();

        const loadingEmbed = new EmbedBuilder()
          .setColor(0x7289DA)
          .setTitle("🔄 Replaying Song")
          .setDescription(`Loading: **${song.name}**`)
          .addFields(
            { name: "From History", value: `Position #${position}`, inline: true },
            { name: "Original Source", value: song.source || "Unknown", inline: true },
            { name: "Requested by", value: interaction.user.toString(), inline: true }
          )
          .setTimestamp();

        await interaction.editReply({ embeds: [loadingEmbed] });

        // Try to play the song
        await client.distube.play(voiceChannel, song.name, {
          member: interaction.member,
          textChannel: interaction.channel,
        });

        const successEmbed = new EmbedBuilder()
          .setColor(0x1DB954)
          .setTitle("✅ Song Replayed!")
          .setDescription(`**${song.name}** has been added to the queue from history!`)
          .addFields(
            { name: "History Position", value: `#${position}`, inline: true },
            { name: "Original Source", value: song.source || "Unknown", inline: true },
            { name: "Requested by", value: interaction.user.toString(), inline: true }
          )
          .setTimestamp();

        await interaction.editReply({ embeds: [successEmbed] });

      } catch (error) {
        console.error("Replay error:", error);
        
        const errorEmbed = new EmbedBuilder()
          .setColor(0xFF0000)
          .setTitle("❌ Replay Failed")
          .setDescription(`Could not replay **${song.name}** from history.`)
          .addFields(
            { name: "Error", value: error.message || "Unknown error", inline: false },
            { name: "💡 Try", value: "• Use `/play <song name>` instead\n• Check if song is still available", inline: false }
          )
          .setTimestamp();

        await interaction.editReply({ embeds: [errorEmbed] });
      }
    }
  },
};

// Helper function to get music history (simplified)
function getMusicHistory(guildId) {
  // In a real bot, you'd store this in a database
  // For now, return sample data
  return [
    {
      name: "Mascara",
      duration: 180,
      source: "Spotify",
      requestedBy: "User123",
      timestamp: Date.now() - 300000
    },
    {
      name: "Sonapareeya",
      duration: 200,
      source: "YouTube",
      requestedBy: "User456",
      timestamp: Date.now() - 600000
    }
  ];
}

// Helper function to format duration
function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
} 