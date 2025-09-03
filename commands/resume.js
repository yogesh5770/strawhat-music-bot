const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { AudioPlayerStatus } = require("@discordjs/voice");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("resume")
    .setDescription("Resume the paused music"),

  async execute(interaction, client) {
    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel) {
      return interaction.reply({ 
        content: " You need to be in a voice channel to use this command!", 
        ephemeral: true 
      });
    }

    try {
      const connection = client.musicQueues.get(interaction.guild.id);
      
      if (!connection) {
        return interaction.reply({ 
          content: " No music is currently playing!", 
          ephemeral: true 
        });
      }

      const player = connection.state.subscription?.player;
      if (player && player.state.status === AudioPlayerStatus.Paused) {
        player.unpause();
        
        const embed = new EmbedBuilder()
          .setColor(0x00FF00)
          .setTitle(" Music Resumed")
          .setDescription("Music has been resumed.")
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      } else {
        await interaction.reply({ 
          content: " No music is currently paused!", 
          ephemeral: true 
        });
      }

    } catch (error) {
      console.error("Resume command error:", error);
      await interaction.reply({ 
        content: " An error occurred while resuming the music!" 
      });
    }
  },
};
