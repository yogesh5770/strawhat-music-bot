const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require('fs').promises;
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName("myplaylists")
    .setDescription("Show all your saved playlists"),

  async execute(interaction, client) {
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
          content: "❌ You don't have any saved playlists yet!\n\nUse `/saveplaylist` to save your first playlist!",
          ephemeral: true
        });
      }

      const userPlaylists = playlists[interaction.user.id];
      const playlistNames = Object.keys(userPlaylists);

      // Create embed with playlist list
      const embed = new EmbedBuilder()
        .setColor(0x1DB954)
        .setTitle("🎵 Your Saved Playlists")
        .setDescription(`You have **${playlistNames.length}** saved playlist(s)`)
        .setThumbnail(interaction.user.displayAvatarURL())
        .setTimestamp();

      // Add playlist fields
      playlistNames.forEach((name, index) => {
        const playlist = userPlaylists[name];
        const createdDate = new Date(playlist.createdAt).toLocaleDateString();
        const source = playlist.source || "Unknown";
        
        embed.addFields({
          name: `${index + 1}. ${name}`,
          value: `🎵 **${playlist.songCount} songs** | ⏱️ **${formatDuration(playlist.totalDuration)}** | 📅 **${createdDate}** | 📍 **${source}**`,
          inline: false
        });
      });

      // Add footer with usage instructions
      embed.setFooter({
        text: `Use /loadplaylist <name> to load a playlist • Use /deleteplaylist <name> to remove one`
      });

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error("My playlists error:", error);
      
      const errorEmbed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle("❌ Error")
        .setDescription("Failed to load your playlists. Please try again.")
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