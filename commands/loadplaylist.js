const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require('fs').promises;
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName("loadplaylist")
    .setDescription("Load one of your saved playlists")
    .addStringOption(option =>
      option.setName("name")
        .setDescription("Name of the playlist to load")
        .setRequired(true)
    ),

  async execute(interaction, client) {
    const playlistName = interaction.options.getString("name");
    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel) {
      return interaction.reply({
        content: "❌ You need to be in a voice channel to use this command!",
        ephemeral: true
      });
    }

    try {
      await interaction.deferReply();

      // Load playlists
      const playlistsFile = path.join(__dirname, '..', 'playlists', 'user_playlists.json');
      let playlists = {};
      
      try {
        const data = await fs.readFile(playlistsFile, 'utf8');
        playlists = JSON.parse(data);
      } catch (error) {
        return interaction.editReply({
          content: "❌ You don't have any saved playlists yet!",
          ephemeral: true
        });
      }

      // Check if user has playlists
      if (!playlists[interaction.user.id] || Object.keys(playlists[interaction.user.id]).length === 0) {
        return interaction.editReply({
          content: "❌ You don't have any saved playlists yet!",
          ephemeral: true
        });
      }

      // Check if playlist exists
      if (!playlists[interaction.user.id][playlistName]) {
        const userPlaylists = Object.keys(playlists[interaction.user.id]);
        return interaction.editReply({
          content: `❌ Playlist **${playlistName}** not found!\n\n**Your playlists:**\n${userPlaylists.map(name => `• ${name}`).join('\n')}`,
          ephemeral: true
        });
      }

      const playlist = playlists[interaction.user.id][playlistName];
      
      // Show loading embed
      const loadingEmbed = new EmbedBuilder()
        .setColor(0x7289DA)
        .setTitle("🔄 Loading Playlist...")
        .setDescription(`Loading **${playlist.name}** (${playlist.songCount} songs)`)
        .setTimestamp();

      await interaction.editReply({ embeds: [loadingEmbed] });

      // Add songs to queue
      let addedCount = 0;
      let failedCount = 0;

      for (const song of playlist.songs) {
        try {
          await client.distube.play(voiceChannel, song.url, {
            member: interaction.member,
            textChannel: interaction.channel,
          });
          addedCount++;
        } catch (error) {
          console.error(`Failed to add song ${song.name}:`, error);
          failedCount++;
        }
      }

      // Show success embed
      const successEmbed = new EmbedBuilder()
        .setColor(0x1DB954)
        .setTitle("🎶 Playlist Loaded!")
        .setDescription(`**${playlist.name}** has been added to the queue!`)
        .addFields(
          { name: "Songs Added", value: `${addedCount} songs`, inline: true },
          { name: "Failed", value: `${failedCount} songs`, inline: true },
          { name: "Total Duration", value: formatDuration(playlist.totalDuration), inline: true },
          { name: "Created", value: new Date(playlist.createdAt).toLocaleDateString(), inline: true }
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [successEmbed] });

    } catch (error) {
      console.error("Load playlist error:", error);
      
      const errorEmbed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle("❌ Error")
        .setDescription("Failed to load the playlist. Please try again.")
        .setTimestamp();

      await interaction.editReply({ embeds: [errorEmbed] });
    }
  },
};

function formatDuration(ms) {
  if (typeof ms === 'string') return ms;
  
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}:${String(minutes % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  } else {
    return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
  }
} 