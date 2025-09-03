const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("playlist")
    .setDescription("Play a full playlist from Spotify, YouTube, or SoundCloud")
    .addStringOption(option =>
      option.setName("url")
        .setDescription("Playlist URL (Spotify/YouTube/SoundCloud)")
        .setRequired(true)
    ),

  async execute(interaction, client) {
    const query = interaction.options.getString("url");
    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel) {
      return interaction.reply({
        content: "❌ You need to be in a voice channel to use this command!",
        ephemeral: true
      });
    }

    try {
      // Always defer first to avoid timeouts/duplicate acks
      await interaction.deferReply();

      // Show loading embed
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x7289DA)
            .setTitle("🔍 Searching Playlist...")
            .setDescription(`Loading songs from: **${query}**`)
            .setTimestamp()
        ]
      });

      // Distube automatically detects YouTube/Spotify/SoundCloud playlists
      await client.distube.play(voiceChannel, query, {
        member: interaction.member,
        textChannel: interaction.channel,
      });

      // Acknowledge success without relying on return value from play (v5)
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x1DB954)
            .setTitle("🎶 Playlist Queued!")
            .setDescription("✅ Your playlist has been added to the queue and will start playing.")
            .setTimestamp()
        ]
      });

    } catch (error) {
      console.error("Playlist command error:", error);

      const errorEmbed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle("❌ Error")
        .setDescription("Failed to load the playlist. Please check the URL and try again.")
        .setTimestamp();

      if (interaction.deferred) {
        await interaction.editReply({ embeds: [errorEmbed] });
      } else if (!interaction.replied) {
        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      }
    }
  },
};
