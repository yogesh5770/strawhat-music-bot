const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("Show the current music queue"),

  async execute(interaction, client) {
    try {
      const queue = client.musicQueues.get(interaction.guild.id);
      
      if (!queue) {
        return interaction.reply({ 
          content: " No music queue found!", 
          ephemeral: true 
        });
      }

      // Get queue from client
      const musicQueue = client.songQueues?.get(interaction.guild.id) || [];
      
      if (musicQueue.length === 0) {
        return interaction.reply({ 
          content: " The queue is empty!", 
          ephemeral: true 
        });
      }

      const embed = new EmbedBuilder()
        .setColor(0x00BFFF)
        .setTitle(" Music Queue")
        .setDescription(`**${musicQueue.length}** songs in queue`)
        .setTimestamp();

      // Show first 10 songs
      const songsToShow = musicQueue.slice(0, 10);
      songsToShow.forEach((song, index) => {
        embed.addFields({
          name: `${index + 1}. ${song.title}`,
          value: `Duration: ${song.durationRaw || "Unknown"}`,
          inline: false
        });
      });

      if (musicQueue.length > 10) {
        embed.setFooter({ text: `And ${musicQueue.length - 10} more songs...` });
      }

      await interaction.reply({ embeds: [embed] });

    } catch (error) {
      console.error("Queue command error:", error);
      await interaction.reply({ 
        content: " An error occurred while showing the queue!" 
      });
    }
  },
};
