const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("nowplaying")
    .setDescription("Show the currently playing song"),

  async execute(interaction, client) {
    try {
      const connection = client.musicQueues.get(interaction.guild.id);
      
      if (!connection) {
        return interaction.reply({ 
          content: " No music is currently playing!", 
          ephemeral: true 
        });
      }

      // Get current song info from the queue
      const currentSong = client.currentSong?.get(interaction.guild.id);
      
      if (!currentSong) {
        return interaction.reply({ 
          content: " No song information available!", 
          ephemeral: true 
        });
      }

      const embed = new EmbedBuilder()
        .setColor(0x1DB954)
        .setTitle(" Now Playing")
        .setDescription(`**${currentSong.title}**`)
        .addFields(
          { name: "Duration", value: currentSong.durationRaw || "Unknown", inline: true },
          { name: "Requested by", value: currentSong.requestedBy?.toString() || "Unknown", inline: true }
        )
        .setThumbnail(currentSong.thumbnails?.[0]?.url)
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });

    } catch (error) {
      console.error("Nowplaying command error:", error);
      await interaction.reply({ 
        content: " An error occurred while getting song information!" 
      });
    }
  },
};
