const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require('fs').promises;
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName("deleteplaylist")
    .setDescription("Delete one of your saved playlists")
    .addStringOption(option =>
      option.setName("name")
        .setDescription("Name of the playlist to delete")
        .setRequired(true)
    ),

  async execute(interaction, client) {
    const playlistName = interaction.options.getString("name");

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

      // Delete the playlist
      delete playlists[interaction.user.id][playlistName];

      // Save updated playlists
      await fs.writeFile(playlistsFile, JSON.stringify(playlists, null, 2));

      const embed = new EmbedBuilder()
        .setColor(0xFF6B6B)
        .setTitle("🗑️ Playlist Deleted!")
        .setDescription(`**${playlistName}** has been deleted successfully!`)
        .addFields(
          { name: "Songs Removed", value: `${playlist.songCount} songs`, inline: true },
          { name: "Duration", value: formatDuration(playlist.totalDuration), inline: true },
          { name: "Source", value: playlist.source || "Unknown", inline: true },
          { name: "Created", value: new Date(playlist.createdAt).toLocaleDateString(), inline: true }
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error("Delete playlist error:", error);
      
      const errorEmbed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle("❌ Error")
        .setDescription("Failed to delete the playlist. Please try again.")
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